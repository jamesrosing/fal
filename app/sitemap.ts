import { MetadataRoute } from 'next'

const baseUrl = 'https://www.alluremd.com' // Replace with your actual domain

// Core pages that should always be in the sitemap
const corePages = [
  {
    url: '/',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: '/services',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    url: '/services/plastic-surgery',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: '/services/dermatology',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: '/services/medical-spa',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: '/services/functional-medicine',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: '/team',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: '/about',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: '/contact',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: '/appointment',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // You can add dynamic pages here by fetching from your database
  // For example, blog posts, service pages, etc.
  
  // Format all URLs to include the base URL
  const formattedPages = corePages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
    priority: page.priority,
  }))

  return formattedPages
} 