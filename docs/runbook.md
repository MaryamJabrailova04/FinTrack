# FinTrack Runbook

## 1. Prepare Azure Login

```bash
az login
az account set --subscription "<subscription-id>"
```

## 2. Terraform

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt -recursive
terraform validate
terraform plan
terraform apply
terraform output
```

Use names containing `group4f` so the resources stand apart from the existing `group4b` deployment.

## 3. Ansible

Update `config/ansible/inventories/dev/hosts.ini` with private VM IPs from Terraform.

Update `config/ansible/inventories/dev/group_vars/all.yml` or use Ansible Vault for:

```text
django_secret_key
db_host
db_name
db_user
db_password
django_allowed_hosts
cors_allowed_origins
applicationinsights_connection_string
```

Run:

```bash
cd config/ansible
ansible all -i inventories/dev/hosts.ini -m ping
ansible-playbook -i inventories/dev/hosts.ini playbooks/site.yml
```

## 4. GitHub Actions Secrets

Required:

```text
AZURE_CREDENTIALS
SSH_PUBLIC_KEY
SQL_ADMIN_PASSWORD
VM_USER
FRONTEND_PRIVATE_IP
BACKEND_PRIVATE_IP
VITE_API_URL
VITE_GOOGLE_CLIENT_ID
```

Optional SonarQube:

```text
SONAR_HOST_URL
SONAR_TOKEN
```

Use a self-hosted GitHub runner in the VNet/ops subnet because GitHub-hosted runners cannot reach private VM IPs.

## 5. App Gateway Rules

Configure routing as:

```text
HTTPS listener 443
/       -> frontend backend pool, port 80, probe /
/api/*  -> backend backend pool, port 80, probe /api/health/
```

## 6. Monitoring

Minimum alerts:

```text
Application Gateway unhealthy backend count > 0 for 5 minutes
Frontend or frontend VMSS CPU > 70% for 5 minutes
Backend or backend VMSS CPU > 70% for 5 minutes
SQL cpu_percent > 80% for 5 minutes
```

## 7. Demo Script

1. Show the architecture diagram in `README.md`.
2. Show Azure resource group with VNet, App Gateway, compute, SQL, private endpoint, Log Analytics, and App Insights.
3. Prove compute has no public IPs.
4. Prove SQL public network access is disabled.
5. Open `https://<appgw-fqdn>/` and show FinTrack frontend.
6. Call `https://<appgw-fqdn>/api/health/`.
7. Create or read a record through the FinTrack UI/API.
8. Show App Gateway backend health and alert rules.
9. Show GitHub Actions runs for infra, frontend, and backend.
## Verify separated frontend/backend VMSS

Terraform creates separate compute tiers:

```text
Frontend VMSS: vmss-frontend-group4f-dev, subnet snet-frontend, ILB 10.40.2.10
Backend VMSS:  vmss-backend-group4f-dev, subnet snet-backend, ILB 10.40.3.10
```

After apply, verify:

```bash
terraform output frontend_vmss_name
terraform output backend_vmss_name
terraform output frontend_internal_load_balancer_name
terraform output backend_internal_load_balancer_name
```

Application Gateway routing must stay:

```text
/      -> frontend-pool -> frontend ILB -> frontend VMSS
/api/* -> backend-pool  -> backend ILB  -> backend VMSS
```
