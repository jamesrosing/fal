'use client';

import { motion } from 'framer-motion';
import { ChatInterface } from '@/components/ChatInterface';
import Image from 'next/image';

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-zinc-900">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 border-r border-zinc-800 flex flex-col"
      >
        <div className="p-4 border-b border-zinc-800">
          <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat History will go here */}
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer">
            <div className="relative w-8 h-8">
              <Image
                src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/logos/avatar/Sophie-at-Allure-MD.png"
                alt="Sophie - Allure MD Assistant"
                fill
                className="rounded-full object-cover"
                sizes="32px"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Sophie, Allure MD Assistant</p>
              <p className="text-xs text-zinc-400">Powered by GPT-4</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1"
      >
        <ChatInterface />
      </motion.div>
    </div>
  );
}