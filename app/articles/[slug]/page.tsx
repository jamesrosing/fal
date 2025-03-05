import { notFound } from "next/navigation"
import { articles, getRelatedArticles } from "@/lib/articles"
import { Metadata } from "next"
import { NavBar } from "@/components/nav-bar"
import { Section } from "@/components/ui/section"
import Image from "next/image"
import { getCloudinaryUrl } from "@/lib/cloudinary"
import Link from "next/link"
import { motion } from "framer-motion"

type Props = {
  params: { slug: string }
}

// Generate metadata for the article page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Get the article by slug
  const article = articles.find(article => article.slug === params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found | Allure MD',
      description: 'The requested article could not be found.',
      robots: {
        index: false,
        follow: false
      }
    };
  }
  
  // Ensure the image URL is valid
  const imageUrl = getCloudinaryUrl(article.image, {
    width: 1200,
    height: 630,
    crop: 'fill',
    gravity: 'auto'
  });
  
  return {
    title: `${article.title} | Allure MD`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt || article.date,
      authors: article.author ? [article.author] : undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [imageUrl]
    }
  };
}

export default function ArticlePage({ params }: Props) {
  // Find the article directly from the articles array
  const article = articles.find(article => article.slug === params.slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article);
  const imageUrl = getCloudinaryUrl(article.image, {
    width: 1200,
    height: 675,
    crop: 'fill',
    gravity: 'auto'
  });
  
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <NavBar />
      
      {/* Article Hero */}
      <section className="relative pt-20">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        
        <div className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 p-6 bg-black lg:bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium uppercase tracking-wider">
                {article.category.replace('-', ' ')}
              </span>
              {article.subcategory && (
                <>
                  <span className="text-zinc-400">•</span>
                  <span className="text-sm text-zinc-400">
                    {article.subcategory.replace('-', ' ')}
                  </span>
                </>
              )}
            </div>
            <h1 className="mb-4 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              {article.author && (
                <span className="text-zinc-300">By {article.author}</span>
              )}
              <span className="text-zinc-400">
                {new Date(article.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {article.readTime && (
                <span className="text-zinc-400">{article.readTime} read</span>
              )}
            </div>
            <p className="text-xl text-zinc-300">{article.excerpt}</p>
          </motion.div>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="py-16 md:py-24 bg-zinc-900 text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="prose prose-lg prose-invert max-w-none">
            {typeof article.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : article.content && Array.isArray(article.content) ? (
              article.content.map((block, index) => (
                <div key={index} className="mb-8">
                  {block.type === 'paragraph' && <p>{block.content}</p>}
                  {block.type === 'heading' && <h2>{block.content}</h2>}
                  {block.type === 'image' && (
                    <div className="my-8">
                      <Image
                        src={getCloudinaryUrl(block.content, {
                          width: 800,
                          height: 450,
                          crop: 'fill'
                        })}
                        alt={block.metadata?.alt || 'Article image'}
                        width={800}
                        height={450}
                        className="rounded-lg"
                      />
                      {block.metadata?.caption && (
                        <p className="text-center text-sm text-zinc-400 mt-2">
                          {block.metadata.caption}
                        </p>
                      )}
                    </div>
                  )}
                  {block.type === 'list' && (
                    <ul className="list-disc pl-6">
                      {block.content.split('\n').map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {block.type === 'quote' && (
                    <blockquote className="border-l-4 border-zinc-500 pl-4 italic">
                      {block.content}
                    </blockquote>
                  )}
                  {block.type === 'callout' && (
                    <div className="bg-zinc-800 p-6 rounded-lg">
                      <p className="font-bold mb-2">{block.metadata?.title || 'Note'}</p>
                      <p>{block.content}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-12">This article has no content yet.</p>
            )}
          </div>
        </div>
      </section>
      
      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 md:py-24 bg-black text-white">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Related Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle) => {
                const relatedImageUrl = getCloudinaryUrl(relatedArticle.image, {
                  width: 400,
                  height: 250,
                  crop: 'fill',
                  gravity: 'auto'
                });
                
                return (
                  <motion.div
                    key={relatedArticle.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-zinc-800 rounded-lg overflow-hidden"
                  >
                    <Link href={`/articles/${relatedArticle.slug}`} className="block">
                      <div className="relative h-40">
                        <Image
                          src={relatedImageUrl}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold mb-2">{relatedArticle.title}</h3>
                        <p className="text-zinc-400 text-sm line-clamp-2">{relatedArticle.excerpt}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
} 