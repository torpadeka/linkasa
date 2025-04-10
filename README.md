# Current Deployment

Access the deployed frontend site here: http://57.158.146.94:8080/login

# What Was Done Here?

The Azure cloud services were planned and deployed using Terraform.

And with an AKS Cluster service deployed, Kubernetes manifest files were used with the **kubectl** CLI to deploy the containerized applications on the Azure Container Registry on the cloud.

Of course, this goes without saying but, since this is only a test run, no actual security measures are implemented for authentication, as the secret is publicly available in the source code and there is not even password encrypting. This is just a quickly hacked together app to be deployed on the cloud. Therefore, **please do not enter sensitive information to the site!**.

