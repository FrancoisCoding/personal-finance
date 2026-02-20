import { createHash, randomBytes } from 'crypto'

const passwordResetTokenLengthBytes = 32

export const createPasswordResetToken = () => {
  return randomBytes(passwordResetTokenLengthBytes).toString('hex')
}

export const hashPasswordResetToken = (token: string) => {
  return createHash('sha256').update(token).digest('hex')
}

export const getPasswordResetExpiry = (minutes = 60) => {
  return new Date(Date.now() + minutes * 60_000)
}
