// Script to update category structure to match seed.sql
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

// Define main categories and their subcategories based on seed.sql
const CATEGORY_STRUCTURE = {
  'plastic-surgery': {
    name: 'Plastic Surgery',
    description: 'Plastic surgery procedures and treatments',
    subcategories: [
      { name: 'Facial Procedures', slug: 'facial-procedures', description: 'Information about facial plastic surgery including rhinoplasty, facelifts, and facial rejuvenation' },
      { name: 'Body Procedures', slug: 'body-procedures', description: 'Body contouring, lifts, and surgical enhancement procedures' },
      { name: 'Breast Procedures', slug: 'breast-procedures', description: 'Comprehensive information about breast augmentation, reduction, and lift procedures' },
      { name: 'Reconstructive Surgery', slug: 'reconstructive-surgery', description: 'Information about reconstructive procedures and medical restoration' },
      { name: 'Mommy Makeover', slug: 'mommy-makeover', description: 'Post-pregnancy restoration and rejuvenation procedures' }
    ]
  },
  'dermatology': {
    name: 'Dermatology',
    description: 'Dermatological procedures and treatments',
    subcategories: [
      { name: 'Medical Dermatology', slug: 'medical-dermatology', description: 'Treatment of skin conditions, diseases, and medical dermatology services' },
      { name: 'Cosmetic Dermatology', slug: 'cosmetic-dermatology', description: 'Non-surgical cosmetic treatments and skin enhancement procedures' },
      { name: 'Acne Treatment', slug: 'acne-treatment', description: 'Comprehensive acne care, treatments, and prevention strategies' },
      { name: 'Anti-Aging', slug: 'anti-aging', description: 'Anti-aging treatments, preventive care, and age management solutions' },
      { name: 'Skin Conditions', slug: 'skin-conditions', description: 'Information about various skin conditions and their treatments' }
    ]
  },
  'medical-spa': {
    name: 'Medical Spa',
    description: 'Medical spa treatments and services',
    subcategories: [
      { name: 'Injectables', slug: 'injectables', description: 'Information about Botox, dermal fillers, and other injectable treatments' },
      { name: 'Laser Treatments', slug: 'laser-treatments', description: 'Various laser procedures for skin rejuvenation and hair removal' },
      { name: 'Body Contouring', slug: 'body-contouring', description: 'Non-surgical body sculpting and fat reduction treatments' },
      { name: 'Skin Rejuvenation', slug: 'skin-rejuvenation', description: 'Treatments for skin renewal, texture improvement, and rejuvenation' },
      { name: 'Hair Restoration', slug: 'hair-restoration', description: 'Hair loss treatments and restoration procedures' },
      { name: 'Weight Management', slug: 'weight-management', description: 'Medical weight loss programs and metabolic health' },
      { name: 'Wellness Treatments', slug: 'wellness-treatments', description: 'Holistic health approaches and wellness optimization' },
      { name: 'IV Therapy', slug: 'iv-therapy', description: 'Nutritional IV treatments and vitamin therapy' },
      { name: 'Anti-Aging Medicine', slug: 'anti-aging-medicine', description: 'Medical approaches to aging management and longevity' }
    ]
  },
  'functional-medicine': {
    name: 'Functional Medicine',
    description: 'Functional medicine approaches and treatments',
    subcategories: [
      { name: 'Hormone Optimization', slug: 'hormone-optimization', description: 'Hormone therapy and balance for optimal health and wellness' },
      { name: 'Weight Management', slug: 'weight-management', description: 'Medical weight loss programs and metabolic health' },
      { name: 'Wellness Treatments', slug: 'wellness-treatments', description: 'Holistic health approaches and wellness optimization' },
      { name: 'IV Therapy', slug: 'iv-therapy', description: 'Nutritional IV treatments and vitamin therapy' },
      { name: 'Anti-Aging Medicine', slug: 'anti-aging-medicine', description: 'Medical approaches to aging management and longevity' }
    ]
  },
  'trending-topics': {
    name: 'Trending Topics',
    description: 'Latest trends and popular topics in aesthetics',
    subcategories: [
      { name: 'Non-Surgical Procedures', slug: 'non-surgical-procedures', description: 'Latest non-invasive and minimally invasive treatments' },
      { name: 'Natural Results', slug: 'natural-results', description: 'Achieving natural-looking results in aesthetic procedures' },
      { name: 'Preventive Aesthetics', slug: 'preventive-aesthetics', description: 'Preventive treatments and early intervention approaches' },
      { name: 'Men\'s Aesthetics', slug: 'mens-aesthetics', description: 'Aesthetic treatments and procedures specifically for men' },
      { name: 'Combination Treatments', slug: 'combination-treatments', description: 'Synergistic treatment approaches and protocols' }
    ]
  },
  'educational': {
    name: 'Educational',
    description: 'Educational content and informational resources',
    subcategories: [
      { name: 'Treatment Guides', slug: 'treatment-guides', description: 'Comprehensive guides and information about various treatments' },
      { name: 'Recovery & Aftercare', slug: 'recovery-aftercare', description: 'Post-treatment care and recovery information' },
      { name: 'Cost & Financing', slug: 'cost-financing', description: 'Treatment costs, financing options, and payment information' },
      { name: 'Safety & Research', slug: 'safety-research', description: 'Latest research, safety information, and clinical studies' },
      { name: 'Before & After', slug: 'before-after', description: 'Treatment results, transformations, and patient journeys' }
    ]
  },
  'niche-focus': {
    name: 'Niche Focus',
    description: 'Specialized focus areas and unique patient demographics',
    subcategories: [
      { name: 'Ethnic Aesthetics', slug: 'ethnic-aesthetics', description: 'Specialized treatments and considerations for different ethnic backgrounds' },
      { name: 'Teen Aesthetics', slug: 'teen-aesthetics', description: 'Age-appropriate treatments and information for younger patients' },
      { name: 'Mommy Makeover', slug: 'mommy-makeover', description: 'Post-pregnancy restoration and rejuvenation procedures' },
      { name: 'Athletic Aesthetics', slug: 'athletic-aesthetics', description: 'Treatments and procedures for active individuals and athletes' },
      { name: 'Bridal Aesthetics', slug: 'bridal-aesthetics', description: 'Pre-wedding treatments and beauty preparation' }
    ]
  }
};

