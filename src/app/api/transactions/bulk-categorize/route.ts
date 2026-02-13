import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { seedCategories } from '@/lib/seed-categories'
import { categorizeTransaction } from '@/lib/ai'
import { getUserCacheKey, invalidateCacheKeys } from '@/lib/server-cache'
import { isDemoModeRequest } from '@/lib/demo-mode'

export async function POST(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      const body = await request.json().catch(() => ({}))
      const transactionIds = Array.isArray(body?.transactionIds)
        ? body.transactionIds
        : []
      return NextResponse.json({
        message: `Demo categorized ${transactionIds.length} transactions`,
        results: transactionIds.map((id: string) => ({
          transactionId: id,
          suggestedCategory: 'Food & Dining',
          confidence: 0.72,
          reason: 'Demo categorization',
        })),
      })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: session.user.id }, { userId: null }],
      },
      select: {
        id: true,
        name: true,
      },
    })
    if (categories.length === 0) {
      categories = await seedCategories(session.user.id)
    }
    const categoryIdByName = new Map(
      categories.map((category) => [
        category.name.trim().toLowerCase(),
        category.id,
      ])
    )

    const body = await request.json()
    const { transactionIds } = body

    if (!transactionIds || !Array.isArray(transactionIds)) {
      return NextResponse.json(
        { error: 'Invalid transaction IDs' },
        { status: 400 }
      )
    }

    // Get uncategorized transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: session.user.id,
        OR: [
          { categoryId: null },
          { category: null },
          { category: 'Other' },
          { category: 'Uncategorized' },
        ],
      },
      select: {
        id: true,
        description: true,
        amount: true,
        category: true,
      },
    })

    if (transactions.length === 0) {
      return NextResponse.json({
        message: 'No uncategorized transactions found',
      })
    }

    // Categorize each transaction
    const categorizationResults = []
    for (const transaction of transactions) {
      try {
        const result = await categorizeTransaction(
          transaction.description,
          transaction.amount
        )
        categorizationResults.push({
          transactionId: transaction.id,
          suggestedCategory: result.category,
          confidence: result.confidence,
          reason: `AI analysis based on description: "${transaction.description}"`,
        })
      } catch (error) {
        console.error(
          `Failed to categorize transaction ${transaction.id}:`,
          error
        )
        // Use fallback categorization
        const fallbackCategory = getFallbackCategory(transaction.description)
        categorizationResults.push({
          transactionId: transaction.id,
          suggestedCategory: fallbackCategory,
          confidence: 0.5,
          reason: 'Rule-based categorization (AI failed)',
        })
      }
    }

    // Update transactions with suggested categories
    const updatePromises = categorizationResults.map((result) => {
      const normalizedCategory = result.suggestedCategory.trim().toLowerCase()
      const matchedCategoryId = categoryIdByName.get(normalizedCategory)

      return prisma.transaction.update({
        where: { id: result.transactionId },
        data: {
          category: result.suggestedCategory,
          categoryId: matchedCategoryId,
        },
      })
    })

    await Promise.all(updatePromises)

    invalidateCacheKeys([
      getUserCacheKey('transactions', session.user.id),
      getUserCacheKey('categories', session.user.id),
    ])

    return NextResponse.json({
      message: `Successfully categorized ${categorizationResults.length} transactions`,
      results: categorizationResults,
    })
  } catch (error) {
    console.error('Bulk categorization error:', error)
    return NextResponse.json(
      { error: 'Failed to categorize transactions' },
      { status: 500 }
    )
  }
}

/**
 * Fallback categorization when AI fails
 */
