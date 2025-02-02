"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Play, Pause, Filter, X, ChevronDown } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

// Sample articles data - in production, this would come from a CMS or API
const articles = {
  "latest-news": [
    {
      title: "New EMSCULPT Location in Newport Beach",
      excerpt: "Allure MD expands with dedicated EMSCULPT facility, offering the latest in body contouring technology.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/emsculpt-location.webp",
      category: "Latest News",
      date: "2024-03-15",
      readTime: "3 min read",
      href: "/articles/latest-news/new-emsculpt-location",
      tags: ["medical-spa"]
    },
    {
      title: "Introducing Advanced Dermatology Services",
      excerpt: "Allure MD adds cutting-edge treatments to its dermatology department, expanding patient care options.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/new-dermatology.webp",
      category: "Latest News",
      date: "2024-03-12",
      readTime: "4 min read",
      href: "/articles/latest-news/advanced-dermatology-services",
      tags: ["dermatology"]
    }
  ],
  "educational-content": [
    {
      title: "Understanding Breast Augmentation Options",
      excerpt: "A comprehensive guide to breast augmentation procedures, including implant types, sizes, and placement options.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/breast-augmentation.webp",
      category: "Educational Content",
      date: "2024-03-10",
      readTime: "8 min read",
      href: "/articles/educational/breast-augmentation-guide",
      tags: ["plastic-surgery"]
    },
    {
      title: "The Science Behind Chemical Peels",
      excerpt: "An in-depth look at how chemical peels work and their benefits for different skin types.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/chemical-peels.webp",
      category: "Educational Content",
      date: "2024-03-08",
      readTime: "6 min read",
      href: "/articles/educational/chemical-peels-science",
      tags: ["medical-spa", "dermatology"]
    }
  ],
  "patient-stories": [
    {
      title: "Sarah's Transformation Journey",
      excerpt: "How combined plastic surgery and medical spa treatments helped Sarah achieve her aesthetic goals.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/patient-story-1.webp",
      category: "Patient Stories",
      date: "2024-03-14",
      readTime: "5 min read",
      href: "/articles/patient-stories/sarahs-journey",
      tags: ["plastic-surgery", "medical-spa"]
    },
    {
      title: "A Path to Wellness with Functional Medicine",
      excerpt: "John shares his experience overcoming chronic health issues through our holistic approach.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/patient-story-2.webp",
      category: "Patient Stories",
      date: "2024-03-11",
      readTime: "7 min read",
      href: "/articles/patient-stories/johns-wellness-journey",
      tags: ["functional-medicine"]
    }
  ],
  "health-tips": [
    {
      title: "Post-Surgery Recovery Tips",
      excerpt: "Expert advice for optimal healing and recovery after plastic surgery procedures.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/recovery-tips.webp",
      category: "Health Tips",
      date: "2024-03-13",
      readTime: "5 min read",
      href: "/articles/health-tips/post-surgery-recovery",
      tags: ["plastic-surgery"]
    },
    {
      title: "Maintaining Your Skin Health",
      excerpt: "Daily skincare routines and lifestyle habits for long-lasting dermatological results.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/skin-health.webp",
      category: "Health Tips",
      date: "2024-03-09",
      readTime: "4 min read",
      href: "/articles/health-tips/skin-health-maintenance",
      tags: ["dermatology"]
    }
  ]
}

const categories = [
  { id: "latest-news", name: "Latest News" },
  { id: "educational-content", name: "Educational Content" },
  { id: "patient-stories", name: "Patient Stories" },
  { id: "health-tips", name: "Health Tips" }
]

const serviceCategories = [
  { id: "all", name: "All Services" },
  { id: "plastic-surgery", name: "Plastic Surgery" },
  { id: "dermatology", name: "Dermatology" },
  { id: "medical-spa", name: "Medical Spa" },
  { id: "functional-medicine", name: "Functional Medicine" }
]

