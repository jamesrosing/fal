'use client';

import { motion } from 'framer-motion';
import { ChatInterface } from '@/components/ChatInterface';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


const presetPrompts = [
  {
    title: "Schedule Appointment",
    description: "Help me schedule a consultation or treatment appointment"
  },
  {
    title: "Treatment Information",
    description: "Learn about our treatments and procedures"
  },
  {
    title: "Recovery Guidelines",
    description: "Get post-treatment care instructions"
  },
  {
    title: "Cost & Financing",
    description: "Inquire about treatment costs and financing options"
  }
];

// Define available models
const MODELS = [
  { id: 'gpt-4', name: 'OpenAI GPT-4', description: 'Most capable model for complex tasks' },
  { 
    id: 'deepseek-reasoner', 
    name: 'DeepSeek Reasoner', 
    description: 'Shows step-by-step reasoning before providing the final answer'
  }
];

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);

  return (
    <div className="flex h-screen bg-zinc-900">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-zinc-800 rounded-lg md:hidden"
      >
        {isSidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Sidebar */}
      <motion.div 
        initial={{ x: -300, opacity: 0 }}
        animate={{ 
          x: isSidebarOpen ? 0 : -300,
          opacity: isSidebarOpen ? 1 : 0
        }}
        className={`fixed md:relative w-80 h-full border-r border-zinc-800 flex flex-col bg-zinc-900 z-40 transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Anna's Profile */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <OptimizedImage id="logos/avatar/Sophie-at-Allure-MD.png" alt="Anna"   priority fill />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">Anna</h2>
              <p className="text-sm text-zinc-400">Allure MD Assistant</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-zinc-800">
          <button 
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            New Chat
          </button>
        </div>
        
        {/* Preset Prompts */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">What I can help you with</h3>
          <div className="space-y-3">
            {presetPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <h4 className="text-white font-medium mb-1">{prompt.title}</h4>
                <p className="text-sm text-zinc-400">{prompt.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold mb-4">Select AI Model</h2>
          <RadioGroup value={selectedModel} onValueChange={setSelectedModel} className="space-y-4">
            {MODELS.map((model) => (
              <div key={model.id} className="flex items-start space-x-2">
                <RadioGroupItem value={model.id} id={model.id} />
                <div className="grid gap-1">
                  <Label htmlFor={model.id} className="font-medium">{model.name}</Label>
                  <p className="text-xs text-gray-500">{model.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
          
          {selectedModel === 'deepseek-reasoner' && (
            <div className="mt-4 p-3 bg-blue-900/30 rounded-md text-sm">
              <p className="text-blue-200">
                <strong>New!</strong> The DeepSeek Reasoner model shows its thinking process before
                giving an answer, making it more transparent and helpful for complex questions.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 relative"
      >
        <ChatInterface model={selectedModel} />
      </motion.div>
    </div>
  );
}