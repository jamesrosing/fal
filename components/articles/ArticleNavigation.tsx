'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Article } from '@/lib/types'
import { fetchAdjacentArticles } from '@/lib/api'
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


export default function ArticleNavigation({ currentArticleId }: { currentArticleId: number }) {
  const [prevArticle, setPrevArticle] = useState<Article | null>(null)
  const [nextArticle, setNextArticle] = useState<Article | null>(null)

  useEffect(() => {
    const fetchArticles = async () => {
      const { prev, next } = await fetchAdjacentArticles(currentArticleId)
      setPrevArticle(prev)
      setNextArticle(next)
    }

    fetchArticles()
  }, [currentArticleId])

  return (
    <div className="flex justify-between mt-8">
      {prevArticle && (
        <Link href={`/article/${prevArticle.id}`} className="text-indigo-600 hover:text-indigo-800">
          ← {prevArticle.title}
        </Link>
      )}
      {nextArticle && (
        <Link href={`/article/${nextArticle.id}`} className="text-indigo-600 hover:text-indigo-800">
          {nextArticle.title} →
        </Link>
      )}
    </div>
  )
}
