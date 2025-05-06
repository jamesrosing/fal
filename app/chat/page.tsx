'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { ChatContainer, ChatMessage } from '@/components/chat';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [userId, setUserId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  
  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        const supabase = createClient();
        
        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUserId(session.user.id);
          
          // Try to find most recent conversation
          const { data: conversations } = await supabase
            .from('chat_conversations')
            .select('id')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          const conversationId = conversations?.[0]?.id;
          
          if (conversationId) {
            setConversationId(conversationId);
            
            // Fetch messages for this conversation
            const { data: chatMessages } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: true });
              
            if (chatMessages) {
              setMessages(
                chatMessages.map(msg => ({
                  id: msg.id,
                  content: msg.content,
                  role: msg.role,
                  timestamp: new Date(msg.created_at)
                }))
              );
            }
          } else {
            // Create a new conversation
            const { data: newConversation } = await supabase
              .from('chat_conversations')
              .insert({ user_id: session.user.id })
              .select('id')
              .single();
              
            if (newConversation) {
              setConversationId(newConversation.id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user and messages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserAndMessages();
  }, []);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loader">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Chat with Allure MD</h1>
      
      <div className="bg-card border rounded-lg overflow-hidden">
        <ChatContainer
          initialMessages={messages}
          conversationId={conversationId}
          userId={userId}
          title="Chat with our AI Assistant"
          className="!fixed !bottom-0 !right-0 !w-full md:!w-[600px] !max-w-full !h-[calc(100vh-80px)]"
        />
      </div>
    </div>
  );
}