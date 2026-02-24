export interface IPerkSourceAccount {
  id: string
  name: string
  type: string
  balance?: number
  creditLimit?: number | null
}

export interface IPerkSourceTransaction {
  id: string
  accountId: string
  description: string
  amount: number
  date: Date | string
  type: string
}

export interface IPerkMatchedTransaction {
  id: string
  description: string
  amount: number
  date: Date
}

export interface ICardPerkInsight {
  cardId: string
  cardName: string
  programId: string
  programName: string
  totalMonthlyValue: number
  redeemedMonthlyValue: number
  remainingMonthlyValue: number
  perks: ICardPerkUsage[]
}

export interface ICardPerkUsage {
  id: string
  name: string
  monthlyValue: number
  merchantLabels: string[]
  usedAmount: number
  redeemedAmount: number
  remainingAmount: number
  status: 'unused' | 'partial' | 'used'
  cycleStartDate: Date
  cycleEndDate: Date
  daysRemainingInCycle: number
  isExpiringSoon: boolean
  matchedTransactions: IPerkMatchedTransaction[]
}

export interface ICardPerkAnalysisResult {
  cards: ICardPerkInsight[]
  trackedCardCount: number
  trackedPerkCount: number
  totalMonthlyValue: number
  redeemedMonthlyValue: number
  remainingMonthlyValue: number
  expiringSoonCount: number
}

interface ICardPerkProgram {
  id: string
  name: string
  cardNameMatchers: string[]
  perks: Array<{
    id: string
    name: string
    monthlyValue: number
    merchantMatchers: string[]
  }>
}

const creditCardPerkPrograms: ICardPerkProgram[] = [
  {
    id: 'amex-gold',
    name: 'American Express Gold',
    cardNameMatchers: ['amex gold', 'american express gold', 'gold card'],
    perks: [
      {
        id: 'uber-credit',
        name: 'Uber Cash',
        monthlyValue: 10,
        merchantMatchers: ['uber eats', 'uber'],
      },
      {
        id: 'dining-credit',
        name: 'Dining Credit',
        monthlyValue: 10,
        merchantMatchers: [
          'shake shack',
          'grubhub',
          'cheesecake factory',
          'goldbelly',
          'wine.com',
          'milk bar',
        ],
      },
      {
        id: 'dunkin-credit',
        name: 'Dunkin Credit',
        monthlyValue: 7,
        merchantMatchers: ['dunkin'],
      },
    ],
  },
  {
    id: 'amex-platinum',
    name: 'American Express Platinum',
    cardNameMatchers: [
      'amex platinum',
      'american express platinum',
      'platinum card',
    ],
    perks: [
      {
        id: 'uber-cash',
        name: 'Uber Cash',
        monthlyValue: 15,
        merchantMatchers: ['uber eats', 'uber'],
      },
      {
        id: 'digital-entertainment-credit',
        name: 'Digital Entertainment Credit',
        monthlyValue: 20,
        merchantMatchers: [
          'audible',
          'disney+',
          'disney plus',
          'espn+',
          'hulu',
          'new york times',
          'nytimes',
          'peacock',
          'wall street journal',
          'wsj',
        ],
      },
      {
        id: 'walmart-plus-credit',
        name: 'Walmart+ Credit',
        monthlyValue: 13,
        merchantMatchers: ['walmart+', 'walmart plus'],
      },
    ],
  },
  {
    id: 'amex-blue-cash-everyday',
    name: 'American Express Blue Cash Everyday',
    cardNameMatchers: [
      'amex blue cash everyday',
      'american express blue cash everyday',
      'blue cash everyday',
      'bce',
    ],
    perks: [
      {
        id: 'disney-bundle-credit',
        name: 'Disney Bundle Credit',
        monthlyValue: 7,
        merchantMatchers: ['disney+', 'disney plus', 'hulu', 'espn+'],
      },
    ],
  },
]

const normalize = (value: string) => value.trim().toLowerCase()

const isDateInCurrentCycle = (date: Date, now: Date) => {
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const cycleEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )
  return date >= cycleStart && date <= cycleEnd
}

const getCycleWindow = (now: Date) => {
  const cycleStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const cycleEndDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )
  return { cycleStartDate, cycleEndDate }
}

const getDaysRemainingInCycle = (cycleEndDate: Date, now: Date) => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24
  return Math.max(
    0,
    Math.ceil((cycleEndDate.getTime() - now.getTime()) / millisecondsPerDay)
  )
}

