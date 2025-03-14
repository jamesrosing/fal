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
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPearoseArticle() {
  console.log('Finding Susan Pearose article to reset...');

  try {
    // Find the specific article
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .or('title.ilike.%Pearose%,title.ilike.%Pearrose%');

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      console.log('No matching articles found.');
      return;
    }

    console.log(`Found ${articles.length} article(s):`);
    
    for (const article of articles) {
      console.log(`\nProcessing article: "${article.title}" (ID: ${article.id})`);
      
      // Create completely fresh content with simple structure
      const newContent = [
        {
          type: 'paragraph',
          content: 'Susan Pearose, PA-C has been recognized as one of the top dermatology physician assistants in Newport Beach, a testament to her exceptional skills and dedication to patient care.'
        },
        {
          type: 'paragraph',
          content: article.excerpt || 'Known for her expertise in medical and cosmetic dermatology, Susan Pearose has built a reputation for delivering outstanding results and personalized treatment plans.'
        }
      ];
      
      // Preserve important metadata but reset content structure
      const resetArticle = {
        ...article,
        content: newContent,
        // Ensure other fields are valid and clean
        status: article.status || 'published',
        excerpt: article.excerpt || 'Susan Pearose, PA-C has been recognized as one of the top dermatology physician assistants in Newport Beach, known for her expertise in both medical and cosmetic dermatology.'
      };
      
      console.log('Updating article with completely reset content structure...');
      
      const { error: updateError } = await supabase
        .from('articles')
        .update(resetArticle)
        .eq('id', article.id);
      
      if (updateError) {
        console.error('Error updating article:', updateError);
      } else {
        console.log('Article successfully reset with clean content structure!');
      }
    }
    
    console.log('\nReset process completed!');
    
  } catch (error) {
    console.error('Error in reset process:', error);
  }
}

// Run the function
resetPearoseArticle().catch(console.error); 