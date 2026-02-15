import { renderHook, act } from '@testing-library/react'
import { useDemoMode } from './use-demo-mode'
import { DEMO_MODE_COOKIE } from '@/lib/demo-mode'

const clearDemoCookie = () => {
  document.cookie = `${DEMO_MODE_COOKIE}=; path=/; max-age=0`
}

describe('useDemoMode', () => {
  beforeEach(() => {
    clearDemoCookie()
    localStorage.clear()
  })

  it('toggles demo mode on and off', () => {
    const { result } = renderHook(() => useDemoMode())

    expect(result.current.isDemoMode).toBe(false)

    act(() => {
      result.current.startDemoMode()
    })
    expect(result.current.isDemoMode).toBe(true)
    expect(document.cookie).toContain(`${DEMO_MODE_COOKIE}=1`)

    act(() => {
      result.current.stopDemoMode()
    })
    expect(result.current.isDemoMode).toBe(false)
    expect(document.cookie).not.toContain(`${DEMO_MODE_COOKIE}=1`)
  })

  it('hydrates demo mode state from existing cookies', () => {
    document.cookie = `${DEMO_MODE_COOKIE}=1`
    const { result } = renderHook(() => useDemoMode())

    expect(result.current.isDemoMode).toBe(true)
  })
})
