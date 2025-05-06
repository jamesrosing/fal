import { MetadataRoute } from 'next';

/**
 * Generates robots.txt configuration for the site
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://allure-md.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/auth/',
        '/profile/',
        '/upload/',
        '/*.json$',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
} 