async function updateCategoryStructure() {
  try {
    console.log('Starting category structure update...');
    
    // 1. Get existing categories
    const { data: existingCategories, error: categoriesError } = await supabase
      .from('article_categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return;
    }
    
    console.log(`Found ${existingCategories.length} existing categories`);
    
    // 2. Get existing subcategories
    const { data: existingSubcategories, error: subcategoriesError } = await supabase
      .from('article_subcategories')
      .select('*');
    
    if (subcategoriesError) {
      console.error('Error fetching subcategories:', subcategoriesError);
      return;
    }
    
    console.log(`Found ${existingSubcategories.length} existing subcategories`);
    
    // 3. Process each main category from our structure
    for (const [slug, category] of Object.entries(CATEGORY_STRUCTURE)) {
      console.log(`\nProcessing category: ${category.name} (${slug})`);
      
      // Check if category exists
      let categoryRecord = existingCategories.find(c => c.slug === slug);
      
      if (!categoryRecord) {
        // Create the category if it doesn't exist
        console.log(`Creating new category: ${category.name}`);
        
        const { data: newCategory, error: createError } = await supabase
          .from('article_categories')
          .insert({
            name: category.name,
            slug: slug,
            description: category.description || ''
          })
          .select()
          .single();
        
        if (createError) {
          console.error(`Error creating category ${category.name}:`, createError);
          continue;
        }
        
        categoryRecord = newCategory;
        console.log(`Created category with ID: ${categoryRecord.id}`);
      } else if (categoryRecord.name !== category.name) {
        // Update category name if it's different (e.g., "Specialty Focus" -> "Niche Focus")
        console.log(`Updating category name: ${categoryRecord.name} -> ${category.name}`);
        
        const { data: updatedCategory, error: updateError } = await supabase
          .from('article_categories')
          .update({ name: category.name, description: category.description || '' })
          .eq('id', categoryRecord.id)
          .select()
          .single();
        
        if (updateError) {
          console.error(`Error updating category ${categoryRecord.name}:`, updateError);
        } else {
          categoryRecord = updatedCategory;
          console.log(`Updated category name to: ${categoryRecord.name}`);
        }
      }
      
      // Process subcategories for this main category
      if (category.subcategories && category.subcategories.length > 0) {
        console.log(`Processing ${category.subcategories.length} subcategories for ${category.name}:`);
        
        for (const subcategory of category.subcategories) {
          // Check if subcategory exists
          const existingSubcat = existingSubcategories.find(
            s => s.slug === subcategory.slug && s.category_id === categoryRecord.id
          );
          
          if (!existingSubcat) {
            // Check if it exists but is assigned to a different category
            const misassignedSubcat = existingSubcategories.find(s => s.slug === subcategory.slug);
            
            if (misassignedSubcat) {
              // Update the subcategory's category_id
              console.log(`Reassigning subcategory ${subcategory.name} to ${category.name}`);
              
              const { error: updateError } = await supabase
                .from('article_subcategories')
                .update({ category_id: categoryRecord.id })
                .eq('id', misassignedSubcat.id);
              
              if (updateError) {
                console.error(`Error reassigning subcategory ${subcategory.name}:`, updateError);
              } else {
                console.log(`Subcategory ${subcategory.name} reassigned successfully`);
              }
            } else {
              // Create the subcategory
              console.log(`Creating new subcategory: ${subcategory.name}`);
              
              const { error: createError } = await supabase
                .from('article_subcategories')
                .insert({
                  name: subcategory.name,
                  slug: subcategory.slug,
                  description: subcategory.description || '',
                  category_id: categoryRecord.id
                });
              
              if (createError) {
                console.error(`Error creating subcategory ${subcategory.name}:`, createError);
              } else {
                console.log(`Subcategory ${subcategory.name} created successfully`);
              }
            }
          } else {
            // Subcategory exists and is already assigned to the correct category
            console.log(`Subcategory ${subcategory.name} already exists in ${category.name}`);
          }
        }
      }
    }
    
    console.log('\nCategory structure update completed successfully!');
    
  } catch (error) {
    console.error('Error updating category structure:', error);
  }
}

// Run the update
updateCategoryStructure(); 