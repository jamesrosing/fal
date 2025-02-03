"use client"

import { ArticleLayout } from "@/components/article-layout"
import { notFound } from "next/navigation"

// This would typically come from a CMS or API
const articles = {
  "new-rf-microneedling-technology": {
    title: "Allure MD Introduces Revolutionary New RF Microneedling Technology",
    excerpt: "Experience the latest advancement in skin rejuvenation with our new state-of-the-art RF microneedling system.",
    content: `
      <p>We are excited to announce the addition of our new, state-of-the-art RF microneedling system at Allure MD. This revolutionary technology combines the proven benefits of traditional microneedling with the power of radiofrequency energy to deliver unprecedented results in skin rejuvenation.</p>

      <h2>What Makes RF Microneedling Different?</h2>
      <p>Unlike traditional microneedling, our new system delivers precisely controlled RF energy deep into the dermis. This dual-action treatment triggers a more robust healing response, leading to:</p>
      <ul>
        <li>Enhanced collagen and elastin production</li>
        <li>Improved skin texture and tone</li>
        <li>Reduced appearance of scars and stretch marks</li>
        <li>More noticeable results with fewer treatments</li>
      </ul>

      <h2>The Science Behind the Technology</h2>
      <p>The system uses ultra-fine needles to create micro-channels in the skin while simultaneously delivering RF energy at precise depths. This combination stimulates the body's natural healing response while providing controlled thermal damage that accelerates collagen remodeling.</p>

      <h2>What to Expect During Treatment</h2>
      <p>Each treatment session typically takes 30-60 minutes, depending on the area being treated. Patients can expect:</p>
      <ul>
        <li>Minimal downtime</li>
        <li>Customizable treatment settings</li>
        <li>Consistent, predictable results</li>
        <li>Comfortable treatment experience with topical numbing</li>
      </ul>

      <p>Contact us today to schedule a consultation and learn how our new RF microneedling technology can help you achieve your skin rejuvenation goals.</p>
    `,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20oxygeneo%20facial%20procedure-ZQLNbwBjHKNSxmLHpiRZgHKb4X2zwm.webp",
    category: "Technology",
    date: "2024-03-15",
    readTime: "4 min read",
    tags: ["skincare", "technology", "treatments", "microneedling"]
  },
  "pearose-top-physician-assistant": {
    title: "Susan Pearose, PA-C Named Top Dermatology Physician Assistant in Newport Beach",
    excerpt: "Our own Susan Pearose, PA-C has been recognized as one of Orange County's leading dermatology physician assistants for her exceptional expertise and patient care.",
    content: `
      <p>We are proud to announce that Susan Pearose, PA-C has been recognized as one of Newport Beach's top dermatology physician assistants for 2024. This prestigious recognition comes from comprehensive patient satisfaction surveys, peer reviews, and demonstrated excellence in dermatological care across Orange County.</p>

      <h2>A Legacy of Excellence</h2>
      <p>Susan Pearose has been serving the Newport Beach community with distinction, bringing her expertise in medical and cosmetic dermatology to thousands of patients. Her commitment to excellence is reflected in:</p>
      <ul>
        <li>Advanced certifications and specialized training</li>
        <li>Expertise in cutting-edge treatments and technologies</li>
        <li>Outstanding patient satisfaction ratings</li>
        <li>Continued professional development and education</li>
      </ul>

      <h2>Specialized Expertise</h2>
      <p>As a Certified Physician Assistant specializing in dermatology, Susan is particularly known for her expertise in:</p>
      <ul>
        <li>Advanced skin cancer screenings and detection</li>
        <li>Non-invasive facial rejuvenation techniques</li>
        <li>Complex acne and rosacea management</li>
        <li>Customized skincare treatment plans</li>
      </ul>

      <h2>Patient-First Approach</h2>
      <p>What sets Susan apart is her dedication to personalized patient care. She takes time to understand each patient's unique concerns and develops customized treatment plans that address their specific needs while ensuring the highest standards of medical care.</p>

      <h2>Professional Background</h2>
      <p>Susan's credentials include:</p>
      <ul>
        <li>Certified Physician Assistant (PA-C)</li>
        <li>Specialized dermatology training and certification</li>
        <li>Extensive experience in medical and cosmetic dermatology</li>
        <li>Ongoing advanced training in latest dermatological procedures</li>
      </ul>

      <p>Schedule your consultation with Susan Pearose, PA-C today and experience the exceptional care that has earned her this prestigious recognition in the field of dermatology.</p>
    `,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20dermatology%20headshot%201-gjRMjadCwzrB94HEchEd1TnD04XcMY.webp",
    category: "Recognition",
    date: "2024-03-10",
    readTime: "5 min read",
    tags: ["dermatology", "awards", "medical-care", "newport-beach", "physician-assistant"]
  },
  "new-medical-spa-services": {
    title: "New Medical Spa Services Now Available",
    excerpt: "Discover our expanded range of medical spa treatments designed for total body rejuvenation.",
    content: `
      <p>Allure MD is thrilled to announce the expansion of our medical spa services. Our new treatment offerings combine luxury and clinical excellence to provide you with the most advanced aesthetic solutions available.</p>

      <h2>New Treatment Options</h2>
      <p>Our expanded service menu now includes:</p>
      <ul>
        <li>Advanced hydrafacials with customized boosters</li>
        <li>Medical-grade chemical peels</li>
        <li>Laser hair removal with the latest technology</li>
        <li>Body contouring and cellulite treatments</li>
        <li>LED light therapy</li>
      </ul>

      <h2>Customized Treatment Plans</h2>
      <p>Each treatment begins with a comprehensive consultation to create a personalized plan that addresses your specific concerns and goals. Our expert staff will guide you through:</p>
      <ul>
        <li>Skin analysis and assessment</li>
        <li>Treatment recommendations</li>
        <li>Expected outcomes and timeline</li>
        <li>Maintenance and care instructions</li>
      </ul>

      <h2>The Allure MD Difference</h2>
      <p>What sets our medical spa services apart:</p>
      <ul>
        <li>Medical-grade products and equipment</li>
        <li>Licensed and certified professionals</li>
        <li>Comfortable, luxury environment</li>
        <li>Comprehensive aftercare support</li>
      </ul>

      <p>Visit us to experience our new medical spa services and start your journey to renewed confidence and radiance.</p>
    `,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20medical%20esthetician%20facial%20procedure-BTAqIz6QTH8au0JcLo6JerhGR2Fyqw.webp",
    category: "Services",
    date: "2024-03-05",
    readTime: "6 min read",
    tags: ["medical-spa", "treatments", "skincare", "wellness"]
  }
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