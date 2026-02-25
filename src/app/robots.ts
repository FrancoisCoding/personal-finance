import type { MetadataRoute } from 'next'

const getSiteUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '')
  }
  return 'https://www.financeflow.dev'
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/about',
        '/contact',
        '/features',
        '/plans',
        '/privacy',
        '/support',
        '/terms',
        '/cookies',
        '/security',
        '/status',
      ],
      disallow: [
        '/admin',
        '/api',
        '/auth',
        '/accounts',
        '/assistant',
        '/billing',
        '/budgets',
        '/card-perks',
        '/credit-score',
        '/dashboard',
        '/goals',
        '/investments',
        '/notifications',
        '/invoices',
        '/profile',
        '/settings',
        '/security-settings',
        '/subscriptions',
        '/transactions',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
