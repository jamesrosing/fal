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

async function fixEmsculptArticle() {
  console.log('Finding EMSculpt Neo article to diagnose and fix...');

  try {
    // Find the EMSculpt Neo article
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .or('title.ilike.%EMSculpt%,title.ilike.%emsculpt%,excerpt.ilike.%EMSculpt%,excerpt.ilike.%emsculpt%');

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found matching EMSculpt Neo.');
      return;
    }

    console.log(`Found ${articles.length} potentially matching article(s):`);
    
    for (const article of articles) {
      console.log(`\nExamining article: "${article.title}" (ID: ${article.id})`);
      
      // Create backup of original article data
      const backupFilename = `emsculpt-article-backup-${article.id.substring(0, 8)}.json`;
      writeFileSync(backupFilename, JSON.stringify(article, null, 2));
      console.log(`Backup saved to ${backupFilename}`);
      
      // Diagnose article data
      console.log('\nDiagnosing article data:');
      console.log(`- Content type: ${typeof article.content}`);
      console.log(`- Is array: ${Array.isArray(article.content)}`);
      
      if (Array.isArray(article.content)) {
        console.log(`- Array length: ${article.content.length}`);
        if (article.content.length > 0) {
          const sample = article.content[0];
          console.log(`- First block type: ${sample.type}`);
          console.log(`- First block content type: ${typeof sample.content}`);
        }
      } else if (typeof article.content === 'string') {
        console.log(`- Content length: ${article.content.length}`);
        console.log(`- Content preview: ${article.content.substring(0, 100)}...`);
        
        // Try to parse if it looks like JSON
        if (article.content.trim().startsWith('[') || article.content.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(article.content);
            console.log('- Content appears to be JSON string that needs parsing');
          } catch (e) {
            console.log('- Content is a string but not valid JSON');
          }
        }
      } else if (article.content === null) {
        console.log('- Content is null');
      } else {
        console.log('- Content has unexpected format');
      }
      
      // Fix the article content structure
      console.log('\nFixing article content structure...');
      
      // Create proper content structure
      let fixedContent = [];
      
      // If content is a string, try to parse it or convert to paragraph
      if (typeof article.content === 'string') {
        try {
          if (article.content.trim().startsWith('[')) {
            // Try to parse as JSON array
            const parsed = JSON.parse(article.content);
            if (Array.isArray(parsed)) {
              fixedContent = parsed.map(block => {
                // Ensure each block has correct structure
                return {
                  type: block.type || 'paragraph',
                  content: block.content || 'Content placeholder'
                };
              });
            }
          } else {
            // Create a simple paragraph
            fixedContent = [{
              type: 'paragraph',
              content: article.content
            }];
          }
        } catch (e) {
          // If parsing fails, create a simple paragraph
          fixedContent = [{
            type: 'paragraph',
            content: article.content
          }];
        }
      } 
      // If content is already an array, validate and fix structure
      else if (Array.isArray(article.content)) {
        fixedContent = article.content.map(block => {
          // Ensure required properties exist on each block
          if (!block || typeof block !== 'object') {
            return {
              type: 'paragraph',
              content: 'Content placeholder'
            };
          }
          
          // Ensure block has valid type
          const validTypes = ['paragraph', 'heading', 'list', 'image', 'video', 'quote'];
          const type = validTypes.includes(block.type) ? block.type : 'paragraph';
          
          // Ensure block has content
          let content = block.content;
          if ((type !== 'image' && type !== 'video') && (!content || typeof content !== 'string')) {
            content = 'Content placeholder';
          }
          
          return { type, content };
        });
      } 
      // If content is null or undefined, create default content
      else {
        fixedContent = [{
          type: 'paragraph',
          content: article.excerpt || 'Default article content about EMSculpt Neo'
        }];
      }
      
      // Prepare article update with fixed content
      const updatedArticle = {
        ...article,
        content: fixedContent
      };
      
      // Update the article in the database
      console.log('Updating article with fixed content structure...');
      
      const { error: updateError } = await supabase
        .from('articles')
        .update(updatedArticle)
        .eq('id', article.id);
      
      if (updateError) {
        console.error('Error updating article:', updateError);
      } else {
        console.log('Article successfully updated with fixed content structure!');
      }
    }
    
    console.log('\nFix process completed!');
    
  } catch (error) {
    console.error('Error in fix process:', error);
  }
}

// Run the function
fixEmsculptArticle().catch(console.error); 