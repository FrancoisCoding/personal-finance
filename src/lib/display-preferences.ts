import {
  defaultUserCurrency,
  defaultUserLocale,
  isSupportedUserCurrency,
  isSupportedUserLocale,
  normalizeCurrencyCode,
} from '@/lib/user-preferences'

export interface IDisplayPreferences {
  locale: string
  currency: string
}

const localeStorageKey = 'financeflow.locale'
const currencyStorageKey = 'financeflow.currency'
const localeCookieKey = 'financeflow_locale'
const currencyCookieKey = 'financeflow_currency'

let inMemoryDisplayPreferences: IDisplayPreferences = {
  locale: defaultUserLocale,
  currency: defaultUserCurrency,
}

const canUseBrowserStorage = () => typeof window !== 'undefined'

const sanitizeLocale = (value: string | null | undefined) => {
  if (!value) return defaultUserLocale
  return isSupportedUserLocale(value) ? value : defaultUserLocale
}

const sanitizeCurrency = (value: string | null | undefined) => {
  if (!value) return defaultUserCurrency
  const normalizedCurrency = normalizeCurrencyCode(value)
  return isSupportedUserCurrency(normalizedCurrency)
    ? normalizedCurrency
    : defaultUserCurrency
}

const syncToBrowserStorage = (preferences: IDisplayPreferences) => {
  if (!canUseBrowserStorage()) return

  window.localStorage.setItem(localeStorageKey, preferences.locale)
  window.localStorage.setItem(currencyStorageKey, preferences.currency)
  document.cookie = `${localeCookieKey}=${preferences.locale}; path=/; max-age=31536000; SameSite=Lax`
  document.cookie = `${currencyCookieKey}=${preferences.currency}; path=/; max-age=31536000; SameSite=Lax`
}

export const getDisplayPreferences = (): IDisplayPreferences => {
  if (!canUseBrowserStorage()) {
    return inMemoryDisplayPreferences
  }

  const storedLocale = window.localStorage.getItem(localeStorageKey)
  const storedCurrency = window.localStorage.getItem(currencyStorageKey)
  const resolvedPreferences = {
    locale: sanitizeLocale(storedLocale ?? inMemoryDisplayPreferences.locale),
    currency: sanitizeCurrency(
      storedCurrency ?? inMemoryDisplayPreferences.currency
    ),
  }

  inMemoryDisplayPreferences = resolvedPreferences
  return resolvedPreferences
}

export const setDisplayPreferences = (
  preferences: Partial<IDisplayPreferences>
): IDisplayPreferences => {
  const resolvedPreferences: IDisplayPreferences = {
    locale: sanitizeLocale(
      preferences.locale ?? inMemoryDisplayPreferences.locale
    ),
    currency: sanitizeCurrency(
      preferences.currency ?? inMemoryDisplayPreferences.currency
    ),
  }

  inMemoryDisplayPreferences = resolvedPreferences
  syncToBrowserStorage(resolvedPreferences)
  return resolvedPreferences
}
