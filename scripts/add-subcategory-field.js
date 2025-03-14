// Script to add subcategory field to articles table and create a subcategories table
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

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Check if subcategory field already exists in articles table
    const { data: articlesColumns, error: columnsError } = await supabase
      .from('articles')
      .select('subcategory')
      .limit(1);
    
    // If we don't get an error, the field already exists
    if (!columnsError) {
      console.log('Subcategory field already exists in articles table.');
    } else {
      console.log('Adding subcategory field to articles table...');
      
      // We need to use raw SQL to add the column since Supabase JS client doesn't support schema modifications
      // You'll need to do this in the Supabase dashboard SQL editor:
      console.log('Please execute the following SQL in your Supabase dashboard SQL editor:');
      console.log(`
      -- Add subcategory field to articles table
      ALTER TABLE articles ADD COLUMN subcategory text;
      
      -- Create article_subcategories table
      CREATE TABLE IF NOT EXISTS article_subcategories (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        description text,
        category_id uuid REFERENCES article_categories(id) ON DELETE CASCADE,
        created_at timestamp with time zone DEFAULT now(),
        updated_at timestamp with time zone DEFAULT now()
      );
      
      -- Add RLS policies for article_subcategories
      ALTER TABLE article_subcategories ENABLE ROW LEVEL SECURITY;
      
      -- Create policy to allow anyone to read article_subcategories
      CREATE POLICY "Allow public read access" ON article_subcategories
        FOR SELECT USING (true);
      
      -- Create policy to allow authenticated users to insert article_subcategories
      CREATE POLICY "Allow authenticated users to insert" ON article_subcategories
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      
      -- Create policy to allow authenticated users to update their article_subcategories
      CREATE POLICY "Allow authenticated users to update" ON article_subcategories
        FOR UPDATE USING (auth.role() = 'authenticated');
      
      -- Create policy to allow authenticated users to delete their article_subcategories
      CREATE POLICY "Allow authenticated users to delete" ON article_subcategories
        FOR DELETE USING (auth.role() = 'authenticated');
      `);
      
      console.log('After running the SQL, restart this script to continue with the migration.');
      process.exit(0);
    }
    
    // Check if the article_subcategories table exists
    try {
      const { data: subcategoriesCheck, error: subcategoriesError } = await supabase
        .from('article_subcategories')
        .select('count')
        .limit(1);
      
      if (subcategoriesError) {
        throw subcategoriesError;
      }
      
      console.log('article_subcategories table exists.');
      
      // Create default subcategories
      await createDefaultSubcategories();
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Error checking article_subcategories table:', error);
      console.log('Please run the SQL commands above in your Supabase dashboard SQL editor first.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function createDefaultSubcategories() {
  console.log('Creating default subcategories...');
  
  // Get all categories
  const { data: categories, error: categoryError } = await supabase
    .from('article_categories')
    .select('*');
  
  if (categoryError) {
    console.error('Error fetching categories:', categoryError);
    return;
  }
  
  // Map of category slugs to their IDs
  const categoryMap = {};
  categories.forEach(category => {
    categoryMap[category.slug] = category.id;
  });
  
  // Default subcategories for plastic-surgery
  if (categoryMap['plastic-surgery']) {
    await createSubcategory('face', 'Face', 'Facial plastic surgery procedures', categoryMap['plastic-surgery']);
    await createSubcategory('breast', 'Breast', 'Breast augmentation and reduction', categoryMap['plastic-surgery']);
    await createSubcategory('body', 'Body', 'Body contouring procedures', categoryMap['plastic-surgery']);
  }
  
  // Default subcategories for dermatology
  if (categoryMap['dermatology']) {
    await createSubcategory('medical', 'Medical Dermatology', 'Treatment of skin conditions', categoryMap['dermatology']);
    await createSubcategory('cosmetic', 'Cosmetic Dermatology', 'Aesthetic skin treatments', categoryMap['dermatology']);
    await createSubcategory('conditions', 'Skin Conditions', 'Common skin disorders', categoryMap['dermatology']);
  }
  
  // Default subcategories for medical-spa
  if (categoryMap['medical-spa']) {
    await createSubcategory('injectables', 'Injectables', 'Botox and fillers', categoryMap['medical-spa']);
    await createSubcategory('laser', 'Laser Treatments', 'Laser therapies for skin', categoryMap['medical-spa']);
    await createSubcategory('skincare', 'Skincare', 'Professional skincare treatments', categoryMap['medical-spa']);
  }
  
  // Default subcategories for functional-medicine
  if (categoryMap['functional-medicine']) {
    await createSubcategory('nutrition', 'Nutrition', 'Nutritional therapies', categoryMap['functional-medicine']);
    await createSubcategory('hormone', 'Hormone Health', 'Hormone replacement therapy', categoryMap['functional-medicine']);
    await createSubcategory('wellness', 'Wellness', 'Overall health and wellness', categoryMap['functional-medicine']);
  }
}

async function createSubcategory(slug, name, description, categoryId) {
  // Check if subcategory already exists
  const { data: existingSubcategory } = await supabase
    .from('article_subcategories')
    .select('*')
    .eq('slug', slug)
    .eq('category_id', categoryId)
    .single();
  
  if (existingSubcategory) {
    console.log(`Subcategory exists: ${name}`);
    return;
  }
  
  // Create subcategory
  const { data, error } = await supabase
    .from('article_subcategories')
    .insert({
      name,
      slug,
      description,
      category_id: categoryId
    })
    .select()
    .single();
  
  if (error) {
    console.error(`Error creating subcategory ${name}:`, error);
  } else {
    console.log(`Created subcategory: ${data.name}`);
  }
}

// Run the migration
runMigration(); 