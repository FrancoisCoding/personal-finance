export type TAdConsentValue = 'accepted' | 'declined'

export const adConsentStorageKey = 'financeflow.ad-consent.v1'
export const adConsentChangedEventName = 'financeflow:ad-consent-changed'

export const readAdConsentValue = (): TAdConsentValue | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const storedValue = window.localStorage.getItem(adConsentStorageKey)
  if (storedValue === 'accepted' || storedValue === 'declined') {
    return storedValue
  }

  return null
}

export const writeAdConsentValue = (value: TAdConsentValue) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(adConsentStorageKey, value)
  window.dispatchEvent(
    new CustomEvent(adConsentChangedEventName, {
      detail: { value },
    })
  )
}
