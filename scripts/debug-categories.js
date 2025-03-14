// Script to debug categories and subcategories
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

async function checkCategoryStructure() {
  try {
    console.log('Examining database category structure...');
    
    // Get all main categories
    const { data: mainCategories, error: mainCategoriesError } = await supabase
      .from('article_categories')
      .select('*')
      .in('slug', ['plastic-surgery', 'dermatology', 'medical-spa', 'functional-medicine']);
    
    if (mainCategoriesError) {
      console.error('Error fetching main categories:', mainCategoriesError);
      return;
    }
    
    console.log(`Found ${mainCategories.length} main categories:`);
    mainCategories.forEach(cat => {
      console.log(`  - ${cat.name} (slug: ${cat.slug}, id: ${cat.id})`);
    });
    
    // Get all subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('article_subcategories')
      .select('*');
    
    if (subcategoriesError) {
      console.error('Error fetching subcategories:', subcategoriesError);
      return;
    }
    
    console.log(`\nFound ${subcategories.length} subcategories in total`);
    
    // Group subcategories by category_id
    const subcategoriesByCategory = {};
    subcategories.forEach(subcat => {
      if (!subcategoriesByCategory[subcat.category_id]) {
        subcategoriesByCategory[subcat.category_id] = [];
      }
      subcategoriesByCategory[subcat.category_id].push(subcat);
    });
    
    // Display subcategories for each main category
    mainCategories.forEach(mainCat => {
      const categorySubcats = subcategoriesByCategory[mainCat.id] || [];
      console.log(`\nCategory: ${mainCat.name} (${mainCat.id})`);
      console.log(`Found ${categorySubcats.length} subcategories:`);
      
      categorySubcats.forEach(subcat => {
        console.log(`  - ${subcat.name} (slug: ${subcat.slug}, id: ${subcat.id})`);
      });
      
      if (categorySubcats.length === 0) {
        console.log('  No subcategories found for this category');
      }
    });
    
    // Check if there are orphaned subcategories
    const allCategoryIds = mainCategories.map(cat => cat.id);
    const orphanedSubcats = subcategories.filter(subcat => !allCategoryIds.includes(subcat.category_id));
    
    if (orphanedSubcats.length > 0) {
      console.log(`\nFound ${orphanedSubcats.length} orphaned subcategories not linked to main categories:`);
      
      // Get all category IDs from orphaned subcategories
      const orphanedCategoryIds = [...new Set(orphanedSubcats.map(subcat => subcat.category_id))];
      
      // Fetch the detailed categories
      for (const categoryId of orphanedCategoryIds) {
        const { data: category, error: categoryError } = await supabase
          .from('article_categories')
          .select('*')
          .eq('id', categoryId)
          .single();
        
        if (categoryError) {
          console.log(`  Category ID ${categoryId} not found`);
          continue;
        }
        
        const categorySubcats = orphanedSubcats.filter(subcat => subcat.category_id === categoryId);
        console.log(`\nOrphaned subcategories linked to category: ${category.name} (${category.slug}, ${category.id})`);
        categorySubcats.forEach(subcat => {
          console.log(`  - ${subcat.name} (slug: ${subcat.slug}, id: ${subcat.id})`);
        });
      }
    }
    
    console.log('\nDiagnostic check completed.');
  } catch (error) {
    console.error('Error checking categories:', error);
  }
}

// Run the diagnostic check
checkCategoryStructure(); 