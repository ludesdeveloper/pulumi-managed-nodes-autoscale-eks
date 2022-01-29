helm install autoscaler ./autoscaler-chart --set clusterName=$(pulumi stack output clusterName)
kubectl annotate serviceaccount cluster-autoscaler -n kube-system eks.amazonaws.com/role-arn=$(pulumi stack output roleArn)
kubectl patch deployment cluster-autoscaler -n kube-system -p '{"spec":{"template":{"metadata":{"annotations":{"cluster-autoscaler.kubernetes.io/safe-to-evict": "false"}}}}}'
kubectl set image deployment cluster-autoscaler -n kube-system cluster-autoscaler=k8s.gcr.io/autoscaling/cluster-autoscaler:$(kubectl version --short | awk 'NR==2 {print $3}' | grep -E 'v\d+.\d+.\d')

