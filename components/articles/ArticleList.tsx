'use client'

import { useState, useEffect } from 'react'
import { ArticleCard } from '@/components/ArticleCard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Article } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


export default function ArticleList({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchMoreArticles = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, content, snippet, category, image, created_at')
          .order('created_at', { ascending: false })
          .range(page * 10, (page + 1) * 10 - 1)
          .throwOnError()

        if (error) throw error

        if (data.length < 10) {
          setHasMore(false)
        }

        setArticles(prev => [...prev, ...(data as Article[])])
      } catch (error) {
        toast.error('Error loading more articles')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (page > 1) {
      fetchMoreArticles()
    }
  }, [page])

  if (!articles.length && !loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No articles found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        {loading && (
          <>
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </>
        )}
      </div>
      {hasMore && !loading && (
        <Button 
          onClick={() => setPage(prevPage => prevPage + 1)}
          className="w-full"
          variant="outline"
        >
          Load More
        </Button>
      )}
    </div>
  )
}