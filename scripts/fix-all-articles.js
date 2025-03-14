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

async function fixAllArticles() {
  console.log('Starting to fix all articles in the database...');

  try {
    // Fetch all articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*');

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found in the database.');
      return;
    }

    console.log(`Found ${articles.length} articles to process.`);
    
    // Create a backup of all articles
    const backupFilename = `all-articles-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    writeFileSync(backupFilename, JSON.stringify(articles, null, 2));
    console.log(`Backup of all articles saved to ${backupFilename}`);
    
    // Process each article
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const article of articles) {
      try {
        console.log(`\nProcessing article: "${article.title}" (ID: ${article.id})`);
        
        // Check if content needs fixing
        let needsFix = false;
        let fixedContent = [];
        
        // If content is a string, try to parse it or convert to paragraph
        if (typeof article.content === 'string') {
          console.log(`- Content is a string (length: ${article.content.length})`);
          needsFix = true;
          
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
          console.log(`- Content is an array (length: ${article.content.length})`);
          
          // Check if any block has invalid structure
          const hasInvalidBlocks = article.content.some(block => 
            !block || 
            typeof block !== 'object' || 
            !block.type || 
            (block.type !== 'image' && block.type !== 'video' && !block.content)
          );
          
          if (hasInvalidBlocks) {
            console.log('- Content has invalid blocks that need fixing');
            needsFix = true;
            
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
          } else {
            console.log('- Content array structure looks valid');
          }
        } 
        // If content is null or undefined, create default content
        else if (article.content === null || article.content === undefined) {
          console.log('- Content is null or undefined');
          needsFix = true;
          
          fixedContent = [{
            type: 'paragraph',
            content: article.excerpt || 'Default article content'
          }];
        }
        // If content is some other type, convert to proper structure
        else {
          console.log(`- Content has unexpected type: ${typeof article.content}`);
          needsFix = true;
          
          fixedContent = [{
            type: 'paragraph',
            content: article.excerpt || 'Default article content'
          }];
        }
        
        // Update the article if it needs fixing
        if (needsFix) {
          console.log('- Updating article with fixed content structure...');
          
          const updatedArticle = {
            ...article,
            content: fixedContent
          };
          
          const { error: updateError } = await supabase
            .from('articles')
            .update(updatedArticle)
            .eq('id', article.id);
          
          if (updateError) {
            console.error(`- Error updating article: ${updateError.message}`);
            errorCount++;
          } else {
            console.log('- Article successfully updated!');
            fixedCount++;
          }
        } else {
          console.log('- No fixes needed for this article');
        }
      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError);
        errorCount++;
      }
    }
    
    console.log('\nFix process completed!');
    console.log(`- ${fixedCount} articles fixed`);
    console.log(`- ${errorCount} errors encountered`);
    console.log(`- ${articles.length - fixedCount - errorCount} articles already had valid structure`);
    
  } catch (error) {
    console.error('Error in fix process:', error);
  }
}

// Run the function
fixAllArticles().catch(console.error); 