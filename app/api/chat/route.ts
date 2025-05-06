import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase';
import { processUserMessage } from '@/lib/chat/process-message';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, userId } = await req.json();
    
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Initialize Supabase client
    const supabase = createClient();
    
    // Get user information if authenticated
    let userInfo = null;
    if (userId) {
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      userInfo = user;
    }
    
    // Process the message through our LLM service
    const response = await processUserMessage(message, conversationId, userInfo);
    
    // If we have a userId and conversationId, store the message in the database
    if (userId && conversationId) {
      // Store user message
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        user_id: userId,
        content: message,
        role: 'user',
      });
      
      // Store assistant response
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        user_id: userId,
        content: response.message,
        role: 'assistant',
        metadata: response.metadata || {},
      });
    }
    
    return Response.json({
      message: response.message,
      actions: response.actions || [],
      metadata: response.metadata || {},
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process message' }, 
      { status: 500 }
    );
  }
}