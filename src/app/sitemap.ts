import type { MetadataRoute } from 'next'
import { featurePages } from '@/lib/feature-pages'

const getSiteUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '')
  }
  return 'https://www.financeflow.dev'
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const lastModified = new Date()
  const featurePageEntries = featurePages.map((featurePage) => ({
    url: `${siteUrl}/features/${featurePage.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    lastModified,
  }))

  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: 'weekly',
      priority: 1,
      lastModified,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: 'monthly',
      priority: 0.6,
      lastModified,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.65,
      lastModified,
    },
    {
      url: `${siteUrl}/features`,
      changeFrequency: 'weekly',
      priority: 0.85,
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
      url: `${siteUrl}/cookies`,
      changeFrequency: 'monthly',
      priority: 0.3,
      lastModified,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: 'monthly',
      priority: 0.4,
      lastModified,
    },
    {
      url: `${siteUrl}/security`,
      changeFrequency: 'monthly',
      priority: 0.6,
      lastModified,
    },
    {
      url: `${siteUrl}/status`,
      changeFrequency: 'daily',
      priority: 0.5,
      lastModified,
    },
    ...featurePageEntries,
  ]
}
