provider "azurerm" {
  features = {}
}

resource "azurerm_resource_group" "main" {
  name     = "collegevault-rg"
  location = "East US"
}

resource "azurerm_key_vault" "main" {
  name                = "collegevaultkv"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tenant_id           = "<your-tenant-id>"
  sku_name            = "standard"
}

resource "azurerm_sql_server" "main" {
  name                         = "collegevaultsql"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = "<your-password>"
}
