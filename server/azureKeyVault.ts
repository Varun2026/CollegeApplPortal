import { ClientSecretCredential } from "@azure/identity";
import { KeyClient, CryptographyClient } from "@azure/keyvault-keys";

const tenantId = process.env.AZURE_TENANT_ID!;
const clientId = process.env.AZURE_CLIENT_ID!;
const clientSecret = process.env.AZURE_CLIENT_SECRET!;
const keyVaultUrl = process.env.AZURE_KEY_VAULT_URL!;

const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
const keyClient = new KeyClient(keyVaultUrl, credential);

export async function getCryptoClient(keyName: string) {
  const key = await keyClient.getKey(keyName);
  return new CryptographyClient(key.id!, credential);
}

export async function encryptDataWithKeyVault(plaintext: Buffer) {
  const cryptoClient = await getCryptoClient(process.env.AZURE_KEY_NAME!);
  const result = await cryptoClient.encrypt("A256GCM", plaintext);
  return result.result;
}

export async function decryptDataWithKeyVault(ciphertext: Buffer) {
  const cryptoClient = await getCryptoClient(process.env.AZURE_KEY_NAME!);
  const result = await cryptoClient.decrypt("A256GCM", ciphertext);
  return result.result;
}

// Fallback for local testing
export function encryptDataLocally(plaintext: Buffer, key: Buffer, iv: Buffer) {
  // ...your AES-GCM local encryption logic...
}

export function decryptDataLocally(ciphertext: Buffer, key: Buffer, iv: Buffer) {
  // ...your AES-GCM local decryption logic...
}
