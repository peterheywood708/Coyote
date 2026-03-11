# Coyote

## Kubernetes configuration

1. Uses ESO for AWS secrets manager to retrieve confidential configuration information for applications running in the cluster such as Cognito access
2. To use ESO, you need to run kubectl create secret generic awssm-secret --from-literal=access-key=<ACCESS-KEY> --from-literal=secret-access-key=<SECRET_KEY> -n external-secrets
3. Replace <ACCESS-KEY> and <SECRET_KEY> from the above command line with the IAM user with access key configured
