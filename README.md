# **PROVISION MANAGED AUTOSCALE EKS WITH PULUMI**
### **Requirement**
1. [AWS CLI installed](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. [Configure AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-config)
3. [Pulumi installed](https://www.pulumi.com/docs/get-started/install/)
4. [Pulumi logged in](https://www.pulumi.com/docs/reference/cli/pulumi_login/)
5. [Helm instaled](https://helm.sh/docs/intro/install/)
6. [NPM installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
### **How To**
1. Clone repository
```
git clone https://github.com/ludesdeveloper/pulumi-eks-managed-nodes.git
```
2. Change directory
```
cd pulumi-eks-managed-nodes
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
9. You can run script below to apply cluster autoscaler or manually copy paste line inside k8scluster.sh script
```
./k8scluster.sh
```
