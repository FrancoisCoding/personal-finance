import { NextRequest, NextResponse } from 'next/server'
import { AppPlan, AppSubscriptionStatus } from '@prisma/client'
import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'
import { planDefinitions } from '@/lib/billing'
import { prisma } from '@/lib/prisma'

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get(adminSessionCookieName)?.value
    if (!verifyAdminSessionToken(adminToken)) {
      return unauthorizedResponse()
    }

    const nowDate = new Date()
    const sevenDaysAgoDate = new Date(
      nowDate.getTime() - 1000 * 60 * 60 * 24 * 7
    )
    const thirtyDaysAgoDate = new Date(
      nowDate.getTime() - 1000 * 60 * 60 * 24 * 30
    )
    const twentyFourHoursAgoDate = new Date(
      nowDate.getTime() - 1000 * 60 * 60 * 24
    )

    const [
      usersCount,
      contactsCount,
      activeSubscriptionsCount,
      trialingSubscriptionsCount,
      usersLast7DaysCount,
      usersLast30DaysCount,
      verifiedUsersCount,
      contactsLast7DaysCount,
      contactsLast30DaysCount,
      sessionsLast24HoursCount,
      sessionsLast7DaysCount,
      activeSessionUsersLast7Days,
      financialAccountsCount,
      transactionsCount,
      remindersCount,
      goalsCount,
      tellerEnrollmentUsers,
      activePlanCounts,
      subscriptionStatusCounts,
      topLoginLocations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.contactSubmission.count(),
      prisma.appSubscription.count({
        where: { status: AppSubscriptionStatus.ACTIVE },
      }),
      prisma.appSubscription.count({
        where: { status: AppSubscriptionStatus.TRIALING },
      }),
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgoDate } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgoDate } },
      }),
      prisma.user.count({
        where: { emailVerified: { not: null } },
      }),
      prisma.contactSubmission.count({
        where: { createdAt: { gte: sevenDaysAgoDate } },
      }),
      prisma.contactSubmission.count({
        where: { createdAt: { gte: thirtyDaysAgoDate } },
      }),
      prisma.accessSession.count({
        where: { lastActiveAt: { gte: twentyFourHoursAgoDate } },
      }),
      prisma.accessSession.count({
        where: { lastActiveAt: { gte: sevenDaysAgoDate } },
      }),
      prisma.accessSession.groupBy({
        by: ['userId'],
        where: { lastActiveAt: { gte: sevenDaysAgoDate } },
      }),
      prisma.financialAccount.count(),
      prisma.transaction.count(),
      prisma.reminder.count(),
      prisma.goal.count(),
      prisma.tellerEnrollment.groupBy({
        by: ['userId'],
      }),
      prisma.appSubscription.groupBy({
        by: ['plan'],
        where: {
          status: {
            in: [AppSubscriptionStatus.ACTIVE, AppSubscriptionStatus.TRIALING],
          },
        },
        _count: { _all: true },
      }),
      prisma.appSubscription.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.accessSession.groupBy({
        by: ['location'],
        _count: { _all: true },
        orderBy: {
          _count: {
            location: 'desc',
          },
        },
        take: 5,
      }),
    ])

    const basicPlanCount =
      activePlanCounts.find((item) => item.plan === AppPlan.BASIC)?._count
        ._all ?? 0
    const proPlanCount =
      activePlanCounts.find((item) => item.plan === AppPlan.PRO)?._count._all ??
      0

    const projectedMonthlyRevenueInCents =
      basicPlanCount * planDefinitions.BASIC.monthlyPriceInCents +
      proPlanCount * planDefinitions.PRO.monthlyPriceInCents

    const payerUsersCount = await prisma.appSubscription.groupBy({
      by: ['userId'],
      where: {
        status: {
          in: [AppSubscriptionStatus.ACTIVE, AppSubscriptionStatus.TRIALING],
        },
      },
    })

    const subscriptionStatusMap = subscriptionStatusCounts.reduce<
      Record<string, number>
    >((accumulator, item) => {
      accumulator[item.status] = item._count._all
      return accumulator
    }, {})

    const averageSessionsPerActiveUserLast7Days =
      activeSessionUsersLast7Days.length === 0
        ? 0
        : Number(
            (
              sessionsLast7DaysCount / activeSessionUsersLast7Days.length
            ).toFixed(2)
          )

    return NextResponse.json({
      summary: {
        usersCount,
        contactsCount,
        activeSessionsCount: sessionsLast7DaysCount,
        activeSubscriptions: activeSubscriptionsCount,
        trialingSubscriptions: trialingSubscriptionsCount,
      },
      userMetrics: {
        totalUsers: usersCount,
        newUsersLast7Days: usersLast7DaysCount,
        newUsersLast30Days: usersLast30DaysCount,
        verifiedUsers: verifiedUsersCount,
        connectedBankUsers: tellerEnrollmentUsers.length,
      },
      subscriptionMetrics: {
        payingUsers: payerUsersCount.length,
        activeSubscriptions: activeSubscriptionsCount,
        trialingSubscriptions: trialingSubscriptionsCount,
        basicSubscribers: basicPlanCount,
        proSubscribers: proPlanCount,
        projectedMonthlyRevenueInCents,
        statusBreakdown: {
          active: subscriptionStatusMap[AppSubscriptionStatus.ACTIVE] ?? 0,
          trialing: subscriptionStatusMap[AppSubscriptionStatus.TRIALING] ?? 0,
          pastDue: subscriptionStatusMap[AppSubscriptionStatus.PAST_DUE] ?? 0,
          canceled: subscriptionStatusMap[AppSubscriptionStatus.CANCELED] ?? 0,
          incomplete:
            subscriptionStatusMap[AppSubscriptionStatus.INCOMPLETE] ?? 0,
        },
      },
      engagementMetrics: {
        sessionsLast24Hours: sessionsLast24HoursCount,
        sessionsLast7Days: sessionsLast7DaysCount,
        activeUsersLast7Days: activeSessionUsersLast7Days.length,
        averageSessionsPerActiveUserLast7Days,
        topLoginLocations: topLoginLocations.map((location) => ({
          location: location.location || 'Unknown',
          count: location._count._all,
        })),
      },
      operationsMetrics: {
        contactsLast7Days: contactsLast7DaysCount,
        contactsLast30Days: contactsLast30DaysCount,
        totalFinancialAccounts: financialAccountsCount,
        totalTransactions: transactionsCount,
        totalGoals: goalsCount,
        totalReminders: remindersCount,
      },
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to load admin analytics.' },
      { status: 500 }
    )
  }
}
