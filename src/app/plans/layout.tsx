import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | Free, Basic & Pro Personal Finance Plans',
  description:
    'Compare FinanceFlow Free, Basic, and Pro plans with monthly and annual billing, AI features, exports, and premium finance tools to choose the right plan fast.',
  alternates: {
    canonical: '/plans',
  },
  openGraph: {
    title: 'FinanceFlow Pricing | Free, Basic & Pro Plans',
    description:
      'See FinanceFlow pricing for Free, Basic, and Pro with monthly or annual billing, AI features, exports, and premium finance tools.',
    url: '/plans',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FinanceFlow pricing and dashboard preview',
      },
    ],
  },
  twitter: {
    title: 'FinanceFlow Pricing | Free, Basic & Pro Plans',
    description:
      'See FinanceFlow pricing for Free, Basic, and Pro with monthly or annual billing, AI features, exports, and premium finance tools.',
    images: ['/twitter-image'],
  },
}

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
