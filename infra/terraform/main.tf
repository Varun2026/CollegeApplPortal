resource "azurerm_resource_group" "rg" {
name = var.resource_group_name
location = var.location
}


resource "azurerm_container_registry" "acr" {
name = var.acr_name
resource_group_name = azurerm_resource_group.rg.name
location = azurerm_resource_group.rg.location
sku = "Basic"
admin_enabled = false
}


resource "azurerm_key_vault" "kv" {
name = var.keyvault_name
location = azurerm_resource_group.rg.location
resource_group_name = azurerm_resource_group.rg.name
tenant_id = data.azurerm_client_config.current.tenant_id
sku_name = "standard"
purge_protection_enabled = false
soft_delete_enabled = true
}


data "azurerm_client_config" "current" {}


resource "azurerm_kubernetes_cluster" "aks" {
name = var.aks_name
location = azurerm_resource_group.rg.location
resource_group_name = azurerm_resource_group.rg.name
default_node_pool {
name = "agentpool"
node_count = 1
vm_size = "Standard_DS2_v2"
}


identity {
type = "SystemAssigned"
}
}


resource "azurerm_role_assignment" "acr_pull" {
scope = azurerm_container_registry.acr.id
role_definition_name = "AcrPull"
principal_id = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
}


output "acr_login_server" {
value = azurerm_container_registry.acr.login_server
}


output "aks_name" {
value = azurerm_kubernetes_cluster.aks.name
}


output "keyvault_uri" {
value = azurerm_key_vault.kv.vault_uri
}