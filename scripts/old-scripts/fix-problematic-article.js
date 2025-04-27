// Script to fix problematic articles causing rendering issues
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

async function findAndFixArticle() {
  console.log('Searching for problematic article with Susan Pearose...');

  try {
    // Search for articles with "Pearose" in the title or excerpt
    // We'll also try "Pearrose" in case of typos
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .or('title.ilike.%pearose%,title.ilike.%pearrose%,excerpt.ilike.%pearose%,excerpt.ilike.%pearrose%');

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found matching the search criteria.');
      return;
    }

    console.log(`Found ${articles.length} potential article(s):`);
    
    for (const article of articles) {
      console.log(`\nExamining article ID: ${article.id}`);
      console.log(`Title: ${article.title}`);
      console.log(`Slug: ${article.slug}`);
      
      let needsUpdate = false;
      let fixedArticle = { ...article };
      
      // Check for potential issues
      
      // 1. Check if content is empty
      if (!article.content) {
        console.log('Issue found: Article has no content.');
        fixedArticle.content = [{
          type: 'paragraph',
          content: article.excerpt || 'Default content for fixed article.'
        }];
        needsUpdate = true;
      }
      
      // 2. Check if content is not properly formatted as JSON
      if (article.content && typeof article.content === 'string') {
        console.log('Issue found: Content is stored as a string instead of JSON.');
        try {
          // Try to parse it
          fixedArticle.content = JSON.parse(article.content);
          needsUpdate = true;
        } catch (e) {
          console.log('   Could not parse content string, setting default content');
          fixedArticle.content = [{
            type: 'paragraph',
            content: article.excerpt || 'Default content for fixed article.'
          }];
          needsUpdate = true;
        }
      }
      
      // 3. Check if content array is empty
      if (article.content && Array.isArray(article.content) && article.content.length === 0) {
        console.log('Issue found: Content array is empty');
        fixedArticle.content = [{
          type: 'paragraph',
          content: article.excerpt || 'Default content for fixed article.'
        }];
        needsUpdate = true;
      }
      
      // 4. Check for corrupt content items
      if (article.content && Array.isArray(article.content)) {
        const validContentTypes = ['paragraph', 'heading', 'list', 'image', 'video', 'quote'];
        const hasInvalidTypes = article.content.some(item => 
          !item.type || !validContentTypes.includes(item.type)
        );
        
        if (hasInvalidTypes) {
          console.log('Issue found: Content contains invalid types');
          // Filter out invalid content items and replace with valid ones
          fixedArticle.content = article.content
            .filter(item => item.type && validContentTypes.includes(item.type))
            .map(item => {
              // Ensure all content properties exist
              if (!item.content && item.type !== 'image' && item.type !== 'video') {
                item.content = 'Content placeholder';
              }
              return item;
            });
          
          // If we filtered everything out, add a default paragraph
          if (fixedArticle.content.length === 0) {
            fixedArticle.content = [{
              type: 'paragraph',
              content: article.excerpt || 'Default content for fixed article.'
            }];
          }
          
          needsUpdate = true;
        }
      }
      
      // 5. Check if status is valid
      const validStatuses = ['published', 'draft', 'archived'];
      if (!article.status || !validStatuses.includes(article.status)) {
        console.log('Issue found: Invalid status');
        fixedArticle.status = 'draft';
        needsUpdate = true;
      }
      
      // 6. Make sure we have a valid excerpt
      if (!article.excerpt || article.excerpt.trim() === '') {
        console.log('Issue found: Missing excerpt');
        // Extract excerpt from the first paragraph if possible
        if (Array.isArray(article.content) && article.content.length > 0) {
          const firstParagraph = article.content.find(item => item.type === 'paragraph');
          if (firstParagraph && firstParagraph.content) {
            fixedArticle.excerpt = firstParagraph.content.substring(0, 150) + '...';
          } else {
            fixedArticle.excerpt = `Excerpt for article: ${article.title || 'Untitled'}`;
          }
        } else {
          fixedArticle.excerpt = `Excerpt for article: ${article.title || 'Untitled'}`;
        }
        needsUpdate = true;
      }
      
      // 7. Ensure fields that should be strings are strings
      ['title', 'slug', 'excerpt', 'author_id', 'category_id', 'subcategory'].forEach(field => {
        if (article[field] !== null && article[field] !== undefined && typeof article[field] !== 'string') {
          console.log(`Issue found: Field "${field}" is not a string`);
          fixedArticle[field] = String(article[field]);
          needsUpdate = true;
        }
      });
      
      // Update the article if issues were found
      if (needsUpdate) {
        console.log('Updating article with fixes...');
        
        // Remove any undefined or null fields that should not be null
        Object.keys(fixedArticle).forEach(key => {
          if (fixedArticle[key] === undefined) {
            delete fixedArticle[key];
          }
        });
        
        const { error: updateError } = await supabase
          .from('articles')
          .update(fixedArticle)
          .eq('id', article.id);
        
        if (updateError) {
          console.error('Error updating article:', updateError);
        } else {
          console.log('Article updated successfully!');
        }
      } else {
        console.log('No issues found in this article. Stabilizing article data anyway...');
        
        // Even if no issues were found, update the article to ensure data is stabilized
        const { error: updateError } = await supabase
          .from('articles')
          .update(fixedArticle)
          .eq('id', article.id);
        
        if (updateError) {
          console.error('Error updating article:', updateError);
        } else {
          console.log('Article data stabilized successfully!');
        }
      }
    }
    
    console.log('\nArticle fix process completed!');
    
  } catch (error) {
    console.error('Error in findAndFixArticle function:', error);
  }
}

// Run the function
findAndFixArticle().catch(console.error); 