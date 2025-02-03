"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ArticleLayoutProps {
  title: string
  date: string
  readTime: string
  image: string
  content: string
  category: string
  tags?: string[]
}

export function ArticleLayout({
  title,
  date,
  readTime,
  image,
  content,
  category,
  tags
}: ArticleLayoutProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null)

  const toggleSpeech = () => {
    if (!speech) {
      const newSpeech = new SpeechSynthesisUtterance(content)
      setSpeech(newSpeech)
      window.speechSynthesis.speak(newSpeech)
      setIsPlaying(true)
    } else if (isPlaying) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
    } else {
      window.speechSynthesis.resume()
      setIsPlaying(true)
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-4 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <div className="flex items-center space-x-4 text-sm font-cerebri">
                  <span>{category}</span>
                  <span>•</span>
                  <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>
                  <span>•</span>
                  <span>{readTime}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                  onClick={toggleSpeech}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <h1 className="text-[clamp(2rem,4vw,3.5rem)] leading-tight tracking-tight font-serif text-white">
                {title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="prose prose-lg prose-invert font-cerebri font-light"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            {tags && tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-zinc-800">
                <h4 className="text-sm font-cerebri uppercase tracking-wide text-gray-400 mb-4">
                  Related Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm font-cerebri bg-zinc-900 text-gray-400 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
} 