import { Article } from '@/lib/types'
import { format } from 'date-fns'
import Head from 'next/head'
import Image from 'next/image'
import { getCloudinaryUrl } from '@/lib/cloudinary'

export default function ArticleContent({ article }: { article: Article }) {
  // Convert the article image to a proper Cloudinary URL
  const imageUrl = article.image ? 
    getCloudinaryUrl(article.image, {
      width: 1200,
      height: 630,
      crop: 'fill',
      gravity: 'auto'
    }) : 
    null;

  return (
    <>
      <Head>
        <title>{article.title} | Allure MD</title>
        <meta name="description" content={article.snippet || article.content.substring(0, 160)} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.snippet || article.content.substring(0, 160)} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <article className="max-w-3xl mx-auto px-4 py-8 font-sans" itemScope itemType="http://schema.org/Article">
        <header className="mb-8">
          <h1 className="text-4xl font-bold font-serif mb-4 text-foreground" itemProp="headline">{article.title}</h1>
          <p className="text-sm text-muted-foreground">
            Published on <time dateTime={article.created_at}>{format(new Date(article.created_at), 'MMMM d, yyyy')}</time>
          </p>
          {imageUrl && (
            <div className="mt-6">
              <Image 
                src={imageUrl} 
                alt={article.title} 
                width={1200} 
                height={630} 
                className="rounded-lg object-cover w-full h-auto" 
                itemProp="image" 
              />
            </div>
          )}
        </header>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-foreground" itemProp="articleBody">
          {article.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('# ')) {
              return <h2 key={index} className="text-3xl font-bold mt-8 mb-4 font-serif">{paragraph.slice(2)}</h2>
            } else if (paragraph.startsWith('## ')) {
              return <h3 key={index} className="text-2xl font-bold mt-6 mb-3 font-serif">{paragraph.slice(3)}</h3>
            } else if (paragraph.startsWith('### ')) {
              return <h4 key={index} className="text-xl font-bold mt-4 mb-2 font-serif">{paragraph.slice(4)}</h4>
            } else {
              return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
            }
          })}
        </div>
        
        <footer className="mt-12 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-muted-foreground">
            Category: <span itemProp="articleSection" className="font-semibold">{article.category}</span>
          </p>
        </footer>
      </article>
    </>
  )
}
