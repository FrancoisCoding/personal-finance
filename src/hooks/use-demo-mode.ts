'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEMO_MODE_CHANGE_EVENT,
  disableDemoMode,
  enableDemoMode,
  isDemoModeClient,
} from '@/lib/demo-mode'

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(() => isDemoModeClient())

  useEffect(() => {
    const syncDemoMode = () => {
      setIsDemoMode(isDemoModeClient())
    }

    syncDemoMode()
    window.addEventListener(DEMO_MODE_CHANGE_EVENT, syncDemoMode)
    window.addEventListener('focus', syncDemoMode)

    return () => {
      window.removeEventListener(DEMO_MODE_CHANGE_EVENT, syncDemoMode)
      window.removeEventListener('focus', syncDemoMode)
    }
  }, [])

  const startDemoMode = useCallback(() => {
    enableDemoMode()
    setIsDemoMode(true)
  }, [])

  const stopDemoMode = useCallback(() => {
    disableDemoMode()
    setIsDemoMode(false)
  }, [])

  return {
    isDemoMode,
    startDemoMode,
    stopDemoMode,
  }
}
