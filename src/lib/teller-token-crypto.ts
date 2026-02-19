import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto'

const tellerAccessTokenPrefix = 'enc:v1:'
const tellerIvLength = 12

const getEncryptionSecret = () =>
  process.env.TELLER_TOKEN_ENCRYPTION_KEY?.trim() || ''

const getEncryptionKey = () => {
  const secret = getEncryptionSecret()
  if (!secret) {
    throw new Error(
      'TELLER_TOKEN_ENCRYPTION_KEY is required for Teller token encryption.'
    )
  }
  return createHash('sha256').update(secret).digest()
}

export const isEncryptedTellerAccessToken = (value: string) =>
  value.startsWith(tellerAccessTokenPrefix)

export const encryptTellerAccessToken = (accessToken: string) => {
  if (isEncryptedTellerAccessToken(accessToken)) {
    return accessToken
  }

  const key = getEncryptionKey()
  const iv = randomBytes(tellerIvLength)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([
    cipher.update(accessToken, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return `${tellerAccessTokenPrefix}${iv.toString('base64')}.${authTag.toString(
    'base64'
  )}.${ciphertext.toString('base64')}`
}

export const decryptTellerAccessToken = (encodedAccessToken: string) => {
  if (!isEncryptedTellerAccessToken(encodedAccessToken)) {
    return encodedAccessToken
  }

  const payload = encodedAccessToken.slice(tellerAccessTokenPrefix.length)
  const segments = payload.split('.')
  if (segments.length !== 3) {
    throw new Error('Invalid encrypted Teller token payload.')
  }

  const [ivBase64, authTagBase64, ciphertextBase64] = segments
  const key = getEncryptionKey()
  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')
  const ciphertext = Buffer.from(ciphertextBase64, 'base64')
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])
  return plaintext.toString('utf8')
}
