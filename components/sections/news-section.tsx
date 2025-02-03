"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { LearnMoreButton } from "../ui/learn-more-button"

const articles = [
  {
    title: "New EMSCULPT Location in Newport Beach",
    excerpt: "Allure MD expands with dedicated EMSCULPT facility, offering the latest in body contouring technology.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/emsculpt-location.webp",
    date: "2024-03-15",
    slug: "new-emsculpt-location"
  },
  {
    title: "Introducing Advanced Dermatology Services",
    excerpt: "Allure MD adds cutting-edge treatments to its dermatology department, expanding patient care options.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/new-dermatology.webp",
    date: "2024-03-12",
    slug: "advanced-dermatology-services"
  }
]

export function NewsSection() {
  return (
    <section className="relative py-24 bg-[#f5f5f5] dark:bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
            Latest News
          </h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
            Stay informed about our latest developments
          </h3>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {articles.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative flex flex-col overflow-hidden rounded-lg bg-black"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="flex-1">
                  <p className="text-sm font-cerebri text-gray-400">
                    {new Date(article.date).toLocaleDateString()}
                  </p>
                  <Link href={`/articles/${article.slug}`} className="mt-2 block">
                    <h3 className="text-xl font-serif text-white transition-colors duration-300 group-hover:text-gray-300">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-base font-cerebri font-light text-gray-400">
                      {article.excerpt}
                    </p>
                  </Link>
                </div>
                <div className="mt-6">
                  <LearnMoreButton href={`/articles/${article.slug}`}>
                    Read More
                  </LearnMoreButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <LearnMoreButton href="/articles">View All Articles</LearnMoreButton>
        </div>
      </div>
    </section>
  )
}

