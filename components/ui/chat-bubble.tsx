'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ChatBubble() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <button
        onClick={() => router.push('/chat')}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-700 bg-transparent shadow-lg transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-500"
      >
        <MessageSquare className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
        
        {/* Tooltip */}
        <span className="absolute right-full mr-4 hidden whitespace-nowrap rounded-md bg-zinc-800 px-4 py-2 text-sm text-white group-hover:block max-w-xs">
          I am Anna, Assistant for Allure MD
          <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 border-4 border-transparent border-l-zinc-800"></span>
        </span>

        {/* Pulse Effect */}
        <span className="absolute inset-0 -z-10 animate-ping rounded-full border-2 border-zinc-200 dark:border-zinc-700 opacity-20"></span>
      </button>
    </motion.div>
  );
} 