/**
 * Script to import static articles from lib/articles.ts into Supabase
 * 
 * This script reads the static article data and imports it into the database,
 * creating any missing categories and ensuring proper relationships.
 * 
 * Usage:
 * 1. Make sure your .env.local file contains Supabase credentials
 * 2. Run: node scripts/import-static-articles.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Verify environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase credentials in environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.');
  process.exit(1);
}

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Read the articles file content
const getStaticArticles = async () => {
  try {
    const articlesFilePath = path.join(path.resolve(__dirname, '..'), 'lib', 'articles.ts');
    const fileContent = fs.readFileSync(articlesFilePath, 'utf8');
    
    // Extract the articles array using regex
    const articleArrayMatch = fileContent.match(/export const articles: Article\[\] = \[([\s\S]*?)\];/);
    
    if (!articleArrayMatch || !articleArrayMatch[1]) {
      throw new Error('Could not find articles array in the file');
    }
    
    // Split into individual article objects
    const articlesText = articleArrayMatch[1];
    const articleTexts = [];
    let bracketCount = 0;
    let startIndex = 0;
    
    // Parse the article objects manually since we can't eval TypeScript
    for (let i = 0; i < articlesText.length; i++) {
      const char = articlesText[i];
      
      if (char === '{') {
        if (bracketCount === 0) {
          startIndex = i;
        }
        bracketCount++;
      } else if (char === '}') {
        bracketCount--;
        if (bracketCount === 0) {
          // Found a complete article object
          articleTexts.push(articlesText.substring(startIndex, i + 1));
        }
      }
    }
    
    // Convert each article text to an object (manually)
    const articles = articleTexts.map(text => {
      // Extract id
      const idMatch = text.match(/id: "([^"]+)"/);
      const id = idMatch ? idMatch[1] : null;
      
      // Extract title
      const titleMatch = text.match(/title: "([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : '';
      
      // Extract subtitle
      const subtitleMatch = text.match(/subtitle: "([^"]+)"/);
      const subtitle = subtitleMatch ? subtitleMatch[1] : '';
      
      // Extract excerpt
      const excerptMatch = text.match(/excerpt: "([^"]+)"/);
      const excerpt = excerptMatch ? excerptMatch[1] : '';
      
      // Extract image
      const imageMatch = text.match(/image: "([^"]+)"/);
      const image = imageMatch ? imageMatch[1] : '';
      
      // Extract category
      const categoryMatch = text.match(/category: "([^"]+)"/);
      const category = categoryMatch ? categoryMatch[1] : 'uncategorized';
      
      // Extract slug
      const slugMatch = text.match(/slug: "([^"]+)"/);
      const slug = slugMatch ? slugMatch[1] : id;
      
      // Extract tags
      const tagsMatch = text.match(/tags: \[(.*?)\]/);
      const tagsStr = tagsMatch ? tagsMatch[1] : '';
      const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim().replace(/"/g, '')) : [];
      
      // Extract content
      const contentMatch = text.match(/content: `([\s\S]*?)`\s*,/);
      const content = contentMatch ? contentMatch[1] : '';

      // Extract date
      const dateMatch = text.match(/date: "([^"]+)"/);
      const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
      
      return {
        id,
        title,
        subtitle,
        excerpt,
        image, // This will become featured_image
        category, // We'll need to look up or create this category
        tags,
        slug,
        content, // We'll need to convert this from HTML to JSON blocks
        published_at: date,
        status: 'published'
      };
    });
    
    return articles;
  } catch (error) {
    console.error('Error reading articles:', error);
    throw error;
  }
};

// Convert HTML content to JSON blocks
const convertHtmlToBlocks = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return [];
  }
  
  // Simple conversion - this doesn't handle complex HTML structures
  // For a production app, you would want a proper HTML parser
  const paragraphs = htmlContent
    .split(/\n+/)
    .filter(p => p.trim())
    .map(p => {
      // Check if it's a heading
      if (p.trim().startsWith('<h2>') || p.trim().startsWith('<h3>')) {
        return {
          type: 'heading',
          content: p.replace(/<\/?h[23]>/g, '').trim()
        };
      }
      
      // Check if it's a list
      if (p.includes('<ul>') || p.includes('<ol>')) {
        return {
          type: 'list',
          content: p.replace(/<\/?[uo]l>|<\/?li>/g, '').trim()
        };
      }
      
      // Assume it's a paragraph
      return {
        type: 'paragraph',
        content: p.replace(/<\/?p>|<\/?div[^>]*>/g, '').trim()
      };
    });
  
  return paragraphs;
};

// Main import function
const importArticles = async () => {
  try {
    console.log('Starting to import static articles...');
    
    // Get static articles
    const staticArticles = await getStaticArticles();
    console.log(`Found ${staticArticles.length} static articles to import`);
    
    // Get existing categories from the database
    const { data: existingCategories, error: categoryError } = await supabase
      .from('article_categories')
      .select('*');
    
    if (categoryError) {
      throw new Error(`Error fetching categories: ${categoryError.message}`);
    }
    
    console.log(`Found ${existingCategories.length} existing categories in database`);
    
    // Create map of category slug to id
    const categoryMap = {};
    existingCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });
    
    // Process each article
    for (const article of staticArticles) {
      console.log(`Processing article: ${article.title}`);
      
      // Check if the category exists, if not create it
      if (!categoryMap[article.category]) {
        console.log(`Creating new category: ${article.category}`);
        
        const { data: newCategory, error: createCategoryError } = await supabase
          .from('article_categories')
          .insert([{
            name: article.category
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' '),
            slug: article.category,
            description: `Articles about ${article.category.replace(/-/g, ' ')}`
          }])
          .select()
          .single();
        
        if (createCategoryError) {
          console.error(`Error creating category ${article.category}:`, createCategoryError);
          continue;
        }
        
        categoryMap[article.category] = newCategory.id;
      }
      
      // Convert HTML content to JSON blocks
      const contentBlocks = convertHtmlToBlocks(article.content);
      
      // Check if the article already exists
      const { data: existingArticle, error: articleCheckError } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', article.slug)
        .maybeSingle();
      
      if (articleCheckError) {
        console.error(`Error checking if article exists: ${articleCheckError.message}`);
        continue;
      }
      
      if (existingArticle) {
        console.log(`Article with slug "${article.slug}" already exists, updating...`);
        
        // Update the existing article
        const { error: updateError } = await supabase
          .from('articles')
          .update({
            title: article.title,
            subtitle: article.subtitle,
            excerpt: article.excerpt,
            content: contentBlocks,
            featured_image: article.image.includes('cloudinary.com') ? article.image.split('/').pop() : article.image,
            category_id: categoryMap[article.category],
            status: 'published',
            tags: article.tags,
            updated_at: new Date().toISOString(),
            published_at: new Date(article.published_at || new Date()).toISOString()
          })
          .eq('id', existingArticle.id);
        
        if (updateError) {
          console.error(`Error updating article: ${updateError.message}`);
        } else {
          console.log(`Updated article: ${article.title}`);
        }
      } else {
        console.log(`Creating new article: ${article.title}`);
        
        // Create a new article
        const { error: insertError } = await supabase
          .from('articles')
          .insert([{
            title: article.title,
            subtitle: article.subtitle,
            excerpt: article.excerpt,
            slug: article.slug,
            content: contentBlocks,
            featured_image: article.image.includes('cloudinary.com') ? article.image.split('/').pop() : article.image,
            category_id: categoryMap[article.category],
            status: 'published',
            tags: article.tags,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            published_at: new Date(article.published_at || new Date()).toISOString()
          }]);
        
        if (insertError) {
          console.error(`Error creating article: ${insertError.message}`);
        } else {
          console.log(`Created article: ${article.title}`);
        }
      }
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
  }
};

// Run the import
importArticles().catch(console.error); 