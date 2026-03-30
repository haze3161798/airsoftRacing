import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-cbc';

function getKey(): Buffer {
  const secret = process.env.JWT_SECRET || 'dev-local-secret-key-2026';
  // Derive a 32-byte key from the secret
  return Buffer.from(secret.padEnd(32, '0').slice(0, 32), 'utf-8');
}

/**
 * AES-256-CBC encrypt. Returns "iv:encrypted" in hex.
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * AES-256-CBC decrypt. Expects "iv:encrypted" in hex.
 */
export function decrypt(encryptedText: string): string {
  const key = getKey();
  const [ivHex, encrypted] = encryptedText.split(':');
  if (!ivHex || !encrypted) return encryptedText; // fallback for old hash data
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
