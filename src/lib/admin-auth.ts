import { createHmac, scryptSync, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

export const adminSessionCookieName = 'financeflow-admin-session'

const adminSessionDurationMs = 1000 * 60 * 60 * 12

interface IAdminSessionPayload {
  email: string
  expiresAt: number
}

interface ICookieStore {
  get: (name: string) => { value: string } | undefined
}

const getAdminEmail = () => process.env.ADMIN_EMAIL ?? ''
const getAdminPassword = () => process.env.ADMIN_PASSWORD ?? ''
const getAdminPasswordHash = () => process.env.ADMIN_PASSWORD_HASH ?? ''
const getAdminSessionSecret = () => process.env.ADMIN_SESSION_SECRET ?? ''

const createPayloadSignature = (payload: string, secret: string) => {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

const toBase64Url = (value: string) => {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4
  const paddedValue =
    padding === 0 ? normalized : normalized + '='.repeat(4 - padding)
  return Buffer.from(paddedValue, 'base64').toString('utf8')
}

export const hasAdminCredentialsConfigured = () => {
  return Boolean(
    getAdminEmail() &&
      (getAdminPassword() || getAdminPasswordHash()) &&
      getAdminSessionSecret()
  )
}

const verifyScryptPasswordHash = (password: string, encodedHash: string) => {
  const segments = encodedHash.split('$')
  if (segments.length !== 3 || segments[0] !== 'scrypt') {
    return false
  }

  const [, saltBase64, keyBase64] = segments

  try {
    const salt = Buffer.from(saltBase64, 'base64')
    const expectedKey = Buffer.from(keyBase64, 'base64')
    const computedKey = scryptSync(password, salt, expectedKey.length)
    return timingSafeEqual(computedKey, expectedKey)
  } catch {
    return false
  }
}

const verifyRawPassword = (password: string, configuredPassword: string) => {
  if (!configuredPassword) return false

  const providedPasswordBuffer = Buffer.from(password, 'utf8')
  const configuredPasswordBuffer = Buffer.from(configuredPassword, 'utf8')
  if (providedPasswordBuffer.length !== configuredPasswordBuffer.length) {
    return false
  }

  return timingSafeEqual(providedPasswordBuffer, configuredPasswordBuffer)
}

const isValidAdminPassword = (password: string) => {
  const storedPasswordHash = getAdminPasswordHash().trim()
  const configuredPassword = getAdminPassword()

  if (storedPasswordHash) {
    const isHashMatch = verifyScryptPasswordHash(password, storedPasswordHash)
    if (isHashMatch) {
      return true
    }
  }

  return verifyRawPassword(password, configuredPassword)
}

export const isValidAdminLogin = (email: string, password: string) => {
  const normalizedConfiguredEmail = getAdminEmail().trim().toLowerCase()
  const normalizedProvidedEmail = email.trim().toLowerCase()
  if (!normalizedConfiguredEmail || !normalizedProvidedEmail) {
    return false
  }
  if (normalizedConfiguredEmail !== normalizedProvidedEmail) {
    return false
  }
  return isValidAdminPassword(password)
}

const getAllowedOrigins = () => {
  const values = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '',
  ]

  return new Set(
    values
      .map((value) => {
        if (!value) return ''
        try {
          return new URL(value).origin
        } catch {
          return ''
        }
      })
      .filter(Boolean)
  )
}

export const isSameOriginAdminRequest = (request: NextRequest) => {
  const originHeader = request.headers.get('origin')
  if (!originHeader) return false

  const requestOrigin = request.nextUrl.origin
  if (originHeader === requestOrigin) {
    return true
  }

  const allowedOrigins = getAllowedOrigins()
  return allowedOrigins.has(originHeader)
}

export const createAdminSessionToken = (email: string) => {
  const sessionSecret = getAdminSessionSecret()
  const payload: IAdminSessionPayload = {
    email,
    expiresAt: Date.now() + adminSessionDurationMs,
  }
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = createPayloadSignature(encodedPayload, sessionSecret)
  return `${encodedPayload}.${signature}`
}

export const verifyAdminSessionToken = (token: string | undefined | null) => {
  if (!token) return false
  const sessionSecret = getAdminSessionSecret()
  if (!sessionSecret) return false

  const segments = token.split('.')
  if (segments.length !== 2) return false

  const [encodedPayload, signature] = segments
  const expectedSignature = createPayloadSignature(
    encodedPayload,
    sessionSecret
  )

  try {
    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex')
    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      return false
    }
  } catch {
    return false
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(encodedPayload)
    ) as IAdminSessionPayload
    if (!payload?.email || !payload?.expiresAt) return false
    if (payload.email !== getAdminEmail()) return false
    if (payload.expiresAt < Date.now()) return false
    return true
  } catch {
    return false
  }
}

export const isAdminAuthenticated = (cookieStore: ICookieStore) => {
  const token = cookieStore.get(adminSessionCookieName)?.value
  return verifyAdminSessionToken(token)
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 12,
}
