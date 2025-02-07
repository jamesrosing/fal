"use client"

import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { useSearchParams } from "next/navigation"

const categories = [
  { id: "latest-news", name: "Latest News" },
  { id: "educational-content", name: "Educational Content" },
  { id: "patient-stories", name: "Patient Stories" },
  { id: "health-tips", name: "Health Tips" }
];

// This would typically come from a CMS or API
const articles = Array.from({ length: 12 }, (__, i) => ({
  id: i + 1,
  title: `Article ${i + 1}`,
  excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
  imageUrl: `/placeholder.svg?height=200&width=300&text=Article${i + 1}`,
  category: categories[Math.floor(Math.random() * categories.length)].id,
  date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
}));

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'latest-news';

  const filteredArticles = articles.filter(article => 
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
          {filteredArticles.map((article) => (
            <Link 
              key={article.id} 
              href={`/articles/${article.id}`}
              className="group border border-white/10 overflow-hidden hover:border-white/20 transition-colors duration-300"
            >
              <div className="relative h-48">
                <Image 
                  src={article.imageUrl}
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