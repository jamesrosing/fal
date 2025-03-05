// app/api/chat/route.ts
import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextRequest, NextResponse } from "next/server";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  model?: string;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Get request body
    const { messages, model } = await req.json();

    // Check if deepseek model is requested
    const isDeepSeek = model === 'deepseek-reasoner';
    const apiKey = isDeepSeek 
      ? process.env.DEEPSEEK_API_KEY 
      : process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
    
    // Set up the proper client based on model type
    let client;
    let stream;
    
    if (isDeepSeek) {
      client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.deepseek.com',
      });
      
      const response = await client.chat.completions.create({
        model: 'deepseek-reasoner',
        messages,
        stream: true,
      });
      
      // Create a TransformStream to extract reasoning_content
      const reasoningTransformer = new TransformStream({
        start(controller) {
          controller.enqueue('# Thinking Process\n\n');
        },
        transform(chunk, controller) {
          // Only pass reasoning content to the transformer output
          if (chunk.choices[0]?.delta?.reasoning_content) {
            controller.enqueue(chunk.choices[0].delta.reasoning_content);
          }
        },
        flush(controller) {
          controller.enqueue('\n\n# Answer\n\n');
        }
      });
      
      // Create a TransformStream for the final content
      const contentTransformer = new TransformStream({
        transform(chunk, controller) {
          // Only pass regular content to the transformer output
          if (chunk.choices[0]?.delta?.content) {
            controller.enqueue(chunk.choices[0].delta.content);
          }
        }
      });
      
      // Split the response through both transformers
      const [reasoningStream, contentStream] = response.toReadableStream().tee();
      
      // Connect the streams to their respective transformers
      const processedReasoningStream = reasoningStream.pipeThrough(reasoningTransformer);
      const processedContentStream = contentStream.pipeThrough(contentTransformer);
      
      // Merge the two streams into a single ReadableStream
      const mergedStream = new ReadableStream({
        async start(controller) {
          const reasoningReader = processedReasoningStream.getReader();
          const contentReader = processedContentStream.getReader();
          
          // First get all reasoning content
          let reasoningDone = false;
          while (!reasoningDone) {
            const { done, value } = await reasoningReader.read();
            reasoningDone = done;
            if (!done && value) {
              controller.enqueue(value);
            }
          }
          
          // Then get all content
          let contentDone = false;
          while (!contentDone) {
            const { done, value } = await contentReader.read();
            contentDone = done;
            if (!done && value) {
              controller.enqueue(value);
            }
          }
          
          controller.close();
        }
      });
      
      return new StreamingTextResponse(mergedStream);
    } else {
      // Default to OpenAI or Anthropic
      client = new OpenAI({
        apiKey,
      });
      
      const response = await client.chat.completions.create({
        model: model || 'gpt-4',
        messages,
        stream: true,
      });
      
      stream = OpenAIStream(response);
      return new StreamingTextResponse(stream);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}