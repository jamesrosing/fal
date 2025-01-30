"use client"

import { motion } from "framer-motion"
import Image from "next/image"
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
          <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">Latest Articles</h2>
          <h3 className="mb-8 text-[clamp(1.5rem,3vw,2.5rem)] leading-none tracking-tight font-serif">
            Stay informed with Allure MD
          </h3>
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
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className={`object-cover ${index === 1 ? "object-[center_15%]" : "object-center"}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <time className="text-sm font-cerebri font-light text-gray-500">{item.date}</time>
                <h4 className="mb-4 text-2xl font-serif">{item.title}</h4>
                <div className="space-y-4">
                  <LearnMoreButton href="/articles" underline={false} className="font-cerebri font-light">
                    Read More
                  </LearnMoreButton>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-12 text-right">
            <LearnMoreButton href="/articles" className="font-cerebri font-light">
              View All Articles
            </LearnMoreButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

