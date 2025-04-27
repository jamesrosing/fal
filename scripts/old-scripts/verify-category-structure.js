// Script to verify the category structure in the database
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

// Main categories we expect to find
const EXPECTED_CATEGORIES = [
  'plastic-surgery',
  'dermatology',
  'medical-spa',
  'functional-medicine',
  'trending-topics',
  'educational',
  'niche-focus'
];

async function verifyCategories() {
  try {
    console.log('Starting category structure verification...');
    
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('article_categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return;
    }
    
    console.log(`Found ${categories.length} total categories`);
    
    // Check if all expected categories exist
    const mainCategories = categories.filter(c => EXPECTED_CATEGORIES.includes(c.slug));
    console.log(`Found ${mainCategories.length} main categories (expected ${EXPECTED_CATEGORIES.length}):`);
    
    for (const slug of EXPECTED_CATEGORIES) {
      const category = categories.find(c => c.slug === slug);
      if (category) {
        console.log(`✅ ${category.name} (${category.slug})`);
      } else {
        console.log(`❌ Missing: ${slug}`);
      }
    }
    
    // Get all subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('article_subcategories')
      .select('*');
    
    if (subcategoriesError) {
      console.error('Error fetching subcategories:', subcategoriesError);
      return;
    }
    
    console.log(`\nFound ${subcategories.length} total subcategories`);
    
    // Group subcategories by category
    const subcategoriesByCategory = {};
    for (const subcat of subcategories) {
      const categoryId = subcat.category_id;
      if (!subcategoriesByCategory[categoryId]) {
        subcategoriesByCategory[categoryId] = [];
      }
      subcategoriesByCategory[categoryId].push(subcat);
    }
    
    // Display subcategories for each main category
    for (const category of mainCategories) {
      const categorySubcats = subcategoriesByCategory[category.id] || [];
      console.log(`\n${category.name} (${category.slug}): ${categorySubcats.length} subcategories`);
      
      for (const subcat of categorySubcats) {
        console.log(`  - ${subcat.name} (${subcat.slug})`);
      }
    }
    
    // Check for orphaned subcategories
    const allMainCategoryIds = mainCategories.map(c => c.id);
    const orphanedSubcats = subcategories.filter(s => !allMainCategoryIds.includes(s.category_id));
    
    if (orphanedSubcats.length > 0) {
      console.log(`\n⚠️ Found ${orphanedSubcats.length} orphaned subcategories not linked to main categories:`);
      
      // Group orphaned subcategories by category
      const orphanedSubcatsByCategory = {};
      for (const subcat of orphanedSubcats) {
        const categoryId = subcat.category_id;
        if (!orphanedSubcatsByCategory[categoryId]) {
          orphanedSubcatsByCategory[categoryId] = [];
        }
        orphanedSubcatsByCategory[categoryId].push(subcat);
      }
      
      // Display orphaned subcategories
      for (const [categoryId, subcats] of Object.entries(orphanedSubcatsByCategory)) {
        const category = categories.find(c => c.id === categoryId);
        const categoryName = category ? category.name : 'Unknown Category';
        const categorySlug = category ? category.slug : 'unknown';
        
        console.log(`\n${categoryName} (${categorySlug}): ${subcats.length} subcategories`);
        
        for (const subcat of subcats) {
          console.log(`  - ${subcat.name} (${subcat.slug})`);
        }
      }
    } else {
      console.log('\n✅ No orphaned subcategories found - all are properly assigned to main categories');
    }
    
    console.log('\nVerification completed.');
    
  } catch (error) {
    console.error('Error verifying categories:', error);
  }
}

// Run the verification
verifyCategories(); 