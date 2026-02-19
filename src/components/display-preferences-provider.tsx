'use client'

import { useEffect } from 'react'

import { useUserPreferences } from '@/hooks/use-user-preferences'
import { setDisplayPreferences } from '@/lib/display-preferences'
import { startUiTranslationRuntime } from '@/lib/ui-translation-runtime'
import { defaultUserCurrency, defaultUserLocale } from '@/lib/user-preferences'

export function DisplayPreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: preferences } = useUserPreferences()
  const locale = preferences?.locale ?? defaultUserLocale
  const currency = preferences?.currency ?? defaultUserCurrency

  useEffect(() => {
    setDisplayPreferences({
      locale,
      currency,
    })
    document.documentElement.lang = locale
  }, [currency, locale])

  useEffect(() => {
    return startUiTranslationRuntime(locale)
  }, [locale])

  return <>{children}</>
}
