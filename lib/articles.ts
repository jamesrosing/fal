import { Article, ArticleCategory, ArticleSubcategories } from './types';

// Sample articles data
export const articles: Article[] = [
  {
    id: '1',
    slug: 'latest-news-article',
    title: 'Latest News in Aesthetic Medicine',
    excerpt: 'Stay updated with the newest trends and innovations in aesthetic medicine.',
    image: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/hero/hero-articles',
    category: 'latest-news',
    date: '2023-06-15',
    author: 'Dr. Smith',
    readTime: '5 min'
  },
  {
    id: '2',
    slug: 'plastic-surgery-innovations',
    title: 'New Innovations in Plastic Surgery',
    excerpt: 'Discover the latest techniques and technologies in plastic surgery procedures.',
    image: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/hero/hero-articles',
    category: 'plastic-surgery',
    subcategory: 'face',
    date: '2023-05-20',
    author: 'Dr. Johnson',
    readTime: '8 min'
  },
  {
    id: '3',
    slug: 'dermatology-treatments',
    title: 'Advanced Dermatology Treatments',
    excerpt: 'Learn about cutting-edge treatments for common skin conditions.',
    image: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/hero/hero-articles',
    category: 'dermatology',
    subcategory: 'medical',
    date: '2023-04-10',
    author: 'Dr. Williams',
    readTime: '6 min'
  },
  {
    id: '4',
    slug: 'medical-spa-services',
    title: 'Popular Medical Spa Services',
    excerpt: 'Explore the most sought-after medical spa treatments and their benefits.',
    image: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/hero/hero-articles',
    category: 'medical-spa',
    subcategory: 'injectables',
    date: '2023-03-25',
    author: 'Dr. Brown',
    readTime: '7 min'
  },
  {
    id: '5',
    slug: 'functional-medicine-approach',
    title: 'The Functional Medicine Approach',
    excerpt: 'Understanding how functional medicine addresses the root causes of health issues.',
    image: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/hero/hero-articles',
    category: 'functional-medicine',
    subcategory: 'wellness',
    date: '2023-02-18',
    author: 'Dr. Davis',
    readTime: '10 min'
  },
  {
    id: '6',
    slug: 'educational-guide-skincare',
    title: 'Complete Guide to Skincare',
    excerpt: 'An educational guide to developing an effective skincare routine.',
    image: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/hero/hero-articles',
    category: 'educational',
    date: '2023-01-10',
    author: 'Dr. Wilson',
    readTime: '12 min'
  }
];

// Article categories with display names
export const ARTICLE_CATEGORIES = [
  { id: 'latest-news' as ArticleCategory, name: 'Latest News', description: 'Recent updates and news in aesthetic medicine' },
  { id: 'plastic-surgery' as ArticleCategory, name: 'Plastic Surgery', description: 'Information about plastic surgery procedures' },
  { id: 'dermatology' as ArticleCategory, name: 'Dermatology', description: 'Skin health and dermatological treatments' },
  { id: 'medical-spa' as ArticleCategory, name: 'Medical Spa', description: 'Non-surgical aesthetic treatments' },
  { id: 'functional-medicine' as ArticleCategory, name: 'Functional Medicine', description: 'Holistic approach to health and wellness' },
  { id: 'educational' as ArticleCategory, name: 'Educational', description: 'Educational resources and guides' }
];

// Subcategories for each main category
export const ARTICLE_SUBCATEGORIES: Record<ArticleCategory, { id: string, name: string }[]> = {
  'plastic-surgery': [
    { id: 'face', name: 'Face' },
    { id: 'breast', name: 'Breast' },
    { id: 'body', name: 'Body' }
  ],
  'dermatology': [
    { id: 'medical', name: 'Medical Dermatology' },
    { id: 'cosmetic', name: 'Cosmetic Dermatology' },
    { id: 'conditions', name: 'Skin Conditions' }
  ],
  'medical-spa': [
    { id: 'injectables', name: 'Injectables' },
    { id: 'laser', name: 'Laser Treatments' },
    { id: 'skincare', name: 'Professional Skincare' }
  ],
  'functional-medicine': [
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'hormone', name: 'Hormone Health' },
    { id: 'wellness', name: 'Wellness' }
  ],
  'latest-news': [],
  'educational': []
};

// Helper function to get article by slug
export function getArticleBySlug(slug: string): Article | undefined {
  if (!slug) return undefined;
  return articles.find(article => article.slug === slug);
}

// Helper function to get related articles
export function getRelatedArticles(article: Article, limit: number = 3): Article[] {
  if (!article) return [];
  return articles
    .filter(a => a.id !== article.id && a.category === article.category)
    .slice(0, limit);
} 