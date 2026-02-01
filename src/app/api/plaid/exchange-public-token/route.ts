import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { plaidClient } from '@/lib/plaid'
import { prisma } from '@/lib/prisma'
import { AccountType } from '@prisma/client'

function mapPlaidAccountType(account: { type: string; subtype?: string | null }): AccountType {
  switch (account.type) {
    case 'depository':
      if (account.subtype === 'checking') return AccountType.CHECKING
      else if (account.subtype === 'savings') return AccountType.SAVINGS
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

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { public_token } = await request.json()
  if (!public_token)
    return NextResponse.json(
      { error: 'Public token is required' },
      { status: 400 }
    )

  try {
    const { access_token, item_id } = (
      await plaidClient.itemPublicTokenExchange({ public_token })
    ).data
    const accounts = (await plaidClient.accountsGet({ access_token })).data
      .accounts

    const savedAccounts = []
    for (const acct of accounts) {
      const saved = await prisma.financialAccount.create({
        data: {
          userId: session.user.id,
          name: acct.name,
          type: mapPlaidAccountType(acct),
          balance: acct.balances.current ?? 0,
          currency: acct.balances.iso_currency_code ?? 'USD',
          institution: acct.official_name || acct.name,
          accountNumber: acct.mask ?? null,
          creditLimit: acct.balances.limit ?? null,
          isActive: true,
        },
      })
      savedAccounts.push(saved)
    }

    await prisma.plaidItem.upsert({
      where: { itemId: item_id },
      update: { accessToken: access_token, updatedAt: new Date() },
      create: {
        userId: session.user.id,
        itemId: item_id,
        accessToken: access_token,
      },
    })

    // Fetch transactions for the newly connected accounts
    let totalTransactionsSynced = 0
    for (const acct of accounts) {
      try {
        // Find the saved account
        const savedAccount = savedAccounts.find(
          (saved) => saved.accountNumber === acct.mask
        )

        if (savedAccount) {
          // Fetch transactions for the last 90 days
          const endDate = new Date()
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - 90)

          const transactionsResponse = await plaidClient.transactionsGet({
            access_token,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            options: {
              account_ids: [acct.account_id],
            },
          })

          const plaidTransactions = transactionsResponse.data.transactions

          for (const plaidTransaction of plaidTransactions) {
            // Check if transaction already exists
            const existingTransaction = await prisma.transaction.findFirst({
              where: {
                userId: session.user.id,
                accountId: savedAccount.id,
                plaidTransactionId: plaidTransaction.transaction_id,
              },
            })

            if (!existingTransaction) {
              // Create new transaction
              await prisma.transaction.create({
                data: {
                  userId: session.user.id,
                  accountId: savedAccount.id,
                  amount: Math.abs(plaidTransaction.amount),
                  description: plaidTransaction.name,
                  date: new Date(plaidTransaction.date),
                  type: plaidTransaction.amount > 0 ? 'INCOME' : 'EXPENSE',
                  category: plaidTransaction.category?.[0] || 'Uncategorized',
                  isRecurring: false,
                  tags: [],
                  notes: null,
                  plaidTransactionId: plaidTransaction.transaction_id,
                },
              })
              totalTransactionsSynced++
            }
          }
        }
      } catch (error) {
        console.error(
          `Error fetching transactions for account ${acct.name}:`,
          error
        )
        // Continue with other accounts even if one fails
      }
    }

    return NextResponse.json({
      accounts: savedAccounts,
      message: 'Accounts connected successfully',
      transactionsSynced: totalTransactionsSynced,
    })
  } catch (err) {
    console.error('Error exchanging public token:', err)
    return NextResponse.json(
      { error: 'Failed to connect accounts' },
      { status: 500 }
    )
  }
}
