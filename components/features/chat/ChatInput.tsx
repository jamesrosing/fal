'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  className,
  disabled = false
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || disabled) return;
    
    onSendMessage(message);
    setMessage('');
  };
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn("flex items-center gap-2 w-full", className)}
    >
      <Input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading || disabled}
        className="flex-1"
      />
      <Button 
        type="submit" 
        size="icon"
        disabled={!message.trim() || isLoading || disabled}
        className="h-10 w-10 rounded-full"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <SendIcon className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}