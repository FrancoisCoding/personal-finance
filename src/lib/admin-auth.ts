import { createHmac, timingSafeEqual } from 'crypto'

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
    getAdminEmail() && getAdminPassword() && getAdminSessionSecret()
  )
}

export const isValidAdminLogin = (email: string, password: string) => {
  return email === getAdminEmail() && password === getAdminPassword()
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