function ArticleCard({ article }: { article: typeof articles["latest-news"][0] }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null)

  const toggleSpeech = () => {
    if (!speech) {
      const newSpeech = new SpeechSynthesisUtterance(article.excerpt)
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-black"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-cerebri text-gray-400">
              {article.category}
            </p>
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
          <a href={article.href} className="mt-2 block">
            <h3 className="text-xl font-serif text-white transition-colors duration-300 group-hover:text-gray-300">
              {article.title}
            </h3>
            <p className="mt-3 text-base font-cerebri font-light text-gray-400">
              {article.excerpt}
            </p>
          </a>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex space-x-1 text-sm font-cerebri text-gray-400">
            <time dateTime={article.date}>{new Date(article.date).toLocaleDateString()}</time>
            <span aria-hidden="true">&middot;</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Sidebar({ 
  isOpen, 
  onClose, 
  activeCategory, 
  setActiveCategory, 
  activeService, 
  setActiveService,
  isDesktopCollapsed,
  toggleDesktopCollapse
}: { 
  isOpen: boolean
  onClose: () => void
  activeCategory: string
  setActiveCategory: (category: string) => void
  activeService: string
  setActiveService: (service: string) => void
  isDesktopCollapsed: boolean
  toggleDesktopCollapse: () => void
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-zinc-900 z-50 transform transition-all duration-300 ease-in-out",
        "lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]",
        // Mobile states
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        // Desktop collapsed state
        isDesktopCollapsed && "lg:w-16"
      )}>
        <div className={cn(
          "h-full p-6",
          isDesktopCollapsed && "lg:p-3"
        )}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={cn(
              "text-lg font-cerebri text-white transition-opacity duration-300",
              isDesktopCollapsed && "lg:hidden"
            )}>
              Filters
            </h3>
            {/* Mobile close button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDesktopCollapse}
              className="hidden lg:flex"
            >
              <ChevronDown className={cn(
                "h-5 w-5 transform transition-transform duration-300",
                isDesktopCollapsed ? "-rotate-90" : "rotate-90"
              )} />
            </Button>
          </div>

          <div className={cn(
            "transition-opacity duration-300",
            isDesktopCollapsed && "lg:opacity-0 lg:invisible"
          )}>
            {/* Content Type Filter */}
            <div className="mb-8">
              <h4 className="text-sm font-cerebri text-gray-400 mb-4 flex items-center">
                Content Type
                <ChevronDown className="ml-2 h-4 w-4" />
              </h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md font-cerebri text-sm transition-colors",
                      activeCategory === category.id 
                        ? "bg-white text-black" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Category Filter */}
            <div>
              <h4 className="text-sm font-cerebri text-gray-400 mb-4 flex items-center">
                Service Type
                <ChevronDown className="ml-2 h-4 w-4" />
              </h4>
              <div className="space-y-2">
                {serviceCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveService(category.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md font-cerebri text-sm transition-colors",
                      activeService === category.id 
                        ? "bg-white text-black" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Articles() {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState("latest-news")
  const [activeService, setActiveService] = useState("all")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  
  useEffect(() => {
    const section = searchParams.get('section')
    if (section) {
      const element = document.getElementById(section)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
          setActiveCategory(section)
        }, 100)
      }
    }
  }, [searchParams])

  // Filter articles based on both content type and service category
  const filteredArticles = articles[activeCategory as keyof typeof articles].filter(article => {
    if (activeService === "all") return true
    return article.tags?.includes(activeService) ?? false
  })

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[50vh]">
        <div className="absolute inset-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles-hero.webp"
            alt="Articles at Allure MD"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-white"
            >
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                Articles
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Stay informed and inspired
              </h2>
              <p className="text-lg font-cerebri font-light">
                Explore our collection of articles covering the latest in plastic surgery, dermatology,
                medical spa treatments, and functional medicine.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Articles Section with Sidebar */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className={cn(
            "lg:grid lg:gap-8",
            isDesktopCollapsed 
              ? "lg:grid-cols-[4rem,1fr]" 
              : "lg:grid-cols-[280px,1fr]"
          )}>
            {/* Sidebar */}
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              activeService={activeService}
              setActiveService={setActiveService}
              isDesktopCollapsed={isDesktopCollapsed}
              toggleDesktopCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            />

            {/* Main Content */}
            <div>
              {/* Mobile Filter Button */}
              <div className="mb-8 lg:hidden">
                <Button 
                  variant="outline" 
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-full font-cerebri"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter Articles
                </Button>
              </div>

              {/* Articles Grid */}
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-2">
                {filteredArticles.map((article, index) => (
                  <ArticleCard key={index} article={article} />
                ))}
              </div>

              {/* Empty State */}
              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg font-cerebri text-gray-400">
                    No articles found for the selected filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 