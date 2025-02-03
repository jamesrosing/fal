"use client"

import { ArticleLayout } from "@/components/article-layout"
import { notFound } from "next/navigation"

// This would typically come from a CMS or API
const articles = {
  "new-emsculpt-location": {
    title: "New EMSCULPT Location in Newport Beach",
    excerpt: "Allure MD expands with dedicated EMSCULPT facility, offering the latest in body contouring technology.",
    content: `
      <p>We are thrilled to announce the opening of our new dedicated EMSCULPT facility in Newport Beach. This expansion represents our commitment to providing the most advanced body contouring solutions to our patients.</p>

      <h2>Revolutionary Technology</h2>
      <p>EMSCULPT is the first and only non-invasive body shaping procedure that simultaneously builds muscle and burns fat. This groundbreaking technology has revolutionized the field of body contouring, offering results that were previously only achievable through intensive workout regimens.</p>

      <h2>Why Newport Beach?</h2>
      <p>Our decision to open a dedicated facility in Newport Beach was driven by the growing demand for non-invasive body contouring solutions in Orange County. The new location features:</p>
      <ul>
        <li>Multiple EMSCULPT devices for reduced wait times</li>
        <li>Comfortable, private treatment rooms</li>
        <li>Expert staff trained specifically in EMSCULPT protocols</li>
        <li>Convenient location with ample parking</li>
      </ul>

      <h2>What to Expect</h2>
      <p>During an EMSCULPT session, you can expect:</p>
      <ul>
        <li>30-minute treatment sessions</li>
        <li>No downtime or recovery period</li>
        <li>Noticeable results after just 4 sessions</li>
        <li>Personalized treatment plans</li>
      </ul>

      <p>Visit our new facility to experience the future of body contouring. Contact us today to schedule your consultation and learn how EMSCULPT can help you achieve your aesthetic goals.</p>
    `,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/emsculpt-location.webp",
    category: "Latest News",
    date: "2024-03-15",
    readTime: "3 min read",
    tags: ["medical-spa", "body-contouring", "emsculpt", "newport-beach"]
  },
  "advanced-dermatology-services": {
    title: "Introducing Advanced Dermatology Services",
    excerpt: "Allure MD adds cutting-edge treatments to its dermatology department, expanding patient care options.",
    content: `
      <p>Allure MD is proud to announce the expansion of our dermatology department with the introduction of several cutting-edge treatments and technologies. This expansion reflects our commitment to providing comprehensive skincare solutions using the most advanced techniques available.</p>

      <h2>New Treatment Options</h2>
      <p>Our expanded services include:</p>
      <ul>
        <li>Advanced laser treatments for various skin conditions</li>
        <li>Innovative acne therapies</li>
        <li>Expanded medical dermatology services</li>
        <li>New cosmetic dermatology options</li>
      </ul>

      <h2>State-of-the-Art Technology</h2>
      <p>We have invested in the latest dermatological equipment to ensure optimal results for our patients. Our new technology includes:</p>
      <ul>
        <li>Next-generation laser systems</li>
        <li>Advanced diagnostic tools</li>
        <li>Cutting-edge treatment delivery systems</li>
      </ul>

      <p>Schedule a consultation today to learn how our expanded dermatology services can address your specific skincare needs.</p>
    `,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/articles/new-dermatology.webp",
    category: "Latest News",
    date: "2024-03-12",
    readTime: "4 min read",
    tags: ["dermatology", "skincare", "medical-treatments", "technology"]
  }
  // Add more articles as needed
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug as keyof typeof articles]
  
  if (!article) {
    notFound()
  }

  return (
    <ArticleLayout {...article} />
  )
} 