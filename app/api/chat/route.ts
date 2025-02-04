// app/api/chat/route.ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request): Promise<Response> {
  try {
    const { messages }: ChatRequest = await req.json();

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // Create chat completion
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are Sophie, an AI assistant for Allure MD, a premier aesthetic medicine practice. 
          Your role is to help patients learn about our services, schedule appointments, and answer questions about treatments.
          Always be professional, friendly, and knowledgeable. If asked about medical advice, remind users that 
          you can provide general information but specific medical recommendations should come from our providers during consultation.`,
        },
        ...messages,
      ],
    });

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk.choices[0]?.delta?.content || '');
    }

    return new Response(chunks.join(''), {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to process chat request',
    };
    
    if (error instanceof Error) {
      errorResponse.details = error.message;
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
