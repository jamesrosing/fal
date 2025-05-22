'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/ui/button';
import { MessageCircleIcon, XIcon } from 'lucide-react';
import { ChatContainer } from './ChatContainer';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatButtonProps {
  className?: string;
  userId?: string;
}

export function ChatButton({ className, userId }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatContainer 
            userId={userId}
            conversationId={userId ? `user-${userId}-${Date.now()}` : undefined}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <MessageCircleIcon className="h-6 w-6" />
          )}
        </Button>
      </motion.div>
    </>
  );
}