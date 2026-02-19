import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { isDemoModeRequest } from '@/lib/demo-mode'
import { prisma } from '@/lib/prisma'
import { applyAutoDetectedUserCurrency } from '@/lib/user-preference-service'
import {
  defaultUserCurrency,
  defaultUserLocale,
  isSupportedUserCurrency,
  isSupportedUserLocale,
  normalizeCurrencyCode,
} from '@/lib/user-preferences'

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const notFoundResponse = () =>
  NextResponse.json({ error: 'User not found' }, { status: 404 })

export async function GET(request: NextRequest) {
  try {
    const isDemoMode = isDemoModeRequest(request)
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      if (isDemoMode) {
        return NextResponse.json({
          locale: defaultUserLocale,
          currency: defaultUserCurrency,
          hasManualCurrencyPreference: false,
        })
      }
      return unauthorizedResponse()
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        locale: true,
        currency: true,
        hasManualCurrencyPreference: true,
      },
    })

    if (!user) {
      return notFoundResponse()
    }

    const currency = user.hasManualCurrencyPreference
      ? user.currency
      : await applyAutoDetectedUserCurrency(session.user.id)

    return NextResponse.json({
      locale: user.locale,
      currency,
      hasManualCurrencyPreference: user.hasManualCurrencyPreference,
    })
  } catch (error) {
    console.error('Failed to load user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to load preferences' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const isDemoMode = isDemoModeRequest(request)
    const session = await getServerSession(authOptions)
    const body = await request.json().catch(() => ({}))

    const locale = typeof body?.locale === 'string' ? body.locale.trim() : ''
    const currencyInput =
      typeof body?.currency === 'string' ? body.currency : ''
    const normalizedCurrency = currencyInput
      ? normalizeCurrencyCode(currencyInput)
      : ''
    const useAutoDetectedCurrency = body?.useAutoDetectedCurrency === true

    if (locale && !isSupportedUserLocale(locale)) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      )
    }
    if (normalizedCurrency && !isSupportedUserCurrency(normalizedCurrency)) {
      return NextResponse.json(
        { error: 'Unsupported currency' },
        { status: 400 }
      )
    }
    if (!locale && !normalizedCurrency && !useAutoDetectedCurrency) {
      return NextResponse.json(
        { error: 'No preference changes provided' },
        { status: 400 }
      )
    }

    if (!session?.user?.id) {
      if (isDemoMode) {
        return NextResponse.json({
          locale: locale || defaultUserLocale,
          currency: normalizedCurrency || defaultUserCurrency,
          hasManualCurrencyPreference: !useAutoDetectedCurrency,
        })
      }
      return unauthorizedResponse()
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(locale ? { locale } : {}),
        ...(normalizedCurrency
          ? {
              currency: normalizedCurrency,
              hasManualCurrencyPreference: true,
            }
          : {}),
        ...(useAutoDetectedCurrency
          ? { hasManualCurrencyPreference: false }
          : {}),
      },
    })

    if (useAutoDetectedCurrency) {
      await applyAutoDetectedUserCurrency(session.user.id)
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        locale: true,
        currency: true,
        hasManualCurrencyPreference: true,
      },
    })

    if (!updatedUser) {
      return notFoundResponse()
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
