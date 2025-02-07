import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { NavBar } from "@/components/nav-bar"

interface Article {
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  tags: string[];
}

// This would typically come from a CMS or API
const articles: Record<string, Article> = {
  "new-rf-microneedling-technology": {
    title: "Allure MD Introduces Revolutionary New RF Microneedling Technology",
    subtitle: "A breakthrough in skin rejuvenation technology that combines traditional microneedling with radiofrequency energy for enhanced results.",
    excerpt: "Experience the latest advancement in skin rejuvenation with our new state-of-the-art RF microneedling system.",
    content: `
      <div class="article-section">
        <p class="article-lead">We are excited to announce the addition of our new, state-of-the-art RF microneedling system at Allure MD. This revolutionary technology combines the proven benefits of traditional microneedling with the power of radiofrequency energy to deliver unprecedented results in skin rejuvenation.</p>
      </div>

      <div class="article-section">
        <h2>What Makes RF Microneedling Different?</h2>
        <p>Unlike traditional microneedling, our new system delivers precisely controlled RF energy deep into the dermis. This dual-action treatment triggers a more robust healing response, leading to:</p>
        <ul>
          <li>Enhanced collagen and elastin production</li>
          <li>Improved skin texture and tone</li>
          <li>Reduced appearance of scars and stretch marks</li>
          <li>More noticeable results with fewer treatments</li>
        </ul>
      </div>

      <div class="article-section">
        <h2>The Science Behind the Technology</h2>
        <p>The system uses ultra-fine needles to create micro-channels in the skin while simultaneously delivering RF energy at precise depths. This combination stimulates the body's natural healing response while providing controlled thermal damage that accelerates collagen remodeling.</p>
      </div>

      <div class="article-section">
        <h2>What to Expect During Treatment</h2>
        <p>Each treatment session typically takes 30-60 minutes, depending on the area being treated. Patients can expect:</p>
        <ul>
          <li>Minimal downtime</li>
          <li>Customizable treatment settings</li>
          <li>Consistent, predictable results</li>
          <li>Comfortable treatment experience with topical numbing</li>
        </ul>
      </div>

      <div class="article-section">
        <p class="article-cta">Contact us today to schedule a consultation and learn how our new RF microneedling technology can help you achieve your skin rejuvenation goals.</p>
      </div>
    `,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20oxygeneo%20facial%20procedure-ZQLNbwBjHKNSxmLHpiRZgHKb4X2zwm.webp",
    category: "latest-news",
    date: "2024-03-15",
    readTime: "4 min read",
    tags: ["skincare", "technology", "treatments", "microneedling"]
  },
  "pearose-top-physician-assistant": {
    title: "Susan Pearose, PA-C Named Top Dermatology Physician Assistant in Newport Beach",
    subtitle: "Recognized for exceptional expertise and dedication to patient care in dermatology across Orange County.",
    excerpt: "Our own Susan Pearose, PA-C has been recognized as one of Orange County's leading dermatology physician assistants for her exceptional expertise and patient care.",
    content: `
      <div class="article-section">
        <p class="article-lead">We are proud to announce that Susan Pearose, PA-C has been recognized as one of Newport Beach's top dermatology physician assistants for 2024. This prestigious recognition comes from comprehensive patient satisfaction surveys, peer reviews, and demonstrated excellence in dermatological care across Orange County.</p>
      </div>

      <div class="article-section">
        <h2>A Legacy of Excellence</h2>
        <p>Susan Pearose has been serving the Newport Beach community with distinction, bringing her expertise in medical and cosmetic dermatology to thousands of patients. Her commitment to excellence is reflected in:</p>
        <ul>
          <li>Advanced certifications and specialized training</li>
          <li>Expertise in cutting-edge treatments and technologies</li>
          <li>Outstanding patient satisfaction ratings</li>
          <li>Continued professional development and education</li>
        </ul>
      </div>

      <div class="article-section">
        <h2>Specialized Expertise</h2>
        <p>As a Certified Physician Assistant specializing in dermatology, Susan is particularly known for her expertise in:</p>
        <ul>
          <li>Advanced skin cancer screenings and detection</li>
          <li>Non-invasive facial rejuvenation techniques</li>
          <li>Complex acne and rosacea management</li>
          <li>Customized skincare treatment plans</li>
        </ul>
      </div>

      <div class="article-section">
        <h2>Patient-First Approach</h2>
        <p>What sets Susan apart is her dedication to personalized patient care. She takes time to understand each patient's unique concerns and develops customized treatment plans that address their specific needs while ensuring the highest standards of medical care.</p>
      </div>

      <div class="article-section">
        <h2>Professional Background</h2>
        <p>Susan's credentials include:</p>
        <ul>
          <li>Certified Physician Assistant (PA-C)</li>
          <li>Specialized dermatology training and certification</li>
          <li>Extensive experience in medical and cosmetic dermatology</li>
          <li>Ongoing advanced training in latest dermatological procedures</li>
        </ul>
      </div>

      <div class="article-section">
        <p class="article-cta">Schedule your consultation with Susan Pearose, PA-C today and experience the exceptional care that has earned her this prestigious recognition in the field of dermatology.</p>
      </div>
    `,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/susan%20pearose%20dermatology%20headshot%201-gjRMjadCwzrB94HEchEd1TnD04XcMY.webp",
    category: "latest-news",
    date: "2024-03-10",
    readTime: "5 min read",
    tags: ["dermatology", "awards", "medical-care", "newport-beach", "physician-assistant"]
  },
  "new-medical-spa-services": {
    title: "New Medical Spa Services Now Available",
    subtitle: "Expanding our luxury medical spa offerings with advanced treatments for comprehensive body rejuvenation.",
    excerpt: "Discover our expanded range of medical spa treatments designed for total body rejuvenation.",
    content: `
      <div class="article-section">
        <p class="article-lead">Allure MD is thrilled to announce the expansion of our medical spa services. Our new treatment offerings combine luxury and clinical excellence to provide you with the most advanced aesthetic solutions available.</p>
      </div>

      <div class="article-section">
        <h2>New Treatment Options</h2>
        <p>Our expanded service menu now includes:</p>
        <ul>
          <li>Advanced hydrafacials with customized boosters</li>
          <li>Medical-grade chemical peels</li>
          <li>Laser hair removal with the latest technology</li>
          <li>Body contouring and cellulite treatments</li>
          <li>LED light therapy</li>
        </ul>
      </div>

      <div class="article-section">
        <h2>Customized Treatment Plans</h2>
        <p>Each treatment begins with a comprehensive consultation to create a personalized plan that addresses your specific concerns and goals. Our expert staff will guide you through:</p>
        <ul>
          <li>Skin analysis and assessment</li>
          <li>Treatment recommendations</li>
          <li>Expected outcomes and timeline</li>
          <li>Maintenance and care instructions</li>
        </ul>
      </div>

      <div class="article-section">
        <h2>The Allure MD Difference</h2>
        <p>What sets our medical spa services apart:</p>
        <ul>
          <li>Medical-grade products and equipment</li>
          <li>Licensed and certified professionals</li>
          <li>Comfortable, luxury environment</li>
          <li>Comprehensive aftercare support</li>
        </ul>
      </div>

      <div class="article-section">
        <p class="article-cta">Visit us to experience our new medical spa services and start your journey to renewed confidence and radiance.</p>
      </div>
    `,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20medical%20esthetician%20facial%20procedure-BTAqIz6QTH8au0JcLo6JerhGR2Fyqw.webp",
    category: "latest-news",
    date: "2024-03-05",
    readTime: "6 min read",
    tags: ["medical-spa", "treatments", "skincare", "wellness"]
  }
};

