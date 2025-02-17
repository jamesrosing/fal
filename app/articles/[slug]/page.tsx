"use client"

import { notFound } from "next/navigation"
import { articles } from "@/lib/articles"
import { ArticleLayout } from "@/components/article-layout"
import { use } from "react"

type Props = {
  params: Promise<{ slug: string }>
}

export default function ArticlePage({ params }: Props) {
  const resolvedParams = use(params);
  const article = articles.find(article => article.slug === resolvedParams.slug);
  
  if (!article) {
    notFound();
  }

  return <ArticleLayout article={article} />;
} 