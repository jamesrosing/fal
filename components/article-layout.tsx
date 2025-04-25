"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { Article, ArticleContent, ARTICLE_CATEGORIES } from "@/lib/types"
import Link from "next/link"
import { articles, getRelatedArticles } from "@/lib/articles"
import { Section } from "@/components/ui/section"
import { getCloudinaryUrl } from "@/lib/cloudinary"
import Head from "next/head"
import { Footer } from "./footer"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';
import { mediaId, mediaUrl, getMediaUrl } from "@/lib/media";



// Inline StructuredData component
function StructuredData({ type, data }: { type: string; data: Record<string, any> }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </Head>
  );
}

interface ArticleLayoutProps {
  article: Article;
}

export function ArticleLayout({ article }: ArticleLayoutProps) {
  // Get 3 other articles, excluding the current one
  const relatedArticles = getRelatedArticles(article, 3);

  // Get the article category display name
  const category = ARTICLE_CATEGORIES.find(cat => cat.id === article.category);
  const categoryName = category?.name || article.category;
  
  // Convert article image to proper Cloudinary URL
  const imageUrl = article.image ? 
    (article.image.includes('https://res.cloudinary.com') 
      ? article.image 
      : mediaUrl(`articles/${article.image}`)) 
    : null;

  // Generate structured data for the article
  const structuredData = {
    type: "Article",
    data: {
      headline: article.title,
      description: article.excerpt,
      image: imageUrl || '/placeholder-image.jpg',
      datePublished: article.publishedAt || article.date,
      dateModified: article.updatedAt || article.date,
      author: article.author ? {
        "@type": "Person",
        name: article.author
      } : {
        "@type": "Organization",
        name: "Allure MD"
      },
      publisher: {
        "@type": "Organization",
        name: "Allure MD",
        logo: {
          "@type": "ImageObject",
          url: mediaUrl("f_auto,q_auto/branding/logo")
        }
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://www.alluremd.com/articles/${article.slug}`
      }
    }
  };

  // Helper function to render article content
  const renderContent = () => {
    if (!article.content) return null;
    
    if (typeof article.content === 'string') {
      return article.content.split('\n\n').map((paragraph: string, index: number) => {
        if (paragraph.startsWith('# ')) {
          return <h2 key={index} className="text-3xl font-serif font-semibold mt-8 mb-4">{paragraph.slice(2)}</h2>
        } else if (paragraph.startsWith('## ')) {
          return <h3 key={index} className="text-2xl font-serif font-semibold mt-6 mb-3">{paragraph.slice(3)}</h3>
        } else if (paragraph.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-zinc-700 pl-4 italic my-6">
              {paragraph.slice(2)}
            </blockquote>
          )
        } else {
          return <p key={index} className="mb-6">{paragraph}</p>
        }
      });
    } else {
      // Handle structured content
      return article.content.map((block: ArticleContent, index: number) => {
        // Implement rendering logic for structured content
        return <p key={index}>{block.content}</p>;
      });
    }
  }

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <NavBar />
      
      {/* Structured Data for SEO */}
      <StructuredData type={structuredData.type} data={structuredData.data} />
      
      {/* Article Hero */}
      <section className="relative pt-20">
        {/* Meta tags */}
        <div className="hidden">
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
          <div itemProp="image" itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="url" content={imageUrl || ''} />
            <meta itemProp="width" content="1200" />
            <meta itemProp="height" content="630" />
          </div>
          <div itemProp="publisher" itemScope itemType="https://schema.org/Organization">
            <meta itemProp="name" content="Allure MD" />
            <div itemProp="logo" itemScope itemType="https://schema.org/ImageObject">
              <meta itemProp="url" content="/logo.png" />
            </div>
          </div>
          <meta itemProp="datePublished" content={article.date} />
          <meta itemProp="dateModified" content={article.date} />
          <meta itemProp="author" content={article.author} />
          <meta itemProp="mainEntityOfPage" content={`/articles/${article.slug}`} />
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-24 left-0 z-10 p-8">
          <div className="container mx-auto px-4">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-block px-4 py-2 text-sm font-cerebri font-normal uppercase tracking-wide text-white bg-black/50 backdrop-blur-sm"
            >
              {categoryName}
            </motion.span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={imageUrl || '/placeholder-image.jpg'}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Article Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-white max-w-4xl mb-4">
                {article.title}
              </h1>
              <div className="text-gray-300 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-base font-cerebri">
                <span>{article.author}</span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                <span>{new Date(article.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                <span>{article.readTime} read</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto font-cerebri text-lg">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {renderContent()}
          </div>
        </div>
      </section>
      
      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="container mx-auto px-4 py-16 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-serif font-semibold mb-8 text-center">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedArticles.map((relatedArticle: Article) => {
              // Convert related article image to proper Cloudinary URL
              const relatedImageUrl = relatedArticle.image ? 
                (relatedArticle.image.includes('https://res.cloudinary.com') 
                  ? relatedArticle.image 
                  : mediaUrl(`articles/${relatedArticle.image}`)) 
                : '/placeholder-image.jpg';
                
              return (
                <Link 
                  href={`/articles/${relatedArticle.slug}`} 
                  key={relatedArticle.id}
                  className="group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden h-full flex flex-col"
                  >
                    <div className="relative h-48">
                      <Image
                        src={relatedImageUrl}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-serif font-semibold group-hover:text-primary transition-colors duration-300 mb-2">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1">{relatedArticle.excerpt}</p>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(relatedArticle.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  )
} 