type Props = {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { params } = props;
  const resolvedParams = await params;
  const article = articles[resolvedParams.slug as keyof typeof articles];

  if (!article) {
    return {
      title: 'Article Not Found - Allure MD',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: `${article.title} - Allure MD`,
    description: article.excerpt,
  };
}

export default async function ArticlePage(props: Props) {
  const { params } = props;
  const resolvedParams = await params;
  const article = articles[resolvedParams.slug as keyof typeof articles];
  
  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      <article>
        {/* Hero Image */}
        <div className="relative w-full h-[70vh]">
          <Image 
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {/* Article Header */}
        <header className="container mx-auto px-4 py-16 border-b border-white/10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-gray-400">
              {article.category}
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif text-white mb-6">
              {article.title}
            </h1>
            <p className="text-xl font-cerebri font-light text-gray-300 mb-8 max-w-3xl">
              {article.subtitle}
            </p>
            <div className="flex items-center gap-4 text-gray-400 font-cerebri">
              <time>{article.date}</time>
              <span>{article.readTime}</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div 
              className="prose prose-invert max-w-none 
                prose-headings:font-serif prose-headings:tracking-tight prose-headings:leading-tight
                prose-h2:text-[clamp(3rem,6vw,4.5rem)] prose-h2:mt-16 prose-h2:mb-8
                prose-h3:text-[clamp(1.5rem,3vw,2rem)] prose-h3:mt-12 prose-h3:mb-4
                prose-p:font-cerebri prose-p:font-light prose-p:text-base prose-p:leading-relaxed prose-p:text-gray-300 prose-p:mb-6
                prose-ul:font-cerebri prose-ul:font-light prose-ul:text-base prose-ul:mt-4 prose-ul:mb-8 prose-ul:list-none
                prose-li:my-1.5 prose-li:pl-0 prose-li:text-gray-300
                [&_.article-section]:mb-16
                [&_.article-lead]:text-base [&_.article-lead]:font-cerebri [&_.article-lead]:font-light [&_.article-lead]:leading-relaxed [&_.article-lead]:text-gray-300
                [&_.article-cta]:text-base [&_.article-cta]:font-cerebri [&_.article-cta]:font-normal [&_.article-cta]:text-white" 
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />

            {/* Article Tags */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <h3 className="text-md font-cerebri font-normal uppercase tracking-wide text-gray-400 mb-4">
                Related Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 text-sm font-cerebri font-light text-gray-400 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
} 