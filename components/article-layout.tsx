"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { Article } from "@/lib/articles"
import Link from "next/link"
import { articles } from "@/lib/articles"

interface ArticleLayoutProps {
  article: Article;
}

export function ArticleLayout({ article }: ArticleLayoutProps) {
  // Get 3 other articles, excluding the current one
  const relatedArticles = articles
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative">
        {/* Category Tag */}
        <div className="absolute top-32 left-0 right-0 z-10">
          <div className="container mx-auto px-4">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-block px-4 py-2 text-sm font-cerebri font-normal uppercase tracking-wide text-white bg-black/50 backdrop-blur-sm"
            >
              {article.category}
            </motion.span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto"
          >
            <div className="max-w-3xl">
              <h1 className="text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif text-white mb-6">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="text-xl font-cerebri font-light text-gray-300 mb-8">
                  {article.subtitle}
                </p>
              )}
              <div className="flex items-center gap-4 text-gray-400 font-cerebri">
                <time>{new Date(article.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</time>
                {article.readTime && (
                  <>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div 
              className="prose prose-lg prose-invert max-w-none
                prose-headings:font-serif prose-headings:tracking-tight prose-headings:leading-tight
                prose-h2:text-[clamp(1.75rem,3vw,2rem)] prose-h2:mt-20 prose-h2:mb-6 prose-h2:font-serif prose-h2:text-white
                prose-h3:text-[clamp(1.25rem,2vw,1.5rem)] prose-h3:mt-12 prose-h3:mb-4 prose-h3:font-serif prose-h3:text-white
                prose-p:font-cerebri prose-p:font-light prose-p:text-lg prose-p:leading-relaxed prose-p:text-gray-300 prose-p:mb-6
                prose-ul:mt-4 prose-ul:mb-6 prose-ul:grid prose-ul:gap-2
                prose-li:relative prose-li:pl-6 prose-li:text-gray-300 prose-li:font-cerebri prose-li:font-light prose-li:text-lg
                prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[0.6em] prose-li:before:h-1.5 prose-li:before:w-1.5 prose-li:before:rounded-full prose-li:before:bg-gray-300
                [&_.article-section]:mb-20
                [&_.article-lead]:text-lg [&_.article-lead]:font-cerebri [&_.article-lead]:font-light [&_.article-lead]:leading-relaxed [&_.article-lead]:text-gray-300 [&_.article-lead]:mb-12
                [&_.article-cta]:text-lg [&_.article-cta]:font-cerebri [&_.article-cta]:font-light [&_.article-cta]:text-white [&_.article-cta]:mt-12"
              dangerouslySetInnerHTML={{ __html: article.content || '' }}
            />

            {/* Article Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-zinc-800">
                <h3 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-400 mb-4">
                  Related Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 text-sm font-cerebri font-light text-gray-400 border border-zinc-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Articles */}
            <div className="mt-24">
              <h3 className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-400 mb-8">
                More Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link 
                    key={relatedArticle.id} 
                    href={`/articles/${relatedArticle.slug}`}
                    className="group relative flex flex-col overflow-hidden border border-zinc-800 bg-black transition-colors duration-300 hover:border-zinc-700"
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <Image 
                        src={relatedArticle.image}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div className="flex-1">
                        <div className="text-sm font-cerebri font-normal uppercase tracking-wide text-gray-400 mb-2">
                          {relatedArticle.category}
                        </div>
                        <h2 className="text-xl font-serif mb-2 text-white group-hover:text-gray-300 transition-colors duration-300">
                          {relatedArticle.title}
                        </h2>
                        <p className="text-gray-400 mb-4 font-cerebri font-light line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                        <div className="flex justify-between items-center text-sm text-gray-500 font-cerebri">
                          <span>{new Date(relatedArticle.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                          {relatedArticle.readTime && (
                            <span>{relatedArticle.readTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
} 