// components/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, StopCircle } from 'lucide-react';
import Image from 'next/image';

interface ChatMessage {
  role: string;
  content: string;
  id?: string;
}

export function ChatInterface() {
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
    
    const userMessage = { 
      role: 'user', 
      content: input,
      id: `user-${Date.now()}-${Math.random()}`
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content }))
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.text();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data,
        id: `assistant-${Date.now()}-${Math.random()}`
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        id: `error-${Date.now()}-${Math.random()}`
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
    // Implement voice recording logic here
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto py-4 space-y-6 ${messages.length === 0 ? 'flex items-center justify-center' : ''}`}>
        <div className="max-w-3xl w-full mx-auto px-4">
          {messages.length === 0 ? (
            <div className="space-y-8">
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold text-white mb-4">
                  Welcome! I&apos;m Anna, your Allure MD Assistant
                </h2>
                <p className="text-zinc-400 max-w-md mx-auto">
                  I can help you schedule appointments, answer questions about our services,
                  and provide information about our treatments and providers.
                </p>
              </motion.div>

              {/* Input Area for Empty State */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Anna..."
                  className="w-full p-4 pr-24 bg-zinc-800 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                  rows={1}
                  disabled={isLoading}
                />
                <div className="absolute right-2 bottom-2 flex gap-2">
                  <button
                    onClick={toggleRecording}
                    className={`p-2 rounded-lg transition-colors ${
                      isRecording 
                        ? 'text-red-500 hover:bg-red-500/10' 
                        : 'text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className={`p-2 rounded-lg transition-colors ${
                      isLoading || !input.trim()
                        ? 'text-zinc-600 cursor-not-allowed'
                        : 'text-blue-500 hover:bg-blue-500/10'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              <p className="text-xs text-center text-zinc-500">
                AI Assistant may produce inaccurate information. Verify important details during your consultation.
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${msg.role === 'assistant' ? 'items-start' : 'items-end'}`}>
                      {msg.role === 'assistant' && (
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image
                            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/logos/avatar/Sophie-at-Allure-MD.png"
                            alt="Anna"
                            fill
                            className="rounded-full object-cover"
                            sizes="32px"
                            priority
                          />
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-100'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <div className="relative w-8 h-8">
                          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                            <span className="text-white text-sm">You</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-3 items-start">
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <Image
                          src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/logos/avatar/Sophie-at-Allure-MD.png"
                          alt="Anna"
                          fill
                          className="rounded-full object-cover"
                          sizes="32px"
                        />
                      </div>
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

              {/* Input Area for Chat State */}
              <div className="sticky bottom-0 bg-zinc-900 pt-4">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message Anna..."
                    className="w-full p-4 pr-24 bg-zinc-800 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                    rows={1}
                    disabled={isLoading}
                  />
                  <div className="absolute right-2 bottom-2 flex gap-2">
                    <button
                      onClick={toggleRecording}
                      className={`p-2 rounded-lg transition-colors ${
                        isRecording 
                          ? 'text-red-500 hover:bg-red-500/10' 
                          : 'text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className={`p-2 rounded-lg transition-colors ${
                        isLoading || !input.trim()
                          ? 'text-zinc-600 cursor-not-allowed'
                          : 'text-blue-500 hover:bg-blue-500/10'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-center text-zinc-500 mt-2">
                  AI Assistant may produce inaccurate information. Verify important details during your consultation.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
