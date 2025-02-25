import { NextResponse } from 'next/server';
import {openaiClient} from '@/lib/openai-client';
import { ArticleContent } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, type, context } = await req.json();

    // Construct the system message based on the type of content
    const systemMessage = type === 'article'
      ? `You are a professional content writer specializing in medical aesthetics and wellness.
         Your task is to write engaging, informative content that is both scientifically accurate
         and accessible to a general audience. Focus on clear explanations, benefits, and safety
         considerations.`
      : 'You are a professional content writer.';

    // Build the conversation with context
    const messages = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: `Context:
        Title: ${context.title}
        Excerpt: ${context.excerpt}
        
        Task: ${prompt}` },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Process the response into content blocks
    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No content generated');

    const paragraphs = response.split('\n\n').filter(Boolean);
    const content: ArticleContent[] = paragraphs.map(paragraph => ({
      type: 'paragraph',
      content: paragraph.trim(),
    }));

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 