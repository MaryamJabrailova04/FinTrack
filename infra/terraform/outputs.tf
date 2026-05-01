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