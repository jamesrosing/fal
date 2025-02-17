"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { LearnMoreButton } from "../ui/learn-more-button"
import { articles } from "@/lib/articles"

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
            Latest Articles
          </h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
            Stay informed with Allure MD
          </h3>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative flex flex-col overflow-hidden border border-zinc-800 bg-black transition-colors duration-300 hover:border-zinc-700"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div className="flex-1">
                  <p className="text-sm font-cerebri text-zinc-400">
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <Link href={`/articles/${article.slug}`} className="mt-3 block">
                    <h3 className="text-xl font-serif text-white transition-colors duration-300 group-hover:text-zinc-300">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-base font-cerebri font-light text-zinc-400 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </Link>
                </div>
                <div className="mt-6">
                  <LearnMoreButton href={`/articles/${article.slug}`}>
                    Read Article
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

