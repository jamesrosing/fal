// Script to migrate detailed categories to subcategories
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

// Map to categorize the detailed categories into main categories
const CATEGORY_MAPPING = {
  // Plastic Surgery categories
  'facial-procedures': 'plastic-surgery',
  'body-procedures': 'plastic-surgery',
  'breast-procedures': 'plastic-surgery',
  'reconstructive-surgery': 'plastic-surgery',
  
  // Dermatology categories
  'medical-dermatology': 'dermatology',
  'cosmetic-dermatology': 'dermatology',
  'acne-treatment': 'dermatology',
  'anti-aging': 'dermatology',
  'skin-conditions': 'dermatology',
  
  // Medical Spa categories
  'injectables': 'medical-spa',
  'laser-treatments': 'medical-spa',
  'body-contouring': 'medical-spa',
  'skin-rejuvenation': 'medical-spa',
  'hair-restoration': 'medical-spa',
  
  // Functional Medicine categories
  'hormone-optimization': 'functional-medicine',
  'weight-management': 'functional-medicine',
  'wellness-treatments': 'functional-medicine',
  'iv-therapy': 'functional-medicine',
  'anti-aging-medicine': 'functional-medicine',
  
  // Other categories - might need manual assignment
  'non-surgical-procedures': 'medical-spa',
  'natural-results': 'educational',
  'preventive-aesthetics': 'educational',
  'mens-aesthetics': 'educational',
  'combination-treatments': 'educational',
  
  // Educational content
  'treatment-guides': 'educational',
  'recovery-aftercare': 'educational',
  'cost-financing': 'educational',
  'safety-research': 'educational',
  'before-after': 'educational',
  
  // Specialty focus
  'ethnic-aesthetics': 'educational',
  'teen-aesthetics': 'educational',
  'mommy-makeover': 'plastic-surgery',
  'athletic-aesthetics': 'educational',
  'bridal-aesthetics': 'educational',
};

// Main categories we want to preserve
const MAIN_CATEGORIES = [
  'plastic-surgery',
  'dermatology',
  'medical-spa',
  'functional-medicine',
  'educational',
  'latest-news'
];

async function runMigration() {
  try {
    console.log('Starting category migration...');
    
    // 1. Fetch all existing categories
    const { data: categories, error: categoriesError } = await supabase
      .from('article_categories')
      .select('*');
    
    if (categoriesError) {
      throw categoriesError;
    }
    
    console.log(`Found ${categories.length} categories in the database`);
    
    // 2. Identify main categories and subcategories
    const mainCategories = categories.filter(cat => MAIN_CATEGORIES.includes(cat.slug));
    const detailedCategories = categories.filter(cat => !MAIN_CATEGORIES.includes(cat.slug));
    
    console.log(`Identified ${mainCategories.length} main categories and ${detailedCategories.length} detailed categories`);
    
    // 3. Create mapping of category slugs to category IDs
    const categoryIdMap = {};
    categories.forEach(cat => {
      categoryIdMap[cat.slug] = cat.id;
    });
    
    // 4. Migrate detailed categories to subcategories
    console.log('Migrating detailed categories to subcategories...');
    
    // Create a map to track what's been created to avoid duplicates
    const createdSubcategories = new Set();
    
    for (const category of detailedCategories) {
      const mainCategorySlug = CATEGORY_MAPPING[category.slug] || 'educational'; // Default to educational if not found
      const mainCategoryId = categoryIdMap[mainCategorySlug];
      
      if (!mainCategoryId) {
        console.warn(`Main category not found for ${category.slug}, skipping...`);
        continue;
      }
      
      // Create a subcategory if it doesn't exist already
      if (!createdSubcategories.has(category.slug)) {
        console.log(`Creating subcategory ${category.name} under ${mainCategorySlug}`);
        
        const { data: subcategory, error: subcategoryError } = await supabase
          .from('article_subcategories')
          .insert({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            category_id: mainCategoryId
          })
          .select()
          .single();
        
        if (subcategoryError) {
          console.error(`Error creating subcategory for ${category.name}:`, subcategoryError);
        } else {
          console.log(`Created subcategory: ${subcategory.name}`);
          createdSubcategories.add(category.slug);
        }
      }
      
      // 5. Update articles associated with this category to use the subcategory field
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('id, title')
        .eq('category_id', category.id);
      
      if (articlesError) {
        console.error(`Error fetching articles for category ${category.name}:`, articlesError);
        continue;
      }
      
      console.log(`Found ${articles.length} articles to update for category ${category.name}`);
      
      if (articles.length > 0) {
        // Update articles to use the main category and set subcategory
        for (const article of articles) {
          const { error: updateError } = await supabase
            .from('articles')
            .update({
              category_id: mainCategoryId,
              subcategory: category.slug
            })
            .eq('id', article.id);
          
          if (updateError) {
            console.error(`Error updating article ${article.title}:`, updateError);
          } else {
            console.log(`Updated article: ${article.title}`);
          }
        }
      }
    }
    
    console.log('Category migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 