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
  featured_image?: string; // For compatibility with database naming
  
  // Categorization
  category?: ArticleCategory | string;
  category_id?: string; // For compatibility with database naming
  categoryName?: string; // For displaying category name
  subcategory?: ArticleSubcategories[ArticleCategory];
  tags?: string[];
  
  // Metadata
  author?: string;
  authorId?: string;
  author_id?: string; // For compatibility with database naming
  date?: string;
  publishedAt?: string;
  published_at?: string; // For compatibility with database naming
  createdAt?: string;
  created_at?: string; // For compatibility with database naming
  updatedAt?: string;
  updated_at?: string; // For compatibility with database naming
  readTime?: string | number;
  reading_time?: number; // For compatibility with database naming
  status?: ArticleStatus;
  
  // SEO
  metaDescription?: string;
  meta_description?: string; // For compatibility with database naming
  metaKeywords?: string[];
  meta_keywords?: string[]; // For compatibility with database naming
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

/**
 * Media Placeholder Types
 * 
 * These types define the structure of media placeholders in the application.
 */

export type MediaPlaceholder = {
  id: string;
  type: 'image' | 'video';
  page: string;
  section?: string;
  container?: string;
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  description?: string;
};

export type MediaAsset = {
  id: string;
  placeholder_id: string;
  cloudinary_id: string;
  type: 'image' | 'video';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}; 