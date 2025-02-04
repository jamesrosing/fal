
import { Metadata } from "next"

// Article data (would typically come from a CMS or API)
const article = {
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
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default function ArticlePage() {
  return (
    <article className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      <div className="flex items-center gap-4 text-gray-600 mb-8">
        <time>{article.date}</time>
        <span>{article.readTime}</span>
      </div>
      <img 
        src={article.image}
        alt={article.title}
        className="w-full h-64 object-cover rounded-lg mb-8"
      />
      <div className="prose max-w-none">
        {article.content}
      </div>
    </article>
  );
} 