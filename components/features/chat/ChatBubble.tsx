'use client';

import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  avatar?: string;
}

export function ChatBubble({ message, isUser, timestamp, avatar }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full gap-2 items-end mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <img 
            src={avatar || "/images/global/logos/allure-icon.svg"} 
            alt="Allure MD" 
            className="h-8 w-8 object-cover" 
          />
        </Avatar>
      )}
      
      <div
        className={cn(
          "px-4 py-3 rounded-lg max-w-[80%]",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-none" 
            : "bg-muted text-muted-foreground rounded-bl-none"
        )}
      >
        <div className="prose prose-sm dark:prose-invert">
          {message.split('\n').map((paragraph, i) => (
            <p key={i} className={i === 0 ? 'mt-0' : ''}>
              {paragraph}
            </p>
          ))}
        </div>
        {timestamp && (
          <div className={cn(
            "text-[10px] mt-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground/70"
          )}>
            {new Intl.DateTimeFormat('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }).format(timestamp)}
          </div>
        )}
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <img 
            src={avatar || "/images/global/ui/user-avatar.svg"} 
            alt="You" 
            className="h-8 w-8 object-cover" 
          />
        </Avatar>
      )}
    </motion.div>
  );
}