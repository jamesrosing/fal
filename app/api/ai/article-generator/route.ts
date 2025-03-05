import { NextResponse } from 'next/server';
import { ArticleContent } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

// Base prompt for article generation
const BASE_PROMPT = `
You are an expert writer for a medical spa and plastic surgery practice. Your task is to write a compelling, informative article that showcases expertise while being accessible to potential clients.

Follow these guidelines:
1. Write in a professional but conversational tone
2. Include factual information backed by medical understanding
3. Structure the article with clear sections and headings
4. Focus on benefits and results while being honest about any limitations
5. Include a brief introduction and conclusion
6. Use appropriate medical terminology but explain complex concepts
7. Keep the content between 600-1000 words total
8. Make the article SEO-friendly with relevant keywords naturally incorporated
9. Avoid excessive jargon that might confuse non-medical readers

Respond with a complete article following this structure:
{
  "title": "Engaging, SEO-friendly title",
  "subtitle": "Optional subtitle that expands on the title",
  "excerpt": "A compelling 1-2 sentence summary of the article (max 200 characters)",
  "content": [
    {"type": "paragraph", "content": "Introduction paragraph..."},
    {"type": "heading", "content": "First Section Heading"},
    {"type": "paragraph", "content": "Content of first section..."},
    // Additional paragraphs and headings as needed
  ],
  "meta_keywords": ["keyword1", "keyword2", "etc."]
}
`;

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log(`API Key present: ${!!apiKey}`);
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Parse request
    const { prompt, category = 'general' } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid prompt' },
        { status: 400 }
      );
    }

    console.log(`Received article generation request with prompt: "${prompt.slice(0, 30)}..." for category: ${category}`);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Create category-specific context
    let categoryContext = '';
    switch (category) {
      case 'plastic-surgery':
        categoryContext = 'Focus on cosmetic surgery procedures, safety, recovery, and aesthetic results.';
        break;
      case 'dermatology':
        categoryContext = 'Focus on skin health, treatments for conditions, anti-aging approaches, and skincare advice.';
        break;
      case 'functional-medicine':
        categoryContext = 'Focus on holistic health, root-cause analysis, preventative approaches, and wellness optimization.';
        break;
      case 'medical-spa':
        categoryContext = 'Focus on non-surgical treatments, injectables, facials, and other spa services with medical benefits.';
        break;
      default:
        categoryContext = 'Focus on general wellness, beauty, and aesthetics.';
    }

    // Combine prompts
    const fullPrompt = `${BASE_PROMPT}

SPECIFIC TOPIC TO WRITE ABOUT: ${prompt}

CATEGORY CONTEXT: ${categoryContext}

Now write the complete article in the JSON format specified above.`;

    console.log('Sending request to Claude API...');
    // Create a message and get the model's response
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          { role: 'user', content: fullPrompt }
        ],
        system: "You are an expert medical content creator focused on plastic surgery and aesthetics. Generate well-structured, factual content using medical expertise and marketing knowledge."
      });

      // Parse the content from JSON format
      // Access the content safely with type checking
      const contentBlock = message.content[0];
      const content = contentBlock && 'text' in contentBlock ? contentBlock.text : '';
      
      try {
        // Extract the JSON portion - Claude sometimes wraps the JSON in markdown code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                         content.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, content];
        
        const jsonContent = jsonMatch[1].trim();
        const article = JSON.parse(jsonContent);
        
        // Ensure the content is in the correct format
        if (!article.title || !article.excerpt || !article.content) {
          throw new Error('Generated content is missing required fields');
        }
        
        // Add status and category
        article.status = 'draft';
        article.category_id = category;
        
        return NextResponse.json({ article });
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        console.log('Raw content:', content);
        return NextResponse.json(
          { 
            error: 'Failed to parse AI response', 
            details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
            raw_content: content
          },
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error('Anthropic API error:', apiError);
      return NextResponse.json(
        { 
          error: 'Anthropic API error', 
          details: apiError instanceof Error ? apiError.message : 'Unknown API error',
          status: 'error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate article', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      },
      { status: 500 }
    );
  }
} 