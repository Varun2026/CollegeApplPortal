/**
 * EncryptUtils.js - Client-side AES-GCM Encryption Utilities
 * 
 * This module provides encryption and decryption functions using the Web Crypto API
 * with AES-GCM 256-bit encryption for securing college application data.
 * 
 * DEMO VERSION: Uses a temporary encryption key for demonstration purposes.
 * In production, integrate with Azure Key Vault for secure key management.
 */

// ⚠️ CRITICAL SECURITY WARNING - DEMO ONLY ⚠️
// This demo uses a hardcoded key that is visible to anyone inspecting the browser code.
// This means ALL encrypted applications can be decrypted by ANY user who accesses the application.
// This is INTENTIONAL for demonstration purposes to show the encryption flow.
//
// FOR PRODUCTION:
// - NEVER use hardcoded keys in client-side code
// - Integrate with Azure Key Vault for secure key management
// - Implement proper authentication and authorization
// - Use server-side key management with per-user or per-session keys
// - This current implementation does NOT provide real security
const DEMO_KEY_MATERIAL = "demo-college-app-encryption-key-32bytes!!";

/**
 * Generates a CryptoKey from the demo key material
 */
async function getDemoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(DEMO_KEY_MATERIAL.padEnd(32, '0').substring(0, 32));
  
  return await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates a random Initialization Vector (IV) for encryption
 * @returns Uint8Array of 12 bytes (96 bits) - recommended for AES-GCM
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Converts ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypts data using AES-GCM encryption
 * 
 * @param data - The data object to encrypt (will be JSON stringified)
 * @param iv - Initialization Vector (must be unique for each encryption)
 * @returns Base64 encoded encrypted data
 */
export async function encryptData(data: any, iv: Uint8Array): Promise<string> {
  try {
    const key = await getDemoKey();
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const encodedData = encoder.encode(dataString);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    return arrayBufferToBase64(encryptedData);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts AES-GCM encrypted data
 * 
 * @param encryptedData - Base64 encoded encrypted data
 * @param iv - The same Initialization Vector used for encryption
 * @returns Decrypted data object
 */
export async function decryptData(encryptedData: string, iv: string): Promise<any> {
  try {
    const key = await getDemoKey();
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const ivBuffer = base64ToArrayBuffer(iv);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer),
      },
      key,
      encryptedBuffer
    );

    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedData);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Converts Uint8Array IV to Base64 string for storage/transmission
 */
export function ivToBase64(iv: Uint8Array): string {
  return arrayBufferToBase64(iv.buffer);
}

/**
 * Validates file type (PDF or JPG only)
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg'];
  return allowedTypes.includes(file.type);
}

/**
 * Validates file size (max 10MB)
 */
export function validateFileSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  return file.size <= maxSize;
}

/**
 * Converts File to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