const getProgramForCard = (cardName: string) => {
  const normalizedCardName = normalize(cardName)
  return (
    creditCardPerkPrograms.find((program) =>
      program.cardNameMatchers.some((matcher) =>
        normalizedCardName.includes(matcher)
      )
    ) ?? null
  )
}

export const analyzeCreditCardPerks = ({
  accounts,
  transactions,
  now = new Date(),
  expiryWarningDays = 5,
}: {
  accounts: IPerkSourceAccount[]
  transactions: IPerkSourceTransaction[]
  now?: Date
  expiryWarningDays?: number
}): ICardPerkAnalysisResult => {
  const { cycleStartDate, cycleEndDate } = getCycleWindow(now)
  const creditCardAccounts = accounts.filter(
    (account) => account.type === 'CREDIT_CARD'
  )

  const cards: ICardPerkInsight[] = creditCardAccounts
    .map((account) => {
      const program = getProgramForCard(account.name)
      if (!program) return null

      const accountTransactions = transactions
        .filter((transaction) => transaction.accountId === account.id)
        .map((transaction) => ({
          ...transaction,
          parsedDate: new Date(transaction.date),
        }))
        .filter(
          (transaction) =>
            transaction.type === 'EXPENSE' &&
            !Number.isNaN(transaction.parsedDate.getTime()) &&
            isDateInCurrentCycle(transaction.parsedDate, now)
        )

      const perks: ICardPerkUsage[] = program.perks.map((perk) => {
        const matchedTransactions = accountTransactions
          .filter((transaction) => {
            const normalizedDescription = normalize(transaction.description)
            return perk.merchantMatchers.some((merchantMatcher) =>
              normalizedDescription.includes(merchantMatcher)
            )
          })
          .sort(
            (left, right) =>
              right.parsedDate.getTime() - left.parsedDate.getTime()
          )
          .map((transaction) => ({
            id: transaction.id,
            description: transaction.description,
            amount: Math.abs(transaction.amount),
            date: transaction.parsedDate,
          }))

        const usedAmount = matchedTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        )
        const redeemedAmount = Math.min(usedAmount, perk.monthlyValue)
        const remainingAmount = Math.max(0, perk.monthlyValue - redeemedAmount)
        const daysRemainingInCycle = getDaysRemainingInCycle(cycleEndDate, now)

        const status: ICardPerkUsage['status'] =
          redeemedAmount <= 0
            ? 'unused'
            : remainingAmount > 0
              ? 'partial'
              : 'used'

        return {
          id: perk.id,
          name: perk.name,
          monthlyValue: perk.monthlyValue,
          merchantLabels: perk.merchantMatchers,
          usedAmount,
          redeemedAmount,
          remainingAmount,
          status,
          cycleStartDate,
          cycleEndDate,
          daysRemainingInCycle,
          isExpiringSoon:
            status !== 'used' &&
            remainingAmount > 0 &&
            daysRemainingInCycle <= expiryWarningDays,
          matchedTransactions,
        }
      })

      const totalMonthlyValue = perks.reduce(
        (sum, perk) => sum + perk.monthlyValue,
        0
      )
      const redeemedMonthlyValue = perks.reduce(
        (sum, perk) => sum + perk.redeemedAmount,
        0
      )
      const remainingMonthlyValue = perks.reduce(
        (sum, perk) => sum + perk.remainingAmount,
        0
      )

      return {
        cardId: account.id,
        cardName: account.name,
        programId: program.id,
        programName: program.name,
        totalMonthlyValue,
        redeemedMonthlyValue,
        remainingMonthlyValue,
        perks,
      }
    })
    .filter((card): card is ICardPerkInsight => card !== null)

  return {
    cards,
    trackedCardCount: cards.length,
    trackedPerkCount: cards.reduce((sum, card) => sum + card.perks.length, 0),
    totalMonthlyValue: cards.reduce(
      (sum, card) => sum + card.totalMonthlyValue,
      0
    ),
    redeemedMonthlyValue: cards.reduce(
      (sum, card) => sum + card.redeemedMonthlyValue,
      0
    ),
    remainingMonthlyValue: cards.reduce(
      (sum, card) => sum + card.remainingMonthlyValue,
      0
    ),
    expiringSoonCount: cards.reduce(
      (sum, card) =>
        sum + card.perks.filter((perk) => perk.isExpiringSoon).length,
      0
    ),
  }
}
