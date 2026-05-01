terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.116"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Configure these values after the remote-state storage account is created.
  # backend "azurerm" {
  #   resource_group_name  = "rg-tfstate-group4f"
  #   storage_account_name = "sttfstategroup4f"
  #   container_name       = "tfstate"
  #   key                  = "fintrack-dev.tfstate"
  # }
}