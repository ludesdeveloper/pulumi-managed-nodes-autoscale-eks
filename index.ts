import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";

const vpc = new awsx.ec2.Vpc("my-Vpc", {
    cidrBlock: "10.0.0.0/16",
});

const role = new aws.iam.Role("my-cluster-ng-role", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "ec2.amazonaws.com",
    }),
});
let counter = 0;
for (const policyArn of [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
]) {
    new aws.iam.RolePolicyAttachment(`my-cluster-ng-role-policy-${counter++}`,
        { policyArn, role },
    );
}

const cluster = new eks.Cluster("my-cluster", {
    skipDefaultNodeGroup: true,
    vpcId: vpc.id,
    publicSubnetIds: vpc.publicSubnetIds,
    privateSubnetIds: vpc.privateSubnetIds,
    instanceRoles: [role],
    createOidcProvider: true
});

const managedNodeGroup = eks.createManagedNodeGroup("my-cluster-ng", {
    cluster: cluster,
    nodeGroupName: "aws-managed-ng1",
    nodeRoleArn: role.arn,
    //labels: { "ondemand": "true" },
    labels: { "preemptible": "true" },
    tags: { "org": "pulumi" },
    capacityType: "SPOT",
    instanceTypes: ["t2.medium"],
    scalingConfig: {
        desiredSize: 1,
        maxSize: 3,
        minSize: 1,
    },
}, cluster);

const autoscalingPolicy = new aws.iam.Policy("AmazonEKSClusterAutoscalerPolicy", {
    policy: pulumi.interpolate`{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "autoscaling:DescribeAutoScalingGroups",
                "autoscaling:DescribeAutoScalingInstances",
                "autoscaling:DescribeLaunchConfigurations",
                "autoscaling:DescribeTags",
                "autoscaling:SetDesiredCapacity",
                "autoscaling:TerminateInstanceInAutoScalingGroup",
                "ec2:DescribeLaunchTemplateVersions"
            ],
            "Resource": "*",
            "Effect": "Allow"
        }
    ]
}
`
});

const autoscalingRole = new aws.iam.Role("AmazonEKSClusterAutoscalerRole", {
    path: "/system/",
    assumeRolePolicy: pulumi.interpolate`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "${cluster.core.oidcProvider!.arn}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${cluster.core.oidcProvider!.url}:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
`
});

const attachPolicytoRole = new aws.iam.RolePolicyAttachment("attach-policy-to-role", {
    role: autoscalingRole.name,
    policyArn: autoscalingPolicy.arn,
});

export const kubeConfig = cluster.kubeconfig
export const clusterName = cluster.eksCluster.name
export const roleArn = autoscalingRole.arn
