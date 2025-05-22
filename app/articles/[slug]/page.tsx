import { notFound } from "next/navigation"
import { Metadata } from "next"
import { NavBar } from '@/components/shared/layout/nav-bar'
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from '@supabase/supabase-js'
import { Article } from "@/lib/types"
import ArticleContent from '@/components/features/articles/components/ArticleContent'
import CloudinaryFolderImage from '@/components/shared/media/CloudinaryFolderImage'
import { extractImageNameFromPath, isCloudinaryUrl } from '@/lib/cloudinary/folder-utils'

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

  // Process the article image
  const articleImageFolder = 'articles';
  const imageIsCloudinaryUrl = article.image && isCloudinaryUrl(article.image);
  const articleImageName = article.image ? 
    (imageIsCloudinaryUrl ? extractImageNameFromPath(article.image) : article.image) : 
    null;
  
  const ogImageUrl = articleImageName ?
    `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,c_fill,w_1200,h_630/${process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'alluremd'}/${articleImageFolder}/${articleImageName}` :
    undefined;
  
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
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
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
  
  // Process the article image
  const articleImageFolder = 'articles';
  const imageIsCloudinaryUrl = article.image && isCloudinaryUrl(article.image);
  const articleImageName = article.image ? 
    (imageIsCloudinaryUrl ? extractImageNameFromPath(article.image) : article.image) : 
    null;
  
  // Get the article category display name
  const categoryName = article.categoryName || article.category;
  
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <NavBar />
      
      {/* Article Hero */}
      <section className="relative pt-20">
        <div className="relative aspect-[16/9] w-full">
          {articleImageName ? (
            <CloudinaryFolderImage
              folder={articleImageFolder}
              imageName={articleImageName}
              alt={article.title}
              width={1920}
              height={1080}
              className="object-cover w-full h-full"
              priority={true}
              crop="fill"
              gravity="auto"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-900 to-zinc-800" />
          )}
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
                <span>{article.readTime || '5 min read'}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Article Content */}
      <section className="bg-white text-black py-16">
        <div className="container mx-auto">
          <ArticleContent article={article} />
        </div>
      </section>
      
      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-zinc-900 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-8">Related Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map(relatedArticle => {
                const relatedImageIsCloudinaryUrl = relatedArticle.image && isCloudinaryUrl(relatedArticle.image);
                const relatedImageName = relatedArticle.image ? 
                  (relatedImageIsCloudinaryUrl ? extractImageNameFromPath(relatedArticle.image) : relatedArticle.image) : 
                  null;
                
                return (
                  <Link href={`/articles/${relatedArticle.slug}`} key={relatedArticle.id} className="group">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
                      {relatedImageName ? (
                        <CloudinaryFolderImage
                          folder={articleImageFolder}
                          imageName={relatedImageName}
                          alt={relatedArticle.title}
                          width={600}
                          height={450}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          crop="fill"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-zinc-500">No image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-zinc-300 transition-colors">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-zinc-400 text-sm mt-2 line-clamp-2">{relatedArticle.excerpt}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
} 