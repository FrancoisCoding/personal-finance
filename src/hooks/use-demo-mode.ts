'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  disableDemoMode,
  enableDemoMode,
  isDemoModeClient,
} from '@/lib/demo-mode'

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(() => isDemoModeClient())

  useEffect(() => {
    setIsDemoMode(isDemoModeClient())
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
