variable "project" {
  type    = string
  default = "fintrack"
}

variable "owner" {
  type    = string
  default = "group4f"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "location" {
  type        = string
  description = "Use an allowed Azure region. centralindia is allowed by the project restriction list."
  default     = "centralindia"
}

variable "address_space" {
  type    = list(string)
  default = ["10.40.0.0/16"]
}

variable "admin_username" {
  type    = string
  default = "azureuser"
}

variable "admin_source_prefix" {
  type        = string
  description = "Admin public IP/CIDR allowed to SSH to ops resources. Example: 203.0.113.10/32."
}

variable "ssh_public_key" {
  type        = string
  description = "Public SSH key used for VM/VMSS admin access from snet-ops/Bastion."
}

variable "sql_admin_login" {
  type    = string
  default = "sqladminuser"
}

variable "sql_admin_password" {
  type        = string
  sensitive   = true
  description = "Store this in GitHub Actions secrets or Key Vault, never in git."
}

variable "frontend_instance_count" {
  type    = number
  default = 1
}

variable "backend_instance_count" {
  type    = number
  default = 1
}

variable "vm_size" {
  type    = string
  default = "Standard_D2s_v3"
}

variable "appgw_ssl_certificate_data" {
  type        = string
  sensitive   = true
  description = "Base64-encoded PFX certificate data for the Application Gateway HTTPS listener."
}

variable "appgw_ssl_certificate_password" {
  type        = string
  sensitive   = true
  description = "Password for the Application Gateway PFX certificate."
}