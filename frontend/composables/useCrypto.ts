/**
 * AES-256-CBC encrypt/decrypt in browser using Web Crypto API
 * Format: "iv:encrypted" in hex, key in hex
 */
export function useDecrypt() {
  async function decryptText(encryptedText: string, hexKey: string): Promise<string> {
    try {
      const [ivHex, encrypted] = encryptedText.split(':')
      if (!ivHex || !encrypted) return encryptedText

      const iv = hexToBuffer(ivHex)
      const data = hexToBuffer(encrypted)
      const keyBuf = hexToBuffer(hexKey)

      const cryptoKey = await crypto.subtle.importKey(
        'raw', keyBuf, { name: 'AES-CBC' }, false, ['decrypt']
      )

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv }, cryptoKey, data
      )

      return new TextDecoder().decode(decrypted)
    } catch {
      return '(解密失敗)'
    }
  }

  async function encryptText(plainText: string, hexKey: string): Promise<string> {
    const keyBuf = hexToBuffer(hexKey)
    const iv = crypto.getRandomValues(new Uint8Array(16))
    const encoded = new TextEncoder().encode(plainText)

    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyBuf, { name: 'AES-CBC' }, false, ['encrypt']
    )

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv }, cryptoKey, encoded
    )

    return `${bufferToHex(iv.buffer)}:${bufferToHex(encrypted)}`
  }

  function hexToBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }
    return bytes.buffer
  }

  function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  return { decryptText, encryptText }
}
