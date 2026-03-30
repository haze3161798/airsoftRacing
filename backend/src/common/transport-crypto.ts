import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-cbc';

/**
 * Generate a random 32-byte transport key (hex encoded)
 */
export function generateTransportKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Encrypt text with a given hex key for transport
 */
export function transportEncrypt(text: string, hexKey: string): string {
  const key = Buffer.from(hexKey, 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt text with a given hex key (for testing/backend use)
 */
export function transportDecrypt(encryptedText: string, hexKey: string): string {
  const key = Buffer.from(hexKey, 'hex');
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) return encryptedText;
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
