export interface IUserLocaleOption {
  code: string
  label: string
}

export interface IUserCurrencyOption {
  code: string
  label: string
}

export const defaultUserLocale = 'en-US'
export const defaultUserCurrency = 'USD'

export const userLocaleOptions: IUserLocaleOption[] = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'hi-IN', label: 'Hindi (India)' },
]

export const userCurrencyOptions: IUserCurrencyOption[] = [
  { code: 'USD', label: 'US Dollar (USD)' },
  { code: 'BRL', label: 'Brazilian Real (BRL)' },
  { code: 'INR', label: 'Indian Rupee (INR)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'GBP', label: 'British Pound (GBP)' },
  { code: 'CAD', label: 'Canadian Dollar (CAD)' },
]

const localeSet = new Set(userLocaleOptions.map((option) => option.code))
const currencySet = new Set(userCurrencyOptions.map((option) => option.code))

export const isSupportedUserLocale = (value: string) => {
  return localeSet.has(value)
}

export const normalizeCurrencyCode = (value: string) => {
  return value.trim().toUpperCase()
}

export const isSupportedUserCurrency = (value: string) => {
  return currencySet.has(normalizeCurrencyCode(value))
}

export const isIsoCurrencyCode = (value: string) => {
  return /^[A-Z]{3}$/.test(normalizeCurrencyCode(value))
}
