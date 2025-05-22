'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { XIcon, MinusIcon, ArrowUpIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatAction {
  type: string;
  data: any;
}

interface ChatContainerProps {
  initialMessages?: ChatMessage[];
  conversationId?: string;
  userId?: string;
  title?: string;
  className?: string;
}

export function ChatContainer({
  initialMessages = [],
  conversationId,
  userId,
  title = 'Chat with Allure MD',
  className
}: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [actions, setActions] = useState<ChatAction[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Generate a temporary ID
    const tempId = `temp-${Date.now()}`;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: tempId,
      content,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          conversationId,
          userId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: data.message,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Set any actions returned from the API
      if (data.actions && data.actions.length > 0) {
        setActions(data.actions);
      } else {
        setActions([]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Unable to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle chat actions
  const handleAction = (action: ChatAction) => {
    // Handle different action types
    switch (action.type) {
      case 'SUGGEST_APPOINTMENT_BOOKING':
        if (action.data.options) {
          // Clear the actions after handling
          setActions([]);
          
          // If user selects to schedule
          if (action.data.value === 'schedule') {
            router.push('/appointment');
          }
        }
        break;
        
      default:
        console.warn('Unknown action type:', action.type);
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          height: minimized ? '60px' : 'auto',
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed bottom-4 right-4 z-50 w-[360px] max-w-[90vw]",
          "shadow-lg rounded-lg overflow-hidden",
          className
        )}
      >
        <Card className="border-primary/10">
          {/* Header */}
          <CardHeader className="p-3 bg-primary/5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {title}
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setMinimized(!minimized)}
              >
                {minimized ? <ArrowUpIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => router.back()}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          {/* Chat Messages */}
          {!minimized && (
            <CardContent className="p-3 h-[300px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                  <p>How can we help you today?</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      message={msg.content}
                      isUser={msg.role === 'user'}
                      timestamp={msg.timestamp}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
              
              {/* Show error if any */}
              {error && (
                <div className="bg-destructive/10 text-destructive text-xs p-2 rounded mt-2">
                  {error}
                </div>
              )}
              
              {/* Display actions if any */}
              {actions.length > 0 && (
                <div className="mt-2 space-y-2">
                  {actions.map((action, i) => (
                    <div key={`action-${i}`} className="flex flex-col gap-2">
                      <p className="text-sm text-muted-foreground">{action.data.message}</p>
                      <div className="flex flex-wrap gap-2">
                        {action.data.options?.map((option: any, j: number) => (
                          <Button
                            key={`option-${j}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction({ ...action, data: { ...action.data, value: option.value } })}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
          
          {/* Input */}
          {!minimized && (
            <CardFooter className="p-3 pt-0">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={loading}
                placeholder="Type your message..."
              />
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}