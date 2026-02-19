import { prisma } from '@/lib/prisma'
import {
  defaultUserCurrency,
  isIsoCurrencyCode,
  isSupportedUserCurrency,
  normalizeCurrencyCode,
} from '@/lib/user-preferences'

const getMostRecentAccountCurrency = async (userId: string) => {
  const account = await prisma.financialAccount.findFirst({
    where: {
      userId,
      isActive: true,
      currency: {
        not: '',
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      currency: true,
    },
  })

  if (!account?.currency) return null

  const normalizedCurrency = normalizeCurrencyCode(account.currency)
  if (!isIsoCurrencyCode(normalizedCurrency)) return null
  if (!isSupportedUserCurrency(normalizedCurrency)) return null
  return normalizedCurrency
}

export const applyAutoDetectedUserCurrency = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currency: true,
      hasManualCurrencyPreference: true,
    },
  })

  if (!user) {
    return defaultUserCurrency
  }
  if (user.hasManualCurrencyPreference) {
    return user.currency
  }

  const detectedCurrency = await getMostRecentAccountCurrency(userId)
  if (!detectedCurrency || detectedCurrency === user.currency) {
    return user.currency
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currency: detectedCurrency,
    },
  })

  return detectedCurrency
}
