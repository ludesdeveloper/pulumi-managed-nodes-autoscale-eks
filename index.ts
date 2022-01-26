import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";

// Create a VPC for our cluster.
const vpc = new awsx.ec2.Vpc("my-Vpc", {
    cidrBlock: "10.0.0.0/16",
});

// IAM roles for the node group.
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

// Create an EKS cluster.
const cluster = new eks.Cluster("my-cluster", {
    skipDefaultNodeGroup: true,
    vpcId: vpc.id,
    publicSubnetIds: vpc.publicSubnetIds,
    privateSubnetIds: vpc.privateSubnetIds,
    instanceRoles: [role],
});

// Create a simple AWS managed node group using a cluster as input.
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

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;
