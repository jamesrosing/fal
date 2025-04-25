import { notFound } from "next/navigation"
import { Metadata } from "next"
import { NavBar } from "@/components/nav-bar"
import Image from "next/image"
import { getCloudinaryUrl } from "@/lib/cloudinary"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from '@supabase/supabase-js'
import { Article } from "@/lib/types"
import ArticleContent from "@/components/articles/ArticleContent"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';
import { mediaId, mediaUrl, getMediaUrl } from "@/lib/media";



type Props = {
  params: { slug: string }
}

// Get article from database
async function getArticle(slug: string): Promise<Article | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return null;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:article_categories(name, slug)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();
    
    if (error) {
      console.error("Error fetching article:", error);
      return null;
    }
    
    // Transform data to match Article interface if needed
    if (data) {
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle,
        excerpt: data.excerpt,
        content: data.content,
        image: data.featured_image,
        featured_image: data.featured_image,
        category: data.category?.slug,
        categoryName: data.category?.name,
        category_id: data.category_id,
        date: data.published_at || data.created_at,
        publishedAt: data.published_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        readTime: data.reading_time ? `${data.reading_time} min` : undefined,
        author: data.author_id,  // Will need to be extended with author lookup
        status: data.status,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error in getArticle:", error);
    return null;
  }
}

// Get related articles
async function getRelatedArticles(article: Article): Promise<Article[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return [];
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Find by category_id if available, otherwise by category
    let query = supabase
      .from('articles')
      .select(`
        *,
        category:article_categories(name, slug)
      `)
      .eq('status', 'published')
      .neq('id', article.id)
      .order('published_at', { ascending: false })
      .limit(3);
    
    if (article.category_id) {
      query = query.eq('category_id', article.category_id);
    } else if (article.category) {
      // Lookup the category_id first
      const { data: categoryData } = await supabase
        .from('article_categories')
        .select('id')
        .eq('slug', article.category)
        .single();
      
      if (categoryData?.id) {
        query = query.eq('category_id', categoryData.id);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching related articles:", error);
      return [];
    }
    
    // Transform data to match Article interface
    return data.map(item => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt,
      image: item.featured_image,
      featured_image: item.featured_image,
      category: item.category?.slug,
      categoryName: item.category?.name,
      date: item.published_at || item.created_at,
      readTime: item.reading_time ? `${item.reading_time} min` : undefined,
    }));
  } catch (error) {
    console.error("Error in getRelatedArticles:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    };
  }
  
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt || article.date,
      modifiedTime: article.updatedAt,
      authors: article.author ? [article.author] : undefined,
      images: article.image ? [
        {
          url: article.image.includes('https://') 
            ? article.image 
            : mediaUrl(`articles/${article.image}`),
          width: 1200,
          height: 630,
          alt: article.title
        }
      ] : undefined
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article);
  
  // Prepare the image URL
  const imageUrl = article.image 
    ? (article.image.includes('https://') 
      ? article.image 
      : mediaUrl(`articles/${article.image}`)) 
    : '/placeholder-image.jpg';
  
  // Get the article category display name
  const categoryName = article.categoryName || article.category;
  
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
                <span>{article.author || 'Allure MD'}</span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                <span>{new Date(article.date || article.createdAt || '').toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                <span>{article.readTime || '5 min'} read</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="py-16 md:py-24 bg-zinc-900 text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <ArticleContent article={article} />
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
                const relatedImageUrl = relatedArticle.image ? 
                  (relatedArticle.image.includes('https://') 
                    ? relatedArticle.image 
                    : mediaUrl(`articles/${relatedArticle.image}`)) 
                  : '/placeholder-image.jpg';
                
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