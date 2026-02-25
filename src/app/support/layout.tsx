import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support & Help Center',
  description:
    'Get FinanceFlow support, contact help, and browse answers to billing, account, exports, and security questions in the FinanceFlow help center.',
  alternates: {
    canonical: '/support',
  },
  openGraph: {
    title: 'FinanceFlow Support & Help Center',
    description:
      'Get help with billing, accounts, exports, and security questions, or contact the FinanceFlow support team.',
    url: '/support',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'FinanceFlow support and help center',
      },
    ],
  },
  twitter: {
    title: 'FinanceFlow Support & Help Center',
    description:
      'Get help with billing, accounts, exports, and security questions, or contact the FinanceFlow support team.',
    images: ['/twitter-image'],
  },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
