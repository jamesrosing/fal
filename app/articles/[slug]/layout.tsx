import type { Metadata } from "next"
import { articles } from "@/lib/articles"

type Props = {
  params: { slug: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articles.find(article => article.slug === params.slug);

  if (!article) {
    return {
      title: 'Article Not Found - Allure MD',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: `${article.title} - Allure MD`,
    description: article.excerpt,
  };
}

export default function ArticleLayout({ children, params }: Props) {
  return <>{children}</>;
} 