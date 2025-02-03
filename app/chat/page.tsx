'use client';

import { ChatInterface } from '@/components/ChatInterface';
import { motion } from 'framer-motion';

export default function ChatPage() {
  return (
    <main className="flex h-screen bg-zinc-900">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 border-r border-zinc-800 p-4 flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Chat History</h2>
          <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <span className="sr-only">New Chat</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {/* Chat history items would go here */}
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer">
            <img
              src="/logo.png"
              alt="Allure MD Logo"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Anna, Allure MD Assistant</p>
              <p className="text-xs text-zinc-400">Powered by GPT-4</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
        >
          <ChatInterface />
        </motion.div>
      </div>
    </main>
  );
} 