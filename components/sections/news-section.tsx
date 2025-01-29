"use client"

import { motion } from "framer-motion"
import { LearnMoreButton } from "../ui/learn-more-button"

const news = [
  {
    date: "1/23/2025",
    title: "Allure MD Introduces Revolutionary New RF Microneedling Technology",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20oxygeneo%20facial%20procedure-ZQLNbwBjHKNSxmLHpiRZgHKb4X2zwm.webp",
  },
  {
    date: "1/16/2025",
    title: "Dr. Pearose Named Top Dermatologist in Newport Beach",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20dermatology%20headshot%201-gjRMjadCwzrB94HEchEd1TnD04XcMY.webp",
  },
  {
    date: "1/9/2025",
    title: "New Medical Spa Services Now Available at Allure MD",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20medical%20esthetician%20facial%20procedure-BTAqIz6QTH8au0JcLo6JerhGR2Fyqw.webp",
  },
]

export function NewsSection() {
  return (
    <section className="bg-[#f5f5f5] py-24 dark:bg-black">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="mb-12 text-4xl font-bold">Latest News</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-4 h-48 overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className={`h-full w-full object-cover ${index === 1 ? "object-[center_15%]" : "object-center"}`}
                  />
                </div>
                <time className="text-sm text-gray-500">{item.date}</time>
                <h3 className="mb-4 text-xl font-bold">{item.title}</h3>
                <LearnMoreButton href="/news" underline={false}>
                  Read More
                </LearnMoreButton>
              </motion.article>
            ))}
          </div>
          <div className="mt-12 text-right">
            <LearnMoreButton href="/blog">More Articles</LearnMoreButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

