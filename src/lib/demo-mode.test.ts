import {
  DEMO_MODE_COOKIE,
  demoSession,
  disableDemoMode,
  enableDemoMode,
  isDemoModeClient,
  isDemoModeRequest,
} from './demo-mode'

const clearDemoCookie = () => {
  document.cookie = `${DEMO_MODE_COOKIE}=; path=/; max-age=0`
}

describe('demo mode helpers', () => {
  beforeEach(() => {
    clearDemoCookie()
    localStorage.clear()
  })

  it('detects demo mode in request cookies', () => {
    const enabledRequest = {
      headers: new Headers({ cookie: `${DEMO_MODE_COOKIE}=1; theme=dark` }),
    } as Request
    const disabledRequest = {
      headers: new Headers({ cookie: 'theme=dark' }),
    } as Request
    const missingCookieRequest = {
      headers: new Headers(),
    } as Request

    expect(isDemoModeRequest(enabledRequest)).toBe(true)
    expect(isDemoModeRequest(disabledRequest)).toBe(false)
    expect(isDemoModeRequest(missingCookieRequest)).toBe(false)
  })

  it('enables and disables demo mode on the client', () => {
    expect(isDemoModeClient()).toBe(false)

    enableDemoMode()
    expect(isDemoModeClient()).toBe(true)
    expect(localStorage.getItem('finance-demo-mode')).toBe('1')

    disableDemoMode()
    expect(isDemoModeClient()).toBe(false)
    expect(localStorage.getItem('finance-demo-mode')).toBeNull()
  })

  it('handles missing document safely', () => {
    vi.stubGlobal('document', undefined)

    expect(isDemoModeClient()).toBe(false)
    expect(() => enableDemoMode()).not.toThrow()
    expect(() => disableDemoMode()).not.toThrow()

    vi.unstubAllGlobals()
  })

  it('exposes the demo session profile', () => {
    expect(demoSession.user.id).toBe('demo-user')
    expect(demoSession.user.email).toContain('@')
  })
})
