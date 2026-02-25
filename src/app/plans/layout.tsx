import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description:
    'Compare FinanceFlow Free, Basic, and Pro plans with monthly and annual pricing, feature access, and billing options for personal finance management.',
  alternates: {
    canonical: '/plans',
  },
  openGraph: {
    title: 'FinanceFlow Pricing Plans',
    description:
      'Compare Free, Basic, and Pro plans with monthly and annual billing, AI features, exports, and advanced personal finance tools.',
    url: '/plans',
  },
  twitter: {
    title: 'FinanceFlow Pricing Plans',
    description:
      'Compare Free, Basic, and Pro plans with monthly and annual billing, AI features, exports, and advanced personal finance tools.',
  },
}

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
