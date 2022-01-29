# **PROVISION MANAGED NODES AUTOSCALE EKS WITH PULUMI**
<p align="center">
<img src="pic/ludes.png" width="500">
</p>

### **Requirement**
1. [AWS CLI installed](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. [Configure AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-config)
3. [Pulumi installed](https://www.pulumi.com/docs/get-started/install/)
4. [Pulumi logged in](https://www.pulumi.com/docs/reference/cli/pulumi_login/)
5. [Helm instaled](https://helm.sh/docs/intro/install/)
6. [NPM installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
7. [Kubectl installed](https://kubernetes.io/docs/tasks/tools/)
### **How To**
1. Clone repository
```
git clone https://github.com/ludesdeveloper/pulumi-managed-nodes-autoscale-eks.git 
```
2. Change directory
```
cd pulumi-managed-nodes-autoscale-eks
```
3. Install dependencies
```
npm install
```
4. Initialize Pulumi stack
```
pulumi stack init
```
5. Set Pulumi region
```
pulumi config set aws:region ap-southeast-1
```
6. Provision EKS with pulumi
```
pulumi up --yes
```
> Give name of your stack, (dev) or other name you prefered
7. Copy kubeconfig to your kubeconfig directory (warning, this will replace your kubeconfig file)
```
pulumi stack output kubeConfig > ~/.kube/config
```
8. Make sure your cluster is ready
```
kubectl get nodes
```
9. You can run script below to apply cluster autoscaler or manually copy paste line inside init-autoscale-cluster.sh script
```
./init-autoscale-cluster.sh
```
### **Before Testing**
1. Usually when testing, I open 3 tabs terminal to check, and every check consist of : auto scale log
```
kubectl -n kube-system logs -f deployment.apps/cluster-autoscaler
```
2. Check Nodes
```
watch kubectl get nodes
```
3. Check Pods
```
watch kubectl get pods -o wide
```
### **Testing**
1. Apply nginx-deployment
```
kubectl apply -f nginx-deployment.yaml
```
2. Scale up nginx pod
```
kubectl scale deployment/nginx-deployment --replicas=20
```
> You will see pending in your pod, and kubernetes will trigger scale up for nodes, wait for a while. You also can check in your
EC2 dashboard AWS, AWS will try to create new instance
3. Scale down nginx pod
```
kubectl scale deployment/nginx-deployment --replicas=3
```
> Scale down will takes time around 10 minutes, until cluster remove unnecessary nodes 
### **Cleanup**
1. Destroy pulumi
```
pulumi destroy --yes
```
2. Remove pulumi stack
```
pulumi stack rm dev
```
> Type name of your stack
### **Source Articles**
[How to Scale Your Amazon EKS Cluster: EC2, Managed Node Groups, and Fargate](https://www.pulumi.com/blog/aws-eks-managed-nodes-fargate/)

[Amazon EKS Pulumi Crosswalk](https://www.pulumi.com/registry/packages/eks/api-docs/#ClusterOptions)

[Autoscaling - Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/autoscaling.html)
