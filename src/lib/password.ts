import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const passwordHashAlgorithmPrefix = 'scrypt'

export const hashPassword = (password: string) => {
  const salt = randomBytes(16)
  const derivedKey = scryptSync(password, salt, 64)
  return `${passwordHashAlgorithmPrefix}$${salt.toString('base64')}$${derivedKey.toString('base64')}`
}

export const verifyPassword = (password: string, storedHash: string) => {
  const segments = storedHash.split('$')
  if (segments.length !== 3 || segments[0] !== passwordHashAlgorithmPrefix) {
    return false
  }

  const saltBase64 = segments[1]
  const keyBase64 = segments[2]
  if (!saltBase64 || !keyBase64) {
    return false
  }

  try {
    const salt = Buffer.from(saltBase64, 'base64')
    const expectedKey = Buffer.from(keyBase64, 'base64')
    const computedKey = scryptSync(password, salt, expectedKey.length)
    return timingSafeEqual(computedKey, expectedKey)
  } catch {
    return false
  }
}
