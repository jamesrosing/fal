'use client';

import { Article } from '@/lib/supabase';
import { format } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface ArticlePreviewProps {
  article: Article;
  categoryName?: string;
}

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export function ArticlePreview({ article, categoryName }: ArticlePreviewProps) {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {categoryName && (
            <Badge variant="outline">{categoryName}</Badge>
          )}
          <div className="mt-2 text-sm text-muted-foreground">
            {article.created_at && isValidDate(article.created_at)
              ? format(new Date(article.created_at), 'MMMM d, yyyy')
              : 'No date'}
          </div>
          {article.reading_time && (
            <>
              <span className="text-zinc-500">•</span>
              <span className="text-sm text-zinc-500">
                {article.reading_time} min read
              </span>
            </>
          )}
        </div>
        <h1 className="text-4xl font-serif mb-4">{article.title}</h1>
        {article.subtitle && (
          <h2 className="text-xl text-zinc-500 mb-4">{article.subtitle}</h2>
        )}
        {article.featured_image && (
          <div className="relative aspect-[2/1] mb-8">
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {article.content.map((block, index) => {
          switch (block.type) {
            case 'paragraph':
              return (
                <div
                  key={index}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                  className="mb-6"
                />
              );
            case 'image':
              return (
                <div key={index} className="relative aspect-[2/1] my-8">
                  <Image
                    src={block.content}
                    alt={block.metadata?.alt || ''}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              );
            case 'heading':
              return (
                <h2 key={index} className="text-2xl font-serif mb-4">
                  {block.content}
                </h2>
              );
            case 'quote':
              return (
                <blockquote key={index} className="italic border-l-4 pl-4 my-6">
                  {block.content}
                </blockquote>
              );
            case 'list':
              return block.metadata?.ordered ? (
                <ol key={index} className="list-decimal pl-6 my-6">
                  {block.content.split('\n').map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              ) : (
                <ul key={index} className="list-disc pl-6 my-6">
                  {block.content.split('\n').map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Meta */}
      {article.meta_keywords && article.meta_keywords.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-wrap gap-2">
            {article.meta_keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </article>
  );
} 