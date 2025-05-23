'use client'

import type { Article, ArticleContent } from '@/lib/types'
import { format } from 'date-fns'
import CloudinaryFolderImage from '@/components/media/CloudinaryFolderImage'
import { extractImageNameFromPath } from '@/lib/cloudinary/folder-utils'

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export default function ArticleContent({ article }: { article: Article }) {
  // Process the article image path
  const articleImageFolder = 'articles';
  const articleImageName = article.image ? extractImageNameFromPath(article.image) : null;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8 font-sans" itemScope itemType="http://schema.org/Article">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-serif mb-4 text-foreground" itemProp="headline">{article.title}</h1>
        <div className="mt-2 text-sm text-muted-foreground">
          Published on {article.created_at && isValidDate(article.created_at) 
            ? <time dateTime={article.created_at}>{format(new Date(article.created_at), 'MMMM d, yyyy')}</time>
            : <span>unknown date</span>}
        </div>
        {articleImageName && (
          <div className="mt-6">
            <CloudinaryFolderImage
              folder={articleImageFolder}
              imageName={articleImageName}
              alt={article.title}
              width={1200}
              height={630}
              className="rounded-lg object-cover w-full h-auto"
              crop="fill"
              gravity="auto"
              priority={true}
            />
          </div>
        )}
      </header>
      
      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground" itemProp="articleBody">
        {typeof article.content === 'string' ? (
          // Handle plain text content
          article.content.split('\n\n').map((paragraph: string, index: number) => {
            if (paragraph.startsWith('# ')) {
              return <h2 key={index} className="text-3xl font-bold mt-8 mb-4 font-serif">{paragraph.slice(2)}</h2>
            } else if (paragraph.startsWith('## ')) {
              return <h3 key={index} className="text-2xl font-bold mt-6 mb-3 font-serif">{paragraph.slice(3)}</h3>
            } else if (paragraph.startsWith('### ')) {
              return <h4 key={index} className="text-xl font-bold mt-4 mb-2 font-serif">{paragraph.slice(4)}</h4>
            } else {
              return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
            }
          })
        ) : Array.isArray(article.content) ? (
          // Handle structured content blocks
          article.content.map((block: ArticleContent, index: number) => (
            <div key={index} className="mb-8">
              {block.type === 'paragraph' && <p>{block.content}</p>}
              {block.type === 'heading' && <h2>{block.content}</h2>}
              {block.type === 'image' && (
                <div className="my-8">
                  <CloudinaryFolderImage
                    folder={articleImageFolder}
                    imageName={extractImageNameFromPath(block.content)}
                    alt={block.metadata?.alt || 'Article image'}
                    width={800}
                    height={450}
                    className="rounded-lg"
                    crop="fill"
                  />
                  {block.metadata?.caption && (
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      {block.metadata.caption}
                    </p>
                  )}
                </div>
              )}
              {block.type === 'list' && (
                <ul className="list-disc pl-6">
                  {block.content.split('\n').map((item: string, i: number) => (
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
          <p>No content available</p>
        )}
      </div>
      
      <footer className="mt-12 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-muted-foreground">
          Category: <span itemProp="articleSection" className="font-semibold">{article.category}</span>
        </p>
      </footer>
    </article>
  )
}
