import { AppPlan } from '@prisma/client'
import {
  comparePlanPriority,
  getEffectivePlanFromSubscriptions,
} from '@/lib/billing'
import { prisma } from '@/lib/prisma'

const getConfiguredSuperUserEmails = () => {
  const adminEmail = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
  const envEmails = (process.env.SUPERUSER_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const allEmails = new Set<string>()
  if (adminEmail) {
    allEmails.add(adminEmail)
  }
  envEmails.forEach((email) => allEmails.add(email))
  return allEmails
}

const isConfiguredSuperUserEmail = (email: string | null | undefined) => {
  if (!email) return false
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return false
  return getConfiguredSuperUserEmails().has(normalizedEmail)
}

export const getUserEntitlements = async (userId: string) => {
  const [user, subscriptions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isSuperUser: true,
      },
    }),
    prisma.appSubscription.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const effectiveSubscription = getEffectivePlanFromSubscriptions(subscriptions)
  const isSuperUser = Boolean(
    user?.isSuperUser || isConfiguredSuperUserEmail(user?.email)
  )
  const currentPlan = isSuperUser
    ? AppPlan.PRO
    : (effectiveSubscription?.plan ?? null)
  const hasProAccess = Boolean(
    currentPlan &&
      comparePlanPriority(currentPlan) >= comparePlanPriority(AppPlan.PRO)
  )

  return {
    user,
    subscriptions,
    isSuperUser,
    currentPlan,
    hasProAccess,
    effectiveSubscription,
  }
}
