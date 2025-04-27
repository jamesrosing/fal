// Script to import static articles from lib/articles.ts into Supabase database
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { existsSync } from 'fs';
import { resolve } from 'path';

// First try to load .env.local, then fall back to .env if it exists
if (existsSync(resolve(process.cwd(), '.env.local'))) {
  config({ path: '.env.local' });
} else if (existsSync(resolve(process.cwd(), '.env'))) {
  config();
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Hardcoded article categories (copied from lib/types.ts and lib/articles.ts)
const ARTICLE_CATEGORIES = [
  { id: 'latest-news', name: 'Latest News', description: 'Recent updates and news in aesthetic medicine' },
  { id: 'plastic-surgery', name: 'Plastic Surgery', description: 'Information about plastic surgery procedures' },
  { id: 'dermatology', name: 'Dermatology', description: 'Dermatology treatments and skin health' },
  { id: 'medical-spa', name: 'Medical Spa', description: 'Non-surgical aesthetic treatments' },
  { id: 'functional-medicine', name: 'Functional Medicine', description: 'Holistic approach to health and wellness' },
  { id: 'educational', name: 'Educational', description: 'Educational resources about aesthetic medicine' },
];

// Hardcoded articles (copied from lib/articles.ts)
const articles = [
  {
    id: '1',
    slug: 'latest-news-article',
    title: 'Latest News in Aesthetic Medicine',
    excerpt: 'Stay updated with the newest trends and innovations in aesthetic medicine.',
    image: 'hero/hero-articles',
    category: 'latest-news',
    date: '2023-06-15',
    author: 'Dr. Smith',
    readTime: '5 min',
    content: 'The field of aesthetic medicine is constantly evolving with new technologies and techniques.\n\nIn recent developments, more minimally invasive procedures are gaining popularity as patients seek effective treatments with less downtime.\n\nNew research is also focusing on combining different modalities for synergistic effects that provide more natural-looking results.'
  },
  {
    id: '2',
    slug: 'plastic-surgery-innovations',
    title: 'New Innovations in Plastic Surgery',
    excerpt: 'Discover the latest techniques and technologies in plastic surgery procedures.',
    image: 'hero/hero-articles',
    category: 'plastic-surgery',
    subcategory: 'face',
    date: '2023-05-22',
    author: 'Dr. Johnson',
    readTime: '8 min',
    content: 'Plastic surgery is advancing rapidly with new techniques that offer better results and faster recovery times.\n\nThe use of 3D imaging and planning has revolutionized the field, allowing surgeons to preview results and plan procedures with unprecedented precision.\n\nInnovative suturing methods and tissue handling are reducing scarring and improving overall outcomes for patients seeking aesthetic improvements.'
  },
  {
    id: '3',
    slug: 'dermatology-advances',
    title: 'Advances in Cosmetic Dermatology',
    excerpt: 'Learn about the latest treatments and procedures in cosmetic dermatology.',
    image: 'hero/hero-articles',
    category: 'dermatology',
    subcategory: 'cosmetic',
    date: '2023-04-15',
    author: 'Dr. Brown',
    readTime: '6 min',
    content: 'Cosmetic dermatology offers numerous non-surgical options for skin rejuvenation and enhancement.\n\nNew generation fillers provide more natural movement and longer-lasting results for facial volumization.\n\nCombination therapies that address multiple aspects of aging simultaneously are becoming the gold standard in modern cosmetic dermatology practices.'
  }
];

// Import the static articles data
async function importArticles() {
  try {
    console.log('Starting import of static articles...');
    
    console.log(`Using ${ARTICLE_CATEGORIES.length} categories and ${articles.length} articles`);
    
    // First, sync categories
    console.log('Syncing categories...');
    for (const category of ARTICLE_CATEGORIES) {
      // Check if category exists
      const { data: existingCategory } = await supabase
        .from('article_categories')
        .select('*')
        .eq('slug', category.id)
        .single();
      
      if (existingCategory) {
        console.log(`Category exists: ${category.name}`);
        continue;
      }
      
      // Create category if it doesn't exist
      const { data: newCategory, error } = await supabase
        .from('article_categories')
        .insert({
          name: category.name,
          slug: category.id,
          description: category.description,
        })
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating category ${category.name}:`, error);
      } else {
        console.log(`Created category: ${newCategory.name}`);
      }
    }
    
    // Get all categories for reference
    const { data: categoryData } = await supabase
      .from('article_categories')
      .select('*');
    
    const categoryMap = {};
    categoryData.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });
    
    // Then import articles
    console.log('Importing articles...');
    for (const article of articles) {
      // Ensure we have the correct category ID
      const categoryId = categoryMap[article.category];
      if (!categoryId) {
        console.error(`Category not found for article: ${article.title}`);
        continue;
      }
      
      // Check if article exists by slug
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', article.slug)
        .single();
      
      if (existingArticle) {
        console.log(`Article exists: ${article.title}`);
        continue;
      }
      
      // Convert content format
      let formattedContent = [];
      if (article.content) {
        if (typeof article.content === 'string') {
          // Split string content into paragraphs
          formattedContent = article.content.split('\n\n').map(para => ({
            type: 'paragraph',
            content: para.trim()
          }));
        } else if (Array.isArray(article.content)) {
          formattedContent = article.content;
        }
      } else {
        // Create a default paragraph with the excerpt
        formattedContent = [{
          type: 'paragraph',
          content: article.excerpt
        }];
      }
      
      // Create the article
      const { data: newArticle, error } = await supabase
        .from('articles')
        .insert({
          title: article.title,
          subtitle: article.subtitle || null,
          slug: article.slug,
          excerpt: article.excerpt,
          content: formattedContent,
          featured_image: article.image,
          status: 'published',
          category_id: categoryId,
          author_id: null, // Update with real author ID if available
          published_at: article.date,
          created_at: article.date,
          updated_at: new Date().toISOString(),
          reading_time: typeof article.readTime === 'string' 
            ? parseInt(article.readTime.replace(/\D/g, ''), 10) || null
            : article.readTime,
          tags: article.tags || []
        })
        .select()
        .single();
      
      if (error) {
        console.error(`Error creating article ${article.title}:`, error);
      } else {
        console.log(`Created article: ${newArticle.title}`);
      }
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importArticles(); 