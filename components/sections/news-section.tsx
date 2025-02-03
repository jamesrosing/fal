"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { LearnMoreButton } from "../ui/learn-more-button"

const articles = [
  {
    title: "Allure MD Introduces Revolutionary New RF Microneedling Technology",
    excerpt: "Experience the latest advancement in skin rejuvenation with our new state-of-the-art RF microneedling system.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20oxygeneo%20facial%20procedure-ZQLNbwBjHKNSxmLHpiRZgHKb4X2zwm.webp",
    date: "2024-03-15",
    slug: "new-rf-microneedling-technology"
  },
  {
    title: "Susan Pearose, PA-C Named Top Dermatology Physician Assistant in Newport Beach",
    excerpt: "Our own Susan Pearose, PA-C has been recognized as one of Orange County's leading dermatology physician assistants for her exceptional expertise and patient care.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20dermatology%20headshot%201-gjRMjadCwzrB94HEchEd1TnD04XcMY.webp",
    date: "2024-03-10",
    slug: "pearose-top-physician-assistant"
  },
  {
    title: "New Medical Spa Services Now Available",
    excerpt: "Discover our expanded range of medical spa treatments designed for total body rejuvenation.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20medical%20esthetician%20facial%20procedure-BTAqIz6QTH8au0JcLo6JerhGR2Fyqw.webp",
    date: "2024-03-05",
    slug: "new-medical-spa-services"
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
            Latest Articles
          </h2>
          <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
            Stay informed with Allure MD
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
              className="group relative flex flex-col overflow-hidden border border-zinc-800 bg-black transition-colors duration-300 hover:border-zinc-700 h-[600px]"
            >
              <div className="relative h-[400px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
                    article.slug === 'dr-pearose-top-dermatologist' ? 'object-top' : 'object-center'
                  }`}
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

