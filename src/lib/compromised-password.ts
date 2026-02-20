import { createHash } from 'crypto'

const pwnedPasswordsRangeApiBaseUrl = 'https://api.pwnedpasswords.com/range/'

const getPasswordSha1Hash = (password: string) => {
  return createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase()
}

export const isCompromisedPassword = async (password: string) => {
  if (!password) {
    return false
  }

  const passwordSha1Hash = getPasswordSha1Hash(password)
  const hashPrefix = passwordSha1Hash.slice(0, 5)
  const hashSuffix = passwordSha1Hash.slice(5)

  try {
    const response = await fetch(
      `${pwnedPasswordsRangeApiBaseUrl}${hashPrefix}`,
      {
        headers: {
          'Add-Padding': 'true',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      return false
    }

    const responseBody = await response.text()
    const lines = responseBody.split('\n')

    for (const line of lines) {
      const [lineHashSuffix, lineBreachCount] = line.trim().split(':')
      if (!lineHashSuffix || !lineBreachCount) {
        continue
      }

      if (lineHashSuffix.toUpperCase() !== hashSuffix) {
        continue
      }

      const breachCount = Number.parseInt(lineBreachCount, 10)
      return Number.isFinite(breachCount) && breachCount > 0
    }

    return false
  } catch {
    return false
  }
}
