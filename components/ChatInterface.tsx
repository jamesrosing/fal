'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface ChatMessage {
  role: string;
  content: string;
  id?: string;
}

export function ChatInterface({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input, id: `user-${Date.now()}` };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], userId }),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content, id: `assistant-${Date.now()}` }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        id: `error-${Date.now()}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Add voice recording logic if needed
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-lg border border-zinc-800">
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        <div className="max-w-3xl w-full mx-auto px-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
              >
                <div className={`flex gap-3 ${msg.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                  {msg.role === 'assistant' && (
                    <Avatar className="w-8 h-8 border border-zinc-700">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`p-4 rounded-2xl ${
                      msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="w-8 h-8 border border-zinc-700">
                      <AvatarFallback className="bg-zinc-700 text-white text-xs">You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-3 items-start">
                  <Avatar className="w-8 h-8 border border-zinc-700">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">AI</AvatarFallback>
                  </Avatar>
                  <div className="p-4 rounded-2xl bg-zinc-800">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="sticky bottom-0 bg-zinc-900 pt-4">
        <div className="relative max-w-3xl mx-auto px-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about services or book an appointment..."
            className="w-full p-4 pr-24 bg-zinc-800 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-6 bottom-2 flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleRecording}
                    size="icon"
                    variant="ghost"
                    className={`text-zinc-400 hover:bg-zinc-700 ${isRecording ? 'text-red-500' : ''}`}
                  >
                    {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isRecording ? 'Stop recording' : 'Start voice recording'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              variant="ghost"
              className={isLoading || !input.trim() ? 'text-zinc-600' : 'text-blue-500 hover:bg-blue-500/10'}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}