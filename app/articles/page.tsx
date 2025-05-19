import { NavBar } from "@/components/nav-bar"
import { Metadata } from "next"
import { ArticlesList } from "./articles-list"
import { CldOgImage } from "next-cloudinary"
import { mediaId, mediaUrl, getMediaUrl } from "@/lib/media"
import { ArticlesHero } from "./hero"

export const metadata: Metadata = {
  title: 'Articles & Resources | Allure MD',
  description: 'Stay informed with the latest news, educational content, and resources about aesthetic procedures, dermatology, medical spa treatments, and functional medicine.',
  openGraph: {
    title: 'Articles & Resources | Allure MD',
    description: 'Stay informed with the latest news, educational content, and resources about aesthetic procedures, dermatology, medical spa treatments, and functional medicine.',
    images: [
      {
        url: mediaId("f_auto,q_auto/hero/hero-articles"),
        width: 1200,
        height: 630,
        alt: 'Articles & Resources'
      }
    ]
  }
}

export default function ArticlesPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* Navigation bar */}
      <NavBar />
      
      {/* Hero section */}
      <ArticlesHero />

      {/* Articles list section */}
      <section className="py-12 md:py-16 bg-zinc-900 text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <ArticlesList searchParams={searchParams} />
        </div>
      </section>
    </main>
  )
}