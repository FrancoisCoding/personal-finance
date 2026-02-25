import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinanceFlow',
    short_name: 'FinanceFlow',
    description:
      'AI-powered personal finance management for budgeting, subscriptions, insights, and financial planning.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#14b8a6',
    categories: ['finance', 'productivity', 'business'],
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
