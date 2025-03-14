import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { existsSync, writeFileSync } from 'fs';
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

async function exportPearoseArticle() {
  console.log('Exporting Susan Pearose article...');

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
      console.log(`\nExporting article: "${article.title}" (ID: ${article.id})`);
      
      // Prepare export data
      const exportData = {
        ...article,
        _exportDate: new Date().toISOString(),
        _contentType: typeof article.content,
        _contentIsArray: Array.isArray(article.content),
        _contentLength: Array.isArray(article.content) ? article.content.length : 
                        (typeof article.content === 'string' ? article.content.length : 'unknown')
      };
      
      // Create export filename based on article ID
      const filename = `pearose-article-export-${article.id.substring(0, 8)}.json`;
      
      // Export to file
      writeFileSync(filename, JSON.stringify(exportData, null, 2));
      console.log(`Article exported to ${filename}`);
      
      // Also print key information to console
      console.log('\nKey fields:');
      console.log(`Title: ${article.title}`);
      console.log(`Status: ${article.status}`);
      console.log(`Category ID: ${article.category_id}`);
      console.log(`Subcategory: ${article.subcategory}`);
      console.log(`Slug: ${article.slug}`);
      console.log(`Content type: ${typeof article.content}`);
      
      if (Array.isArray(article.content)) {
        console.log(`Content blocks: ${article.content.length}`);
        // Display first few content blocks
        article.content.slice(0, 2).forEach((block, index) => {
          console.log(`\nBlock ${index + 1}:`);
          console.log(` - Type: ${block.type}`);
          console.log(` - Content: ${block.content ? block.content.substring(0, 50) + '...' : '[empty]'}`);
        });
        
        if (article.content.length > 2) {
          console.log(`\n... and ${article.content.length - 2} more blocks`);
        }
      } else {
        console.log(`Content: ${typeof article.content === 'string' ? 
                      (article.content.substring(0, 100) + '...') : 
                      JSON.stringify(article.content)}`);
      }
    }
    
    console.log('\nExport completed!');
    
  } catch (error) {
    console.error('Error in export process:', error);
  }
}

// Run the function
exportPearoseArticle().catch(console.error); 