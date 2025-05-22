'use client'

import { useState, useEffect } from 'react'
import { ArticleCard } from './ArticleCard'
import { Button } from '@/components/shared/ui/button'
import { Article } from '@/lib/types'
import { Skeleton } from '@/components/shared/ui/skeleton'

export default function ArticleList({ initialArticles }: { initialArticles: Article[] }) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchMoreArticles = async () => {
      try {
        setLoading(true)
        // Replace with API route call instead of direct Supabase call
        const response = await fetch(`/api/articles?page=${page}&limit=10`)
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.message || 'Error loading articles')
        
        if (data.length < 10) {
          setHasMore(false)
        }

        setArticles(prev => [...prev, ...data])
      } catch (error) {
        console.error('Error:', error)
        // Handle error gracefully without toast
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