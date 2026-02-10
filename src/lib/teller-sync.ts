import { AccountType } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { tellerFetch } from '@/lib/teller'

interface TellerInstitution {
  name?: string | null
}

interface TellerAccount {
  id: string
  name: string
  type: string
  subtype?: string | null
  currency?: string | null
  last_four?: string | null
  institution?: TellerInstitution | null
}

interface TellerBalance {
  available: string | null
  ledger: string | null
}

interface TellerTransaction {
  id: string
  amount: string
  date: string
  description?: string | null
  details?: {
    description?: string | null
  } | null
}

const mapTellerAccountType = (account: TellerAccount): AccountType => {
  switch (account.type) {
    case 'depository':
      if (account.subtype === 'checking') return AccountType.CHECKING
      if (account.subtype === 'savings') return AccountType.SAVINGS
      return AccountType.OTHER
    case 'credit':
      return AccountType.CREDIT_CARD
    case 'investment':
      return AccountType.INVESTMENT
    case 'loan':
      return AccountType.LOAN
    default:
      return AccountType.OTHER
  }
}

const parseBalance = (balance: TellerBalance) => {
  const value = balance.available ?? balance.ledger ?? '0'
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const getTransactionDescription = (transaction: TellerTransaction) =>
  transaction.description ||
  transaction.details?.description ||
  'Teller transaction'

export async function syncTellerEnrollment({
  userId,
  accessToken,
}: {
  userId: string
  accessToken: string
}) {
  const accounts = await tellerFetch<TellerAccount[]>('/accounts', accessToken)
  const now = new Date()
  const endDate = now.toISOString().split('T')[0]
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 90)
  const startDateString = startDate.toISOString().split('T')[0]

  let accountsSynced = 0
  let transactionsSynced = 0

  for (const account of accounts) {
    const balance = await tellerFetch<TellerBalance>(
      `/accounts/${account.id}/balances`,
      accessToken
    )
    const mappedType = mapTellerAccountType(account)
    const savedAccount = await prisma.financialAccount.upsert({
      where: { tellerAccountId: account.id },
      update: {
        name: account.name,
        type: mappedType,
        balance: parseBalance(balance),
        currency: account.currency ?? 'USD',
        institution: account.institution?.name ?? null,
        accountNumber: account.last_four ?? null,
        isActive: true,
      },
      create: {
        userId,
        tellerAccountId: account.id,
        name: account.name,
        type: mappedType,
        balance: parseBalance(balance),
        currency: account.currency ?? 'USD',
        institution: account.institution?.name ?? null,
        accountNumber: account.last_four ?? null,
        isActive: true,
      },
    })
    accountsSynced++

    const transactions = await tellerFetch<TellerTransaction[]>(
      `/accounts/${account.id}/transactions?start_date=${startDateString}&end_date=${endDate}`,
      accessToken
    )

    for (const transaction of transactions) {
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          userId,
          accountId: savedAccount.id,
          tellerTransactionId: transaction.id,
        },
      })

      if (!existingTransaction) {
        const amount = Number.parseFloat(transaction.amount)
        const absoluteAmount = Number.isNaN(amount) ? 0 : Math.abs(amount)

        await prisma.transaction.create({
          data: {
            userId,
            accountId: savedAccount.id,
            amount: absoluteAmount,
            description: getTransactionDescription(transaction),
            date: new Date(transaction.date),
            type: amount < 0 ? 'EXPENSE' : 'INCOME',
            category: 'Uncategorized',
            isRecurring: false,
            tags: [],
            notes: null,
            tellerTransactionId: transaction.id,
          },
        })
        transactionsSynced++
      }
    }
  }

  return { accountsSynced, transactionsSynced }
}
