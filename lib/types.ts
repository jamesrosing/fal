/**
 * Standardized Article Types
 * This file contains the unified article data model used throughout the application
 */

/**
 * Article content block types
 */
export type ArticleContentType = 
  | 'paragraph' 
  | 'heading' 
  | 'image' 
  | 'video' 
  | 'quote' 
  | 'list'
  | 'callout';

/**
 * Article content block
 */
export interface ArticleContent {
  type: ArticleContentType;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Article status
 */
export type ArticleStatus = 'draft' | 'published' | 'archived';

/**
 * Main categories for articles
 */
export type ArticleCategory = 
  | 'latest-news'
  | 'plastic-surgery'
  | 'dermatology'
  | 'medical-spa'
  | 'functional-medicine'
  | 'educational';

/**
 * Subcategories for each main category
 */
export interface ArticleSubcategories {
  'plastic-surgery': 'face' | 'breast' | 'body';
  'dermatology': 'medical' | 'cosmetic' | 'conditions';
  'medical-spa': 'injectables' | 'laser' | 'skincare';
  'functional-medicine': 'nutrition' | 'hormone' | 'wellness';
  'latest-news': never;
  'educational': never;
}

/**
 * Unified Article interface
 */
export interface Article {
  // Core identifiers
  id: string;
  slug: string;
  
  // Content
  title: string;
  subtitle?: string;
  excerpt: string;
  content?: string | ArticleContent[];
  
  // Media
  image: string;
  featuredVideo?: string;
  
  // Categorization
  category: ArticleCategory;
  subcategory?: ArticleSubcategories[ArticleCategory];
  tags?: string[];
  
  // Metadata
  author?: string;
  authorId?: string;
  date: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  readTime?: string | number;
  status?: ArticleStatus;
  
  // SEO
  metaDescription?: string;
  metaKeywords?: string[];
  structuredData?: Record<string, any>;
}

/**
 * Article category definition with display name
 */
export interface CategoryDefinition {
  id: ArticleCategory;
  name: string;
  description?: string;
}

/**
 * Subcategory definition with display name
 */
export interface SubcategoryDefinition {
  id: string;
  name: string;
  description?: string;
}

/**
 * Category and subcategory definitions
 */
export const ARTICLE_CATEGORIES: CategoryDefinition[] = [
  { id: 'latest-news', name: 'Latest News' },
  { id: 'plastic-surgery', name: 'Plastic Surgery' },
  { id: 'dermatology', name: 'Dermatology' },
  { id: 'medical-spa', name: 'Medical Spa' },
  { id: 'functional-medicine', name: 'Functional Medicine' },
  { id: 'educational', name: 'Educational' },
];

export const ARTICLE_SUBCATEGORIES: Record<ArticleCategory, SubcategoryDefinition[]> = {
  'latest-news': [],
  'educational': [],
  'plastic-surgery': [
    { id: 'face', name: 'Face' },
    { id: 'breast', name: 'Breast' },
    { id: 'body', name: 'Body' },
  ],
  'dermatology': [
    { id: 'medical', name: 'Medical Dermatology' },
    { id: 'cosmetic', name: 'Cosmetic Treatments' },
    { id: 'conditions', name: 'Skin Conditions' },
  ],
  'medical-spa': [
    { id: 'injectables', name: 'Injectables' },
    { id: 'laser', name: 'Laser Treatments' },
    { id: 'skincare', name: 'Skincare' },
  ],
  'functional-medicine': [
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'hormone', name: 'Hormone Therapy' },
    { id: 'wellness', name: 'Wellness' },
  ],
}; 