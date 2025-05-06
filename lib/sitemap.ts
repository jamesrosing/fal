import { MetadataRoute } from 'next';

/**
 * Generates sitemap.xml for the site
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://allure-md.com';
  
  // Core pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/services',
    '/services/plastic-surgery',
    '/services/plastic-surgery/body',
    '/services/plastic-surgery/breast',
    '/services/plastic-surgery/head-and-neck',
    '/services/dermatology',
    '/services/dermatology/acne',
    '/services/dermatology/eczema',
    '/services/dermatology/psoriasis',
    '/services/dermatology/rosacea',
    '/services/dermatology/skin-screening',
    '/services/medical-spa',
    '/services/medical-spa/cosmetic-injections',
    '/services/medical-spa/emsculpt',
    '/services/medical-spa/esthetician-services',
    '/services/medical-spa/rf-microneedling',
    '/services/medical-spa/shapescale',
    '/services/medical-spa/skin-lasers',
    '/services/functional-medicine',
    '/services/functional-medicine/cardiometabolic-optimization',
    '/services/functional-medicine/epigenetic-optimization',
    '/services/functional-medicine/hair-restoration',
    '/services/functional-medicine/hormone-optimization',
    '/services/functional-medicine/neurocognitive-performance',
    '/services/functional-medicine/sleep-travel-optimization',
    '/team',
    '/gallery',
    '/reviews',
    '/financing',
    '/appointment',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1.0 : 0.8,
  }));

  // TODO: Add dynamic routes from database (articles, gallery items, etc.)
  // This would require fetching data from the database
  // For now, we'll return just the static routes
  
  return [...staticPages];
} 