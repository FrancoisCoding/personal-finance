import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { plaidClient } from '@/lib/plaid'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all Plaid items for the user
    const plaidItems = await prisma.plaidItem.findMany({
      where: { userId: session.user.id },
    })

    if (plaidItems.length === 0) {
      return NextResponse.json({ message: 'No connected accounts found' })
    }

    let totalTransactionsSynced = 0

    for (const item of plaidItems) {
      try {
        // Get accounts for this Plaid item
        const accountsResponse = await plaidClient.accountsGet({
          access_token: item.accessToken,
        })

        const accounts = accountsResponse.data.accounts

        for (const plaidAccount of accounts) {
          // Find or create the account in our database
          let account = await prisma.financialAccount.findFirst({
            where: {
              userId: session.user.id,
              accountNumber: plaidAccount.mask,
            },
          })

          if (!account) {
            // Create account if it doesn't exist
            account = await prisma.financialAccount.create({
              data: {
                userId: session.user.id,
                name: plaidAccount.name,
                type:
                  plaidAccount.type === 'credit'
                    ? 'CREDIT_CARD'
                    : plaidAccount.type === 'depository'
                      ? 'CHECKING'
                      : 'OTHER',
                balance: plaidAccount.balances.current ?? 0,
                currency: plaidAccount.balances.iso_currency_code ?? 'USD',
                institution: plaidAccount.official_name || plaidAccount.name,
                accountNumber: plaidAccount.mask ?? null,
                creditLimit: plaidAccount.balances.limit ?? null,
                isActive: true,
              },
            })
          } else {
            // Update account balance and credit limit
            await prisma.financialAccount.update({
              where: { id: account.id },
              data: {
                balance: plaidAccount.balances.current ?? account.balance,
                creditLimit: plaidAccount.balances.limit ?? account.creditLimit,
              },
            })
          }

          // Fetch transactions for the last 90 days
          const endDate = new Date()
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - 90)

          const transactionsResponse = await plaidClient.transactionsGet({
            access_token: item.accessToken,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            options: {
              account_ids: [plaidAccount.account_id],
            },
          })

          const plaidTransactions = transactionsResponse.data.transactions

          for (const plaidTransaction of plaidTransactions) {
            // Check if transaction already exists
            const existingTransaction = await prisma.transaction.findFirst({
              where: {
                userId: session.user.id,
                accountId: account.id,
                plaidTransactionId: plaidTransaction.transaction_id,
              },
            })

            if (!existingTransaction) {
              // Create new transaction
              await prisma.transaction.create({
                data: {
                  userId: session.user.id,
                  accountId: account.id,
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
          `Error syncing transactions for Plaid item ${item.itemId}:`,
          error
        )
        // Continue with other items even if one fails
      }
    }

    return NextResponse.json({
      message: `Successfully synced ${totalTransactionsSynced} transactions`,
      transactionsSynced: totalTransactionsSynced,
    })
  } catch (error) {
    console.error('Error syncing transactions:', error)
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    )
  }
}
