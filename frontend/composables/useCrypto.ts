/**
 * AES-256-CBC decrypt in browser using Web Crypto API
 * Expects "iv:encrypted" in hex format, key in hex
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

  function hexToBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }
    return bytes.buffer
  }

  return { decryptText }
}
