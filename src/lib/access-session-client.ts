const accessSessionStorageKey = 'financeflow.access-session-key'

const detectBrowser = (userAgent: string) => {
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Edg/')) return 'Edge'
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari')) return 'Safari'
  return 'Browser'
}

const detectOperatingSystem = (userAgent: string) => {
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac OS')) return 'macOS'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS'
  if (userAgent.includes('Linux')) return 'Linux'
  return 'Unknown OS'
}

const getAccessSessionKey = () => {
  if (typeof window === 'undefined') return ''
  const existingKey = localStorage.getItem(accessSessionStorageKey)
  if (existingKey) return existingKey
  const generatedKey =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(accessSessionStorageKey, generatedKey)
  return generatedKey
}

export const getCurrentAccessSessionKey = () => {
  if (typeof window === 'undefined') return ''
  return getAccessSessionKey()
}

export async function registerAccessSessionHeartbeat() {
  if (typeof window === 'undefined') return

  const userAgent = navigator.userAgent || ''
  const sessionKey = getAccessSessionKey()
  if (!sessionKey) return

  const name = `${detectBrowser(userAgent)} on ${detectOperatingSystem(userAgent)}`

  await fetch('/api/security/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-session-key': sessionKey,
    },
    body: JSON.stringify({ sessionKey, name }),
  })
}
