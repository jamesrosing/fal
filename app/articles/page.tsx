import { NavBar } from "@/components/nav-bar"
import { PageHero } from "@/components/ui/page-hero"
import { Metadata } from "next"
import { ArticlesList } from "./articles-list"
import { CldOgImage } from "next-cloudinary"

export const metadata: Metadata = {
  title: 'Articles & Resources | Allure MD',
  description: 'Stay informed with the latest news, educational content, and resources about aesthetic procedures, dermatology, medical spa treatments, and functional medicine.',
  openGraph: {
    title: 'Articles & Resources | Allure MD',
    description: 'Stay informed with the latest news, educational content, and resources about aesthetic procedures, dermatology, medical spa treatments, and functional medicine.',
    images: [
      {
        url: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/f_auto,q_auto/hero/hero-articles',
        width: 1200,
        height: 630,
        alt: 'Articles & Resources'
      }
    ]
  }
}

export default async function ArticlesPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <NavBar />
      
      <PageHero
        title="Articles & Resources"
        subtitle="Stay informed and educated"
        description="Discover the latest news, educational content, and resources about aesthetic procedures, dermatology treatments, and wellness."
        image={{
          path: "hero/hero-articles",
          alt: "Articles and Resources"
        }}
      />

      <section className="py-16 md:py-24 bg-zinc-900 text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Articles</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto">Filter by category to find exactly what you're looking for</p>
          </div>
          <ArticlesList searchParams={searchParams} />
        </div>
      </section>
    </main>
  )
}