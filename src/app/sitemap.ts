import type { MetadataRoute } from 'next'

const getSiteUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '')
  }
  return 'https://financeflow.dev'
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()

  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: 'weekly',
      priority: 1,
      lastModified,
    },
    {
      url: `${siteUrl}/plans`,
      changeFrequency: 'weekly',
      priority: 0.9,
      lastModified,
    },
    {
      url: `${siteUrl}/support`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified,
    },
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: 'monthly',
      priority: 0.4,
      lastModified,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: 'monthly',
      priority: 0.4,
      lastModified,
    },
  ]
}
