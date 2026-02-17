import type { Session } from 'next-auth'

export const DEMO_MODE_COOKIE = 'demo_mode'
const DEMO_MODE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export const demoSession: Session = {
  user: {
    id: 'demo-user',
    name: 'Demo User',
    email: 'demo@finance.app',
  },
  expires: '9999-12-31T23:59:59.999Z',
}

export const isDemoModeRequest = (request: Request) => {
  const cookieHeader = request.headers.get('cookie') ?? ''
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie.startsWith(`${DEMO_MODE_COOKIE}=1`))
}

export const isDemoModeClient = () => {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .some((cookie) => cookie.startsWith(`${DEMO_MODE_COOKIE}=1`))
}

export const enableDemoMode = () => {
  if (typeof document === 'undefined') return
  document.cookie = `${DEMO_MODE_COOKIE}=1; path=/; max-age=${DEMO_MODE_MAX_AGE_SECONDS}; samesite=lax`
  localStorage.setItem('finance-demo-mode', '1')
}

export const disableDemoMode = () => {
  if (typeof document === 'undefined') return
  document.cookie = `${DEMO_MODE_COOKIE}=; path=/; max-age=0; samesite=lax`
  localStorage.removeItem('finance-demo-mode')
}
