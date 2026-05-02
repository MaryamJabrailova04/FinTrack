output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "app_gateway_public_ip" {
  value = azurerm_public_ip.appgw.ip_address
}

output "app_gateway_fqdn" {
  value = azurerm_public_ip.appgw.fqdn
}

output "sql_server_fqdn" {
  value = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "application_insights_connection_string" {
  value     = azurerm_application_insights.main.connection_string
  sensitive = true
}

output "application_gateway_name" {
  value = azurerm_application_gateway.main.name
}

output "frontend_ilb_private_ip" {
  value = "10.40.2.10"
}

output "backend_ilb_private_ip" {
  value = "10.40.3.10"
}

output "ansible_public_ip" {
  value = azurerm_public_ip.ansible.ip_address
}

output "ansible_private_ip" {
  value = azurerm_network_interface.ansible.private_ip_address
}

output "sonarqube_private_ip" {
  value = azurerm_network_interface.sonarqube.private_ip_address
}

output "frontend_vmss_name" {
  value = azurerm_linux_virtual_machine_scale_set.frontend.name
}

output "backend_vmss_name" {
  value = azurerm_linux_virtual_machine_scale_set.backend.name
}

output "frontend_subnet_name" {
  value = azurerm_subnet.frontend.name
}

output "backend_subnet_name" {
  value = azurerm_subnet.backend.name
}

output "frontend_internal_load_balancer_name" {
  value = azurerm_lb.frontend.name
}

output "backend_internal_load_balancer_name" {
  value = azurerm_lb.backend.name
}