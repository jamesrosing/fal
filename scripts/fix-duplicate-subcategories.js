// Script to identify and fix duplicate subcategories
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

// Known duplicates mapping (name to preferred slug)
const PREFERRED_SLUGS = {
  'Medical Dermatology': 'medical-dermatology',
  'Cosmetic Dermatology': 'cosmetic-dermatology',
  'Skin Conditions': 'skin-conditions',
  'Laser Treatments': 'laser-treatments'
};

async function fixDuplicateSubcategories() {
  try {
    console.log('Starting duplicate subcategory cleanup...');
    
    // Get all subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('article_subcategories')
      .select('*');
    
    if (subcategoriesError) {
      console.error('Error fetching subcategories:', subcategoriesError);
      return;
    }
    
    console.log(`Found ${subcategories.length} total subcategories`);
    
    // Group subcategories by name
    const subcategoriesByName = {};
    subcategories.forEach(subcat => {
      if (!subcategoriesByName[subcat.name]) {
        subcategoriesByName[subcat.name] = [];
      }
      subcategoriesByName[subcat.name].push(subcat);
    });
    
    // Find duplicates (subcategories with the same name)
    const duplicates = Object.entries(subcategoriesByName)
      .filter(([_, subcats]) => subcats.length > 1)
      .map(([name, subcats]) => ({ name, subcats }));
    
    if (duplicates.length === 0) {
      console.log('No duplicate subcategories found!');
      return;
    }
    
    console.log(`Found ${duplicates.length} duplicate subcategory names:`);
    
    // Process each set of duplicates
    for (const { name, subcats } of duplicates) {
      console.log(`\nProcessing duplicates for: "${name}"`);
      subcats.forEach(subcat => {
        console.log(`  - ID: ${subcat.id}, Slug: ${subcat.slug}, Category: ${subcat.category_id}`);
      });
      
      // Determine which one to keep based on our preferred slugs mapping
      let keepSubcat, deleteSubcats;
      
      if (PREFERRED_SLUGS[name]) {
        // If we have a preferred slug for this name, use it
        const preferredSlug = PREFERRED_SLUGS[name];
        keepSubcat = subcats.find(s => s.slug === preferredSlug);
        deleteSubcats = subcats.filter(s => s.slug !== preferredSlug);
        
        if (!keepSubcat) {
          console.log(`  Warning: Preferred slug "${preferredSlug}" not found, keeping first entry`);
          keepSubcat = subcats[0];
          deleteSubcats = subcats.slice(1);
        }
      } else {
        // Default behavior: keep the first one, delete the rest
        keepSubcat = subcats[0];
        deleteSubcats = subcats.slice(1);
      }
      
      // Update articles that reference the to-be-deleted subcategories
      for (const deleteSubcat of deleteSubcats) {
        console.log(`  Updating articles with subcategory "${deleteSubcat.slug}" to use "${keepSubcat.slug}" instead`);
        
        // Find articles using this subcategory
        const { data: articles, error: articlesError } = await supabase
          .from('articles')
          .select('id, title, subcategory')
          .eq('subcategory', deleteSubcat.slug);
        
        if (articlesError) {
          console.error(`  Error finding articles with subcategory "${deleteSubcat.slug}":`, articlesError);
          continue;
        }
        
        if (articles && articles.length > 0) {
          console.log(`  Found ${articles.length} articles to update:`);
          
          for (const article of articles) {
            console.log(`  - Updating article: ${article.title}`);
            
            const { error: updateError } = await supabase
              .from('articles')
              .update({ subcategory: keepSubcat.slug })
              .eq('id', article.id);
            
            if (updateError) {
              console.error(`  Error updating article "${article.title}":`, updateError);
            }
          }
        } else {
          console.log(`  No articles found with subcategory "${deleteSubcat.slug}"`);
        }
        
        // Now delete the duplicate subcategory
        console.log(`  Deleting subcategory: ${deleteSubcat.slug} (${deleteSubcat.id})`);
        
        const { error: deleteError } = await supabase
          .from('article_subcategories')
          .delete()
          .eq('id', deleteSubcat.id);
        
        if (deleteError) {
          console.error(`  Error deleting subcategory "${deleteSubcat.slug}":`, deleteError);
        }
      }
    }
    
    console.log('\nDuplicate subcategory cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error cleaning up subcategories:', error);
  }
}

// Run the cleanup
fixDuplicateSubcategories(); 