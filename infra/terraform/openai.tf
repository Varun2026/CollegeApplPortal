resource "azurerm_cognitive_account" "openai" {
  name                = "collegevaultopenai"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "OpenAI"
  sku_name            = "S0"
}
