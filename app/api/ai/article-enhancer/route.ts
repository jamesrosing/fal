import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { Article } from '@/lib/types';

// Base prompt for article enhancement
const BASE_PROMPT = `You are an expert content strategist, SEO specialist, and medical aesthetic industry expert. 
Your task is to analyze and enhance an article for a medical aesthetic practice website to improve:

1. SEO Performance:
   - Optimize title, meta description, and keywords for search visibility
   - Suggest semantic keywords and related topics to enhance topic coverage
   - Recommend proper heading structure (H1, H2, H3) for SEO

2. Engagement Metrics:
   - Enhance the title and subtitle to be more compelling and clickable
   - Improve readability and flow of content
   - Suggest call-to-action elements and engagement hooks
   - Recommend content structure improvements

3. Visual Appeal:
   - Suggest Cloudinary image transformations to enhance existing images
   - Recommend additional image opportunities and types
   - Provide guidance on image placement and quality

4. Medical Accuracy:
   - Ensure all medical information is accurate and appropriately presented
   - Suggest disclaimers or trust signals if needed
   - Balance marketing claims with medical ethics

Provide your analysis and suggestions in a structured format that can be easily parsed as JSON, with clear, actionable recommendations.
`;

export async function POST(request: Request) {
  try {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY is not defined');
      return NextResponse.json(
        { error: 'API key configuration error' },
        { status: 500 }
      );
    }
    
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });
    
    // Parse request
    const { article, focus = 'general' } = await request.json();
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article data is required' },
        { status: 400 }
      );
    }
    
    console.log(`Enhancing article: ${article.title} with focus on ${focus}`);
    
    // Structure article data for AI analysis
    const articleData = {
      id: article.id,
      title: article.title,
      subtitle: article.subtitle || '',
      excerpt: article.excerpt || '',
      meta_description: article.meta_description || '',
      meta_keywords: article.meta_keywords || [],
      content: typeof article.content === 'string' 
        ? article.content 
        : JSON.stringify(article.content),
      featured_image: article.featured_image || '',
      category: article.category_name || '',
      subcategory: article.subcategory_name || '',
      status: article.status || '',
    };
    
    // Create full prompt with focus area
    let fullPrompt = BASE_PROMPT;
    
    // Add focus-specific instructions
    switch (focus) {
      case 'seo':
        fullPrompt += `\nFocus primarily on SEO optimization strategies for this article. Provide detailed keyword recommendations and structural changes to improve search rankings.`;
        break;
      case 'engagement':
        fullPrompt += `\nFocus primarily on improving reader engagement. Suggest narrative improvements, emotional triggers, and content structure to keep readers interested.`;
        break;
      case 'conversion':
        fullPrompt += `\nFocus primarily on conversion optimization. Suggest call-to-action placements, trust signals, and content modifications that will increase the likelihood of readers booking consultations or treatments.`;
        break;
      case 'images':
        fullPrompt += `\nFocus primarily on visual content strategy. Provide detailed Cloudinary transformation suggestions for existing images and recommendations for additional visual content.`;
        break;
    }
    
    // Log the process
    console.log('Sending enhancement request to Anthropic API');
    
    // Make the API call to Anthropic
    const completion = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: fullPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is the article to enhance: ${JSON.stringify(articleData, null, 2)}. 
          
Please provide a comprehensive enhancement plan with the following structure:
- Improved title
- Improved subtitle
- Enhanced meta description
- Optimized meta keywords
- Content structure suggestions (as an array of heading/paragraph recommendations)
- Image suggestions (if applicable)
- Cloudinary transformation recommendations for any images (if applicable)

Format your response as valid JSON that I can parse directly.`
        }
      ]
    });
    
    // Extract and parse the AI response
    const responseContent = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : '';
    
    // Extract JSON from the response
    let enhancementPlan;
    try {
      // Try to find JSON in the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        enhancementPlan = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create a structured response manually
        enhancementPlan = {
          title: article.title,
          subtitle: article.subtitle || 'New Subtitle Suggestion',
          meta_description: article.meta_description || 'Generated meta description',
          meta_keywords: article.meta_keywords || ['keyword1', 'keyword2'],
          content_structure: [
            { type: 'heading', content: 'Structure Improvements' },
            { type: 'notes', content: 'The AI could not generate a properly formatted response. Please try again.' }
          ],
          image_suggestions: [],
          cloudinary_transformations: []
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
    
    console.log('Successfully generated enhancement plan');
    
    return NextResponse.json({
      enhancementPlan,
      article: articleData
    });
    
  } catch (error) {
    console.error('Error in article enhancement:', error);
    return NextResponse.json(
      { error: 'Failed to process enhancement request' },
      { status: 500 }
    );
  }
} 