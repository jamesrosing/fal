"use client"

import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { useSearchParams } from "next/navigation"

// This would typically come from a CMS or API
const articles = {
  "new-rf-microneedling-technology": {
    title: "Allure MD Introduces Revolutionary New RF Microneedling Technology",
    excerpt: "Experience the latest advancement in skin rejuvenation with our new state-of-the-art RF microneedling system.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20oxygeneo%20facial%20procedure-ZQLNbwBjHKNSxmLHpiRZgHKb4X2zwm.webp",
    category: "latest-news",
    date: "2024-03-15",
    readTime: "4 min read",
    tags: ["skincare", "technology", "treatments", "microneedling"]
  },
  "pearose-top-physician-assistant": {
    title: "Susan Pearose, PA-C Named Top Dermatology Physician Assistant in Newport Beach",
    excerpt: "Our own Susan Pearose, PA-C has been recognized as one of Orange County's leading dermatology physician assistants for her exceptional expertise and patient care.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20dermatology%20headshot%201-gjRMjadCwzrB94HEchEd1TnD04XcMY.webp",
    category: "latest-news",
    date: "2024-03-10",
    readTime: "5 min read",
    tags: ["dermatology", "awards", "medical-care", "newport-beach", "physician-assistant"]
  },
  "new-medical-spa-services": {
    title: "New Medical Spa Services Now Available",
    excerpt: "Discover our expanded range of medical spa treatments designed for total body rejuvenation.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20medical%20esthetician%20facial%20procedure-BTAqIz6QTH8au0JcLo6JerhGR2Fyqw.webp",
    category: "latest-news",
    date: "2024-03-05",
    readTime: "6 min read",
    tags: ["medical-spa", "treatments", "skincare", "wellness"]
  }
};

const categories = [
  { id: "latest-news", name: "Latest News" },
  { id: "educational-content", name: "Educational Content" },
  { id: "patient-stories", name: "Patient Stories" },
  { id: "health-tips", name: "Health Tips" }
];

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'latest-news';

  const filteredArticles = Object.entries(articles).filter(([_, article]) => 
    !selectedCategory || article.category === selectedCategory
  );

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      <div className="container mx-auto px-4 py-24">
        <div className="mb-16">
          <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-gray-400">Articles</h1>
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif text-white">Latest Updates</h2>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-12">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/articles?category=${category.id}`}
              className={`px-4 py-2 text-sm font-cerebri font-normal transition-colors duration-300 border ${
                selectedCategory === category.id 
                  ? 'border-white text-white' 
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(([slug, article]) => (
            <Link 
              key={slug} 
              href={`/articles/${slug}`}
              className="group border border-white/10 overflow-hidden hover:border-white/20 transition-colors duration-300"
            >
              <div className="relative h-48">
                <Image 
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4">
                <div className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-400 mb-2">
                  {categories.find(cat => cat.id === article.category)?.name}
                </div>
                <h2 className="text-xl font-serif mb-2 text-white group-hover:text-gray-300 transition-colors duration-300">
                  {article.title}
                </h2>
                <p className="text-gray-400 mb-4 font-cerebri font-light">
                  {article.excerpt}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500 font-cerebri">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-cerebri text-gray-400">
              No articles found in this category.
            </p>
          </div>
        )}
      </div>
    </main>
  )
} 