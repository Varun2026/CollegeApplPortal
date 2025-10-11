/**
 * Azure Key Vault Service
 * 
 * This service handles all interactions with Azure Key Vault for:
 * - Secure key storage and retrieval
 * - Encryption and decryption operations
 * - Key rotation and management
 */

import { ClientSecretCredential } from '@azure/identity';
import { KeyClient, CryptographyClient } from '@azure/keyvault-keys';
import { SecretClient } from '@azure/keyvault-secrets';

class AzureKeyVaultService {
  constructor() {
    // Azure Key Vault configuration from environment variables
    this.tenantId = process.env.AZURE_TENANT_ID || 'demo-tenant-id';
    this.clientId = process.env.AZURE_CLIENT_ID || 'demo-client-id';
    this.clientSecret = process.env.AZURE_CLIENT_SECRET || 'demo-client-secret';
    this.keyVaultName = process.env.AZURE_KEY_VAULT_NAME || 'demo-keyvault';
    this.keyName = process.env.AZURE_KEY_NAME || 'college-app-encryption-key';
    
    // Check if we have real Azure credentials
    this.isConfigured = this.tenantId !== 'demo-tenant-id' && 
                       this.clientId !== 'demo-client-id' && 
                       this.clientSecret !== 'demo-client-secret';
    
    // Construct Key Vault URL
    this.keyVaultUrl = `https://${this.keyVaultName}.vault.azure.net/`;
    
    // Initialize Azure credentials only if configured
    if (this.isConfigured) {
      this.credential = new ClientSecretCredential(
        this.tenantId,
        this.clientId,
        this.clientSecret
      );
      
      // Initialize clients
      this.keyClient = new KeyClient(this.keyVaultUrl, this.credential);
      this.secretClient = new SecretClient(this.keyVaultUrl, this.credential);
    } else {
      console.warn('⚠️  Azure Key Vault not configured - using demo mode');
      this.credential = null;
      this.keyClient = null;
      this.secretClient = null;
    }
  }

  /**
   * Get a cryptography client for a specific key
   * @param {string} keyName - Name of the key in Key Vault
   * @returns {Promise<CryptographyClient>} Cryptography client instance
   */
  async getCryptoClient(keyName = this.keyName) {
    if (!this.isConfigured) {
      throw new Error('Azure Key Vault not configured - please set up your Azure credentials');
    }
    
    try {
      const key = await this.keyClient.getKey(keyName);
      return new CryptographyClient(key.id, this.credential);
    } catch (error) {
      console.error('Error getting crypto client:', error);
      throw new Error(`Failed to get cryptography client for key: ${keyName}`);
    }
  }

  /**
   * Encrypt data using Azure Key Vault
   * @param {Buffer} plaintext - Data to encrypt
   * @param {string} keyName - Key name to use for encryption
   * @returns {Promise<Buffer>} Encrypted data
   */
  async encryptData(plaintext, keyName = this.keyName) {
    try {
      const cryptoClient = await this.getCryptoClient(keyName);
      const result = await cryptoClient.encrypt('A256GCM', plaintext);
      return result.result;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data with Azure Key Vault');
    }
  }

  /**
   * Decrypt data using Azure Key Vault
   * @param {Buffer} ciphertext - Encrypted data
   * @param {string} keyName - Key name to use for decryption
   * @returns {Promise<Buffer>} Decrypted data
   */
  async decryptData(ciphertext, keyName = this.keyName) {
    try {
      const cryptoClient = await this.getCryptoClient(keyName);
      const result = await cryptoClient.decrypt('A256GCM', ciphertext);
      return result.result;
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data with Azure Key Vault');
    }
  }

  /**
   * Store a secret in Azure Key Vault
   * @param {string} secretName - Name of the secret
   * @param {string} secretValue - Value to store
   * @returns {Promise<void>}
   */
  async setSecret(secretName, secretValue) {
    try {
      await this.secretClient.setSecret(secretName, secretValue);
      console.log(`Secret '${secretName}' stored successfully in Key Vault`);
    } catch (error) {
      console.error('Error storing secret:', error);
      throw new Error(`Failed to store secret: ${secretName}`);
    }
  }

  /**
   * Retrieve a secret from Azure Key Vault
   * @param {string} secretName - Name of the secret
   * @returns {Promise<string>} Secret value
   */
  async getSecret(secretName) {
    try {
      const secret = await this.secretClient.getSecret(secretName);
      return secret.value;
    } catch (error) {
      console.error('Error retrieving secret:', error);
      throw new Error(`Failed to retrieve secret: ${secretName}`);
    }
  }

  /**
   * Create a new encryption key in Azure Key Vault
   * @param {string} keyName - Name for the new key
   * @param {string} keyType - Type of key (RSA, EC, etc.)
   * @returns {Promise<void>}
   */
  async createKey(keyName, keyType = 'RSA') {
    try {
      await this.keyClient.createKey(keyName, keyType);
      console.log(`Key '${keyName}' created successfully in Key Vault`);
    } catch (error) {
      console.error('Error creating key:', error);
      throw new Error(`Failed to create key: ${keyName}`);
    }
  }

  /**
   * Test connection to Azure Key Vault
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      await this.keyClient.getKey(this.keyName);
      return true;
    } catch (error) {
      console.error('Key Vault connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new AzureKeyVaultService();