function getFallbackCategory(description: string): string {
  const lowerDesc = description.toLowerCase()

  if (
    lowerDesc.includes('restaurant') ||
    lowerDesc.includes('cafe') ||
    lowerDesc.includes('food') ||
    lowerDesc.includes('grocery') ||
    lowerDesc.includes('mcdonalds') ||
    lowerDesc.includes('burger') ||
    lowerDesc.includes('taco') ||
    lowerDesc.includes('sushi') ||
    lowerDesc.includes('starbucks') ||
    lowerDesc.includes('subway') ||
    lowerDesc.includes('kfc') ||
    lowerDesc.includes('wendys') ||
    lowerDesc.includes('chipotle') ||
    lowerDesc.includes('dominos') ||
    lowerDesc.includes('papa johns')
  ) {
    return 'Food & Dining'
  }
  if (
    lowerDesc.includes('uber') ||
    lowerDesc.includes('lyft') ||
    lowerDesc.includes('gas') ||
    lowerDesc.includes('fuel') ||
    lowerDesc.includes('parking') ||
    lowerDesc.includes('taxi') ||
    lowerDesc.includes('transit') ||
    lowerDesc.includes('bus') ||
    lowerDesc.includes('train') ||
    lowerDesc.includes('metro') ||
    lowerDesc.includes('subway') ||
    lowerDesc.includes('bicycle') ||
    lowerDesc.includes('bike') ||
    lowerDesc.includes('madison bicycle') ||
    lowerDesc.includes('bicycle shop') ||
    lowerDesc.includes('car wash') ||
    lowerDesc.includes('auto') ||
    lowerDesc.includes('repair')
  ) {
    return 'Transportation'
  }
  if (
    lowerDesc.includes('amazon') ||
    lowerDesc.includes('store') ||
    lowerDesc.includes('shop') ||
    lowerDesc.includes('retail') ||
    lowerDesc.includes('mall') ||
    lowerDesc.includes('buy') ||
    lowerDesc.includes('walmart') ||
    lowerDesc.includes('target') ||
    lowerDesc.includes('costco') ||
    lowerDesc.includes('best buy') ||
    lowerDesc.includes('home depot') ||
    lowerDesc.includes('lowes') ||
    lowerDesc.includes('ikea') ||
    lowerDesc.includes('clothing') ||
    lowerDesc.includes('apparel')
  ) {
    return 'Shopping'
  }
  if (
    lowerDesc.includes('netflix') ||
    lowerDesc.includes('spotify') ||
    lowerDesc.includes('movie') ||
    lowerDesc.includes('concert') ||
    lowerDesc.includes('theater') ||
    lowerDesc.includes('show') ||
    lowerDesc.includes('hobby') ||
    lowerDesc.includes('craft') ||
    lowerDesc.includes('art') ||
    lowerDesc.includes('music') ||
    lowerDesc.includes('streaming') ||
    lowerDesc.includes('youtube') ||
    lowerDesc.includes('game') ||
    lowerDesc.includes('disney') ||
    lowerDesc.includes('hulu') ||
    lowerDesc.includes('hbo') ||
    lowerDesc.includes('paramount') ||
    lowerDesc.includes('peacock') ||
    lowerDesc.includes('apple tv') ||
    lowerDesc.includes('prime video') ||
    lowerDesc.includes('amazon prime') ||
    lowerDesc.includes('twitch') ||
    lowerDesc.includes('tiktok') ||
    lowerDesc.includes('instagram') ||
    lowerDesc.includes('facebook') ||
    lowerDesc.includes('twitter') ||
    lowerDesc.includes('reddit') ||
    lowerDesc.includes('discord') ||
    lowerDesc.includes('steam') ||
    lowerDesc.includes('playstation') ||
    lowerDesc.includes('xbox') ||
    lowerDesc.includes('nintendo') ||
    lowerDesc.includes('esports') ||
    lowerDesc.includes('gaming')
  ) {
    return 'Entertainment'
  }
  if (
    lowerDesc.includes('sparkfun') ||
    lowerDesc.includes('electronics') ||
    lowerDesc.includes('computer') ||
    lowerDesc.includes('laptop') ||
    lowerDesc.includes('desktop') ||
    lowerDesc.includes('tablet') ||
    lowerDesc.includes('smartphone') ||
    lowerDesc.includes('software') ||
    lowerDesc.includes('app') ||
    lowerDesc.includes('subscription') ||
    lowerDesc.includes('saas') ||
    lowerDesc.includes('cloud') ||
    lowerDesc.includes('server') ||
    lowerDesc.includes('hosting') ||
    lowerDesc.includes('domain') ||
    lowerDesc.includes('website') ||
    lowerDesc.includes('web hosting') ||
    lowerDesc.includes('github') ||
    lowerDesc.includes('gitlab') ||
    lowerDesc.includes('bitbucket') ||
    lowerDesc.includes('aws') ||
    lowerDesc.includes('amazon web services') ||
    lowerDesc.includes('google cloud') ||
    lowerDesc.includes('azure') ||
    lowerDesc.includes('microsoft azure') ||
    lowerDesc.includes('digitalocean') ||
    lowerDesc.includes('heroku') ||
    lowerDesc.includes('vercel') ||
    lowerDesc.includes('netlify') ||
    lowerDesc.includes('shopify') ||
    lowerDesc.includes('wordpress') ||
    lowerDesc.includes('squarespace') ||
    lowerDesc.includes('wix') ||
    lowerDesc.includes('weebly') ||
    lowerDesc.includes('figma') ||
    lowerDesc.includes('adobe') ||
    lowerDesc.includes('creative cloud') ||
    lowerDesc.includes('office 365') ||
    lowerDesc.includes('microsoft office') ||
    lowerDesc.includes('google workspace') ||
    lowerDesc.includes('g suite') ||
    lowerDesc.includes('slack') ||
    lowerDesc.includes('zoom') ||
    lowerDesc.includes('teams') ||
    lowerDesc.includes('notion') ||
    lowerDesc.includes('asana') ||
    lowerDesc.includes('trello') ||
    lowerDesc.includes('jira') ||
    lowerDesc.includes('confluence') ||
    lowerDesc.includes('dropbox') ||
    lowerDesc.includes('google drive') ||
    lowerDesc.includes('onedrive') ||
    lowerDesc.includes('icloud') ||
    lowerDesc.includes('backblaze') ||
    lowerDesc.includes('carbonite') ||
    lowerDesc.includes('lastpass') ||
    lowerDesc.includes('1password') ||
    lowerDesc.includes('bitwarden') ||
    lowerDesc.includes('dashlane') ||
    lowerDesc.includes('nordvpn') ||
    lowerDesc.includes('expressvpn') ||
    lowerDesc.includes('surfshark') ||
    lowerDesc.includes('protonvpn')
  ) {
    return 'Technology'
  }
  if (
    lowerDesc.includes('electric') ||
    lowerDesc.includes('water') ||
    lowerDesc.includes('phone') ||
    lowerDesc.includes('internet') ||
    lowerDesc.includes('cable') ||
    lowerDesc.includes('wifi') ||
    lowerDesc.includes('power') ||
    lowerDesc.includes('gas company') ||
    lowerDesc.includes('utility') ||
    lowerDesc.includes('energy')
  ) {
    return 'Utilities'
  }
  if (
    lowerDesc.includes('doctor') ||
    lowerDesc.includes('pharmacy') ||
    lowerDesc.includes('medical') ||
    lowerDesc.includes('health') ||
    lowerDesc.includes('dentist') ||
    lowerDesc.includes('hospital') ||
    lowerDesc.includes('clinic') ||
    lowerDesc.includes('cvs') ||
    lowerDesc.includes('walgreens') ||
    lowerDesc.includes('rite aid') ||
    lowerDesc.includes('prescription') ||
    lowerDesc.includes('medicine')
  ) {
    return 'Healthcare'
  }
  if (
    lowerDesc.includes('tectra') ||
    lowerDesc.includes('tectra inc') ||
    lowerDesc.includes('consulting') ||
    lowerDesc.includes('professional') ||
    lowerDesc.includes('expert') ||
    lowerDesc.includes('service') ||
    lowerDesc.includes('repair') ||
    lowerDesc.includes('maintenance') ||
    lowerDesc.includes('cleaning') ||
    lowerDesc.includes('laundry') ||
    lowerDesc.includes('dry cleaning') ||
    lowerDesc.includes('landscaping') ||
    lowerDesc.includes('gardening') ||
    lowerDesc.includes('pool service') ||
    lowerDesc.includes('housekeeping') ||
    lowerDesc.includes('maid service') ||
    lowerDesc.includes('janitorial') ||
    lowerDesc.includes('security') ||
    lowerDesc.includes('alarm') ||
    lowerDesc.includes('monitoring') ||
    lowerDesc.includes('installation') ||
    lowerDesc.includes('setup') ||
    lowerDesc.includes('assembly') ||
    lowerDesc.includes('delivery') ||
    lowerDesc.includes('shipping') ||
    lowerDesc.includes('freight') ||
    lowerDesc.includes('logistics') ||
    lowerDesc.includes('storage') ||
    lowerDesc.includes('warehouse') ||
    lowerDesc.includes('moving') ||
    lowerDesc.includes('relocation') ||
    lowerDesc.includes('packing') ||
    lowerDesc.includes('unpacking') ||
    lowerDesc.includes('organizing') ||
    lowerDesc.includes('decluttering') ||
    lowerDesc.includes('interior design') ||
    lowerDesc.includes('decorating') ||
    lowerDesc.includes('renovation') ||
    lowerDesc.includes('remodeling') ||
    lowerDesc.includes('construction') ||
    lowerDesc.includes('contractor') ||
    lowerDesc.includes('plumber') ||
    lowerDesc.includes('electrician') ||
    lowerDesc.includes('hvac') ||
    lowerDesc.includes('heating') ||
    lowerDesc.includes('cooling') ||
    lowerDesc.includes('ac repair') ||
    lowerDesc.includes('heater repair') ||
    lowerDesc.includes('furnace repair') ||
    lowerDesc.includes('appliance repair') ||
    lowerDesc.includes('computer repair') ||
    lowerDesc.includes('phone repair') ||
    lowerDesc.includes('screen repair') ||
    lowerDesc.includes('battery replacement') ||
    lowerDesc.includes('key replacement') ||
    lowerDesc.includes('lock repair') ||
    lowerDesc.includes('garage door') ||
    lowerDesc.includes('gate repair') ||
    lowerDesc.includes('fence repair') ||
    lowerDesc.includes('roof repair') ||
    lowerDesc.includes('gutter cleaning') ||
    lowerDesc.includes('window cleaning') ||
    lowerDesc.includes('pressure washing') ||
    lowerDesc.includes('pest control') ||
    lowerDesc.includes('exterminator') ||
    lowerDesc.includes('termite') ||
    lowerDesc.includes('rodent') ||
    lowerDesc.includes('insect') ||
    lowerDesc.includes('weed control') ||
    lowerDesc.includes('fertilizer') ||
    lowerDesc.includes('irrigation') ||
    lowerDesc.includes('sprinkler') ||
    lowerDesc.includes('tree service') ||
    lowerDesc.includes('tree trimming') ||
    lowerDesc.includes('tree removal') ||
    lowerDesc.includes('stump grinding') ||
    lowerDesc.includes('mulch') ||
    lowerDesc.includes('soil') ||
    lowerDesc.includes('compost') ||
    lowerDesc.includes('pesticide') ||
    lowerDesc.includes('herbicide')
  ) {
    return 'Services'
  }
  if (
    lowerDesc.includes('salary') ||
    lowerDesc.includes('payroll') ||
    lowerDesc.includes('deposit') ||
    lowerDesc.includes('direct deposit') ||
    lowerDesc.includes('paycheck') ||
    lowerDesc.includes('income') ||
    lowerDesc.includes('gusto') ||
    lowerDesc.includes('gusto pay') ||
    lowerDesc.includes('ach electronic creditgusto pay') ||
    lowerDesc.includes('pay') ||
    lowerDesc.includes('wage')
  ) {
    return 'Salary'
  }
  if (
    lowerDesc.includes('service') ||
    lowerDesc.includes('repair') ||
    lowerDesc.includes('maintenance') ||
    lowerDesc.includes('cleaning') ||
    lowerDesc.includes('laundry') ||
    lowerDesc.includes('dry cleaning') ||
    lowerDesc.includes('tectra') ||
    lowerDesc.includes('tectra inc') ||
    lowerDesc.includes('consulting') ||
    lowerDesc.includes('professional') ||
    lowerDesc.includes('expert')
  ) {
    return 'Services'
  }
  if (
    lowerDesc.includes('technology') ||
    lowerDesc.includes('tech') ||
    lowerDesc.includes('software') ||
    lowerDesc.includes('app') ||
    lowerDesc.includes('digital') ||
    lowerDesc.includes('computer') ||
    lowerDesc.includes('sparkfun') ||
    lowerDesc.includes('electronics') ||
    lowerDesc.includes('gadget') ||
    lowerDesc.includes('device')
  ) {
    return 'Technology'
  }
  if (
    lowerDesc.includes('business') ||
    lowerDesc.includes('office') ||
    lowerDesc.includes('work') ||
    lowerDesc.includes('professional') ||
    lowerDesc.includes('corporate') ||
    lowerDesc.includes('meeting') ||
    lowerDesc.includes('conference') ||
    lowerDesc.includes('expense') ||
    lowerDesc.includes('client')
  ) {
    return 'Business'
  }
  if (
    lowerDesc.includes('rent') ||
    lowerDesc.includes('mortgage') ||
    lowerDesc.includes('home') ||
    lowerDesc.includes('apartment') ||
    lowerDesc.includes('house')
  ) {
    return 'Housing'
  }
  if (
    lowerDesc.includes('tuition') ||
    lowerDesc.includes('school') ||
    lowerDesc.includes('college') ||
    lowerDesc.includes('university') ||
    lowerDesc.includes('course') ||
    lowerDesc.includes('training') ||
    lowerDesc.includes('book') ||
    lowerDesc.includes('textbook') ||
    lowerDesc.includes('library') ||
    lowerDesc.includes('student')
  ) {
    return 'Education'
  }
  if (
    lowerDesc.includes('hotel') ||
    lowerDesc.includes('flight') ||
    lowerDesc.includes('airline') ||
    lowerDesc.includes('vacation') ||
    lowerDesc.includes('trip') ||
    lowerDesc.includes('travel') ||
    lowerDesc.includes('airbnb') ||
    lowerDesc.includes('booking') ||
    lowerDesc.includes('expedia') ||
    lowerDesc.includes('orbitz')
  ) {
    return 'Travel'
  }
  if (
    lowerDesc.includes('insurance') ||
    lowerDesc.includes('geico') ||
    lowerDesc.includes('state farm') ||
    lowerDesc.includes('allstate') ||
    lowerDesc.includes('progressive')
  ) {
    return 'Insurance'
  }
  if (
    lowerDesc.includes('investment') ||
    lowerDesc.includes('stock') ||
    lowerDesc.includes('bond') ||
    lowerDesc.includes('retirement') ||
    lowerDesc.includes('401k') ||
    lowerDesc.includes('ira') ||
    lowerDesc.includes('robinhood') ||
    lowerDesc.includes('fidelity') ||
    lowerDesc.includes('vanguard') ||
    lowerDesc.includes('schwab')
  ) {
    return 'Investment'
  }
  if (
    lowerDesc.includes('freelance') ||
    lowerDesc.includes('contract') ||
    lowerDesc.includes('consulting') ||
    lowerDesc.includes('upwork') ||
    lowerDesc.includes('fiverr') ||
    lowerDesc.includes('gig') ||
    lowerDesc.includes('independent') ||
    lowerDesc.includes('self-employed')
  ) {
    return 'Freelance'
  }
  if (
    lowerDesc.includes('gift') ||
    lowerDesc.includes('present') ||
    lowerDesc.includes('donation') ||
    lowerDesc.includes('charity') ||
    lowerDesc.includes('give') ||
    lowerDesc.includes('contribution')
  ) {
    return 'Gifts'
  }
  if (
    lowerDesc.includes('subscription') ||
    lowerDesc.includes('membership') ||
    lowerDesc.includes('recurring') ||
    lowerDesc.includes('monthly') ||
    lowerDesc.includes('annual') ||
    lowerDesc.includes('hulu') ||
    lowerDesc.includes('disney') ||
    lowerDesc.includes('amazon prime')
  ) {
    return 'Subscriptions'
  }
  if (
    lowerDesc.includes('haircut') ||
    lowerDesc.includes('salon') ||
    lowerDesc.includes('beauty') ||
    lowerDesc.includes('grooming') ||
    lowerDesc.includes('spa') ||
    lowerDesc.includes('massage') ||
    lowerDesc.includes('nail') ||
    lowerDesc.includes('cosmetic') ||
    lowerDesc.includes('personal care')
  ) {
    return 'Personal Care'
  }
  if (
    lowerDesc.includes('gym') ||
    lowerDesc.includes('fitness') ||
    lowerDesc.includes('workout') ||
    lowerDesc.includes('exercise') ||
    lowerDesc.includes('sports') ||
    lowerDesc.includes('athletic') ||
    lowerDesc.includes('planet fitness') ||
    lowerDesc.includes('la fitness') ||
    lowerDesc.includes('24 hour fitness')
  ) {
    return 'Fitness'
  }
  if (
    lowerDesc.includes('pet') ||
    lowerDesc.includes('dog') ||
    lowerDesc.includes('cat') ||
    lowerDesc.includes('veterinary') ||
    lowerDesc.includes('vet') ||
    lowerDesc.includes('animal') ||
    lowerDesc.includes('petco') ||
    lowerDesc.includes('petsmart')
  ) {
    return 'Pets'
  }
  if (
    lowerDesc.includes('charity') ||
    lowerDesc.includes('nonprofit') ||
    lowerDesc.includes('foundation') ||
    lowerDesc.includes('cause') ||
    lowerDesc.includes('help')
  ) {
    return 'Charity'
  }
  if (
    lowerDesc.includes('legal') ||
    lowerDesc.includes('lawyer') ||
    lowerDesc.includes('attorney') ||
    lowerDesc.includes('court') ||
    lowerDesc.includes('law') ||
    lowerDesc.includes('legal fee')
  ) {
    return 'Legal'
  }
  if (
    lowerDesc.includes('tax') ||
    lowerDesc.includes('irs') ||
    lowerDesc.includes('filing') ||
    lowerDesc.includes('tax return') ||
    lowerDesc.includes('tax payment')
  ) {
    return 'Taxes'
  }

  return 'Other'
}
