export interface IFeaturePageFaq {
  answer: string
  question: string
}

export interface IFeaturePageContent {
  categoryLabel: string
  description: string
  faqItems: IFeaturePageFaq[]
  keyBenefits: string[]
  longTailKeywords: string[]
  metaDescription: string
  metaTitle: string
  slug: string
  summary: string
  title: string
  useCases: string[]
}

export const featurePages: IFeaturePageContent[] = [
  {
    slug: 'budgeting-and-cash-flow-forecasting',
    title: 'Budgeting and Cash Flow Forecasting',
    categoryLabel: 'Budgeting',
    summary:
      'Plan monthly spending, track category limits, and forecast cash flow with a clearer view of what is safe to spend.',
    description:
      'FinanceFlow helps you manage monthly budgets and forecast short-term cash flow in one workspace. Instead of tracking categories in a spreadsheet and checking balances in a separate app, you can see spending progress, expected bills, and projected runway together. This makes it easier to avoid overdrafts, adjust categories early, and plan upcoming weeks with more confidence.',
    metaTitle:
      'Budgeting and Cash Flow Forecasting Software | FinanceFlow Features',
    metaDescription:
      'Explore FinanceFlow budgeting and cash flow forecasting tools to track spending, monitor category limits, and plan upcoming bills with clearer monthly visibility.',
    keyBenefits: [
      'Track category budgets and overspending risk in one dashboard',
      'See projected cash flow and upcoming outflows before due dates',
      'Adjust budgets quickly when income or expenses change',
      'Reduce spreadsheet work with live account and transaction visibility',
    ],
    useCases: [
      'Monthly household budget planning',
      'Preventing low-cash periods before paycheck dates',
      'Reviewing category overruns before month end',
      'Planning recurring bills and short-term savings goals',
    ],
    longTailKeywords: [
      'personal finance budgeting app with cash flow forecast',
      'monthly budget and cash flow planning software',
      'household cash flow forecasting dashboard',
    ],
    faqItems: [
      {
        question: 'Does this replace a budgeting spreadsheet?',
        answer:
          'For most users, yes. FinanceFlow combines budget tracking, transaction categorization, and cash flow visibility so you can manage your month without manually updating multiple sheets.',
      },
      {
        question: 'Can I see risk before I go over budget?',
        answer:
          'Yes. The budgeting and forecast views are designed to surface categories that are on track, at risk, or likely to run over based on current spending patterns.',
      },
    ],
  },
  {
    slug: 'subscription-tracking-and-renewal-alerts',
    title: 'Subscription Tracking and Renewal Alerts',
    categoryLabel: 'Subscriptions',
    summary:
      'Monitor recurring charges, spot duplicate services, and get renewal reminders before charges hit your account.',
    description:
      'FinanceFlow makes subscription management easier by identifying recurring charges and showing them in one place. You can review upcoming renewals, compare monthly recurring costs, and find opportunities to downgrade or cancel unused services. This is especially useful when subscriptions are spread across multiple cards or bank accounts.',
    metaTitle:
      'Subscription Tracking and Renewal Alerts | FinanceFlow Features',
    metaDescription:
      'Track recurring charges, monitor subscription spending, and get renewal alerts with FinanceFlow subscription management tools for personal finances.',
    keyBenefits: [
      'Centralize recurring subscriptions across multiple accounts',
      'See monthly subscription totals and renewal timing',
      'Catch duplicate or forgotten services faster',
      'Get reminders before recurring charges renew',
    ],
    useCases: [
      'Reducing monthly recurring spending',
      'Reviewing annual renewals before they bill',
      'Tracking streaming, software, and utility subscriptions',
      'Preparing for price increases on recurring services',
    ],
    longTailKeywords: [
      'subscription tracking app with renewal alerts',
      'personal finance recurring bill tracker',
      'subscription manager for bank and card transactions',
    ],
    faqItems: [
      {
        question: 'How does FinanceFlow detect subscriptions?',
        answer:
          'It uses transaction history patterns, recurring merchant behavior, and charge cadence signals to identify likely subscriptions and recurring bills.',
      },
      {
        question: 'Can I use this for annual subscriptions too?',
        answer:
          'Yes. Renewal reminders and recurring tracking are useful for monthly, quarterly, and annual subscriptions so you can review charges before they post.',
      },
    ],
  },
  {
    slug: 'ai-financial-insights-and-assistant',
    title: 'AI Financial Insights and Assistant',
    categoryLabel: 'AI Insights',
    summary:
      'Ask better finance questions, get context-aware insights, and identify spending trends without manually building reports.',
    description:
      'FinanceFlow includes AI-assisted financial insights designed for everyday decision-making. Instead of only showing charts, the app highlights what changed, why it matters, and what to do next. You can review spending patterns, ask follow-up questions, and get guidance that is grounded in your actual account activity and budgets.',
    metaTitle:
      'AI Financial Insights and Budget Assistant | FinanceFlow Features',
    metaDescription:
      'Use FinanceFlow AI financial insights and assistant tools to understand spending trends, ask finance questions, and get clear next-step guidance.',
    keyBenefits: [
      'Get plain-language explanations of spending changes and trends',
      'Ask follow-up questions without rebuilding filters or reports',
      'Surface financial risks, unusual activity, and planning opportunities',
      'Turn raw transaction data into practical next actions',
    ],
    useCases: [
      'Understanding why expenses increased this month',
      'Finding categories to trim without affecting priorities',
      'Reviewing unusual transactions before they become a problem',
      'Planning next steps for savings and budget adjustments',
    ],
    longTailKeywords: [
      'ai personal finance insights app',
      'ai budget assistant for spending analysis',
      'financial dashboard with ai recommendations',
    ],
    faqItems: [
      {
        question: 'Is the AI assistant generic or based on my data?',
        answer:
          'The assistant is designed to be context-aware so insights can reflect your budgets, transactions, and account activity rather than generic finance advice alone.',
      },
      {
        question: 'Can I use AI insights without the full Pro plan?',
        answer:
          'FinanceFlow supports plan-based access. Basic and Pro offer different levels of AI access and advanced insight features.',
      },
    ],
  },
  {
    slug: 'financial-reporting-and-export-tools',
    title: 'Financial Reporting and Export Tools',
    categoryLabel: 'Reporting',
    summary:
      'Export finance data to Excel and PDF, review summaries, and share readable reports without messy spreadsheets.',
    description:
      'FinanceFlow reporting tools are built for people who need clean outputs, not raw dumps. You can generate spreadsheet-ready exports for analysis and printable PDF reports for review or sharing. This is useful for personal financial reviews, advisor meetings, and keeping clean records without manually formatting exports every month.',
    metaTitle:
      'Financial Reporting and Excel/PDF Exports | FinanceFlow Features',
    metaDescription:
      'Generate clean financial reports and Excel or PDF exports with FinanceFlow for budgeting reviews, spending analysis, and record keeping.',
    keyBenefits: [
      'Export readable Excel files designed for sorting and filtering',
      'Generate clean PDF reports for review and sharing',
      'Keep reporting tied to the same dashboard data you use daily',
      'Reduce manual formatting work for monthly financial reviews',
    ],
    useCases: [
      'Monthly personal finance reviews',
      'Preparing reports for advisors or partners',
      'Tracking budget and spending trends in Excel',
      'Saving printable summaries for record keeping',
    ],
    longTailKeywords: [
      'personal finance app excel export',
      'financial dashboard pdf report export',
      'budget and spending report generator app',
    ],
    faqItems: [
      {
        question: 'Can I export to Excel and still filter the data?',
        answer:
          'Yes. FinanceFlow exports are designed to open cleanly in Excel with readable columns that support sorting and filtering workflows.',
      },
      {
        question: 'Is the PDF export a real report or a screenshot?',
        answer:
          'The PDF flow is built for a clean, readable report experience so you can review or save a professional summary instead of relying on a raw screenshot.',
      },
    ],
  },
]

export const featurePagesBySlug = new Map(
  featurePages.map((featurePage) => [featurePage.slug, featurePage])
)
