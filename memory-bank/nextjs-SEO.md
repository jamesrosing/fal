# Next.js Implementation Guide for Allure MD

## Technical Architecture for Maximum Performance

The foundation of your plastic surgery practice's online success will be built on a well-architected Next.js website. This guide provides detailed technical specifications and implementation steps to ensure your website is optimized for both search engines and user experience.

## 1. Project Setup & Configuration

### Initial Setup
```bash
# Create a new Next.js project with TypeScript
npx create-next-app@latest allure-md --typescript

# Navigate to project directory
cd allure-md

# Install essential dependencies
npm install sass axios framer-motion react-hook-form yup @hookform/resolvers
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Next.js Configuration
Create an optimized `next.config.js` file:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-cdn.com', 'your-storage-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## 2. Rendering Strategy

For a plastic surgery website, we'll implement a hybrid rendering approach:

### Static Generation (SSG)
Use for core pages that don't change frequently:
- Homepage
- About pages
- Core procedure pages
- Doctor profiles
- Contact information

```typescript
// pages/procedures/[slug].tsx
import { GetStaticProps, GetStaticPaths } from 'next';
import { getProcedure, getAllProcedureSlugs } from '../../lib/procedures';

export const getStaticPaths: GetStaticPaths = async () => {
  const procedures = await getAllProcedureSlugs();
  
  return {
    paths: procedures.map((procedure) => ({
      params: { slug: procedure.slug },
    })),
    fallback: false, // or 'blocking' for new procedures added later
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const procedureData = await getProcedure(params?.slug as string);
  
  return {
    props: {
      procedure: procedureData,
    },
    // Re-generate at most once per day
    revalidate: 86400,
  };
};
```

### Incremental Static Regeneration (ISR)
Use for content that updates periodically:
- Blog posts
- Testimonials
- Before/after galleries

```typescript
// pages/blog/[slug].tsx
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostData(params?.slug as string);
  
  return {
    props: {
      post: postData,
    },
    // Re-generate at most once per hour
    revalidate: 3600,
  };
};
```

### Server-Side Rendering (SSR)
Use for personalized or frequently changing content:
- Search results
- Filtered galleries
- Appointment availability

```typescript
// pages/search.tsx
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const searchResults = await performSearch(query.term as string);
  
  return {
    props: {
      results: searchResults,
      searchTerm: query.term || '',
    },
  };
};
```

## 3. Performance Optimization

### Image Optimization
Use Next.js Image component for all images:

```tsx
import Image from 'next/image';

// For procedure thumbnails
<div className="relative w-full h-64">
  <Image
    src={procedure.thumbnailUrl}
    alt={procedure.title}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="object-cover rounded-lg"
    priority={isPriority}
  />
</div>

// For before/after galleries
<div className="grid grid-cols-2 gap-4">
  <div className="relative aspect-square">
    <Image
      src={image.before}
      alt="Before procedure"
      fill
      className="object-cover"
      sizes="(max-width: 768px) 50vw, 33vw"
    />
  </div>
  <div className="relative aspect-square">
    <Image
      src={image.after}
      alt="After procedure"
      fill
      className="object-cover"
      sizes="(max-width: 768px) 50vw, 33vw"
    />
  </div>
</div>
```

### Font Optimization
Utilize Next.js built-in font optimization:

```tsx
// pages/_app.tsx
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export default function App({ Component, pageProps }) {
  return (
    <main className={`${inter.variable} ${playfair.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
```

### Code Splitting
Use dynamic imports for components not needed immediately:

```tsx
// Dynamic import for heavy components like video players or 3D visualizers
import dynamic from 'next/dynamic';

const BeforeAfterSlider = dynamic(
  () => import('../components/BeforeAfterSlider'),
  { 
    loading: () => <p>Loading slider...</p>,
    ssr: false, // If it depends on browser APIs
  }
);
```

## 4. SEO Implementation

### Metadata Component
Create a reusable SEO component:

```tsx
// components/SEO.tsx
import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  jsonLD?: any;
}

export default function SEO({
  title,
  description,
  canonicalUrl,
  ogImage = '/images/allure-md-social-share.jpg',
  ogType = 'website',
  jsonLD,
}: SEOProps) {
  const fullTitle = `${title} | Allure MD Plastic Surgery & Dermatology`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Structured Data */}
      {jsonLD && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
        />
      )}
    </Head>
  );
}
```

### Structured Data Implementation

```tsx
// Example for a procedure page
const procedureSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalProcedure',
  name: procedure.title,
  description: procedure.summary,
  medicalSpecialty: {
    '@type': 'MedicalSpecialty',
    name: 'Plastic Surgery',
  },
  performedBy: {
    '@type': 'Physician',
    name: 'Dr. [Your Name]',
    url: 'https://alluremd.com/doctors/your-name',
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://alluremd.com/procedures/${procedure.slug}`,
  },
};

// Usage in page component
<SEO
  title={`${procedure.title} in Newport Beach`}
  description={procedure.metaDescription}
  canonicalUrl={`https://alluremd.com/procedures/${procedure.slug}`}
  ogImage={procedure.featuredImage}
  ogType="article"
  jsonLD={procedureSchema}
/>
```

## 5. User Engagement Features

### Virtual Consultation Tool
Implement a multi-step form for virtual consultations:

```tsx
// components/VirtualConsultation/index.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import SuccessMessage from './SuccessMessage';

const schema = yup.object().shape({
  // Define your validation schema here
});

export default function VirtualConsultation() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Send data to your API
      await fetch('/api/virtual-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  if (isSuccess) {
    return <SuccessMessage />;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-playfair mb-6">Virtual Consultation</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <StepOne 
            register={register}
            errors={errors}
            nextStep={nextStep}
          />
        )}
        
        {step === 2 && (
          <StepTwo
            register={register}
            control={control}
            errors={errors}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )}
        
        {step === 3 && (
          <StepThree
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            prevStep={prevStep}
          />
        )}
      </form>
    </div>
  );
}
```

### Before & After Gallery
Create an interactive before/after comparison slider:

```tsx
// components/BeforeAfterSlider.tsx
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = 'Before procedure',
  afterAlt = 'After procedure',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(0, x), 100));
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(0, x), 100));
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square md:aspect-video overflow-hidden rounded-lg cursor-ew-resize"
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      <div className="absolute inset-0 z-10">
        <Image
          src={afterImage}
          alt={afterAlt}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
        />
      </div>
      
      <div 
        className="absolute inset-0 z-20 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
        />
      </div>
      
      <div
        className="absolute top-0 bottom-0 w-1 bg-white z-30 cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-primary rounded-full" />
        </div>
      </div>
    </div>
  );
}
```

### Procedure Cost Calculator
Implement an interactive cost estimator:

```tsx
// components/ProcedureCostCalculator.tsx
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

const procedureOptions = [
  { value: 'rhinoplasty', label: 'Rhinoplasty', basePrice: 8000 },
  { value: 'breast-augmentation', label: 'Breast Augmentation', basePrice: 7500 },
  { value: 'facelift', label: 'Facelift', basePrice: 12000 },
  // Add more procedures
];

const addonOptions = [
  { value: 'anesthesia', label: 'Anesthesia', price: 1000 },
  { value: 'facility-fee', label: 'Facility Fee', price: 1500 },
  { value: 'post-op-care', label: 'Post-Op Care Package', price: 500 },
  // Add more addons
];

export default function ProcedureCostCalculator() {
  const [totalCost, setTotalCost] = useState(0);
  
  const { control, watch, handleSubmit } = useForm({
    defaultValues: {
      procedure: '',
      addons: [],
    },
  });
  
  const selectedProcedure = watch('procedure');
  const selectedAddons = watch('addons');
  
  const calculateTotal = (data) => {
    const procedure = procedureOptions.find(p => p.value === data.procedure);
    let total = procedure ? procedure.basePrice : 0;
    
    data.addons.forEach(addon => {
      const addonOption = addonOptions.find(a => a.value === addon);
      if (addonOption) {
        total += addonOption.price;
      }
    });
    
    setTotalCost(total);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-playfair mb-4">Procedure Cost Estimator</h2>
      <p className="mb-6 text-gray-600">Get a general estimate for your procedure. Final costs may vary based on your specific needs.</p>
      
      <form onSubmit={handleSubmit(calculateTotal)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Procedure</label>
          <Controller
            name="procedure"
            control={control}
            render={({ field }) => (
              <select 
                {...field}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">Select a procedure</option>
                {procedureOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        
        {selectedProcedure && (
          <div>
            <label className="block text-sm font-medium mb-2">Additional Options</label>
            <Controller
              name="addons"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {addonOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={field.value.includes(option.value)}
                        onChange={(e) => {
                          const values = [...field.value];
                          if (e.target.checked) {
                            values.push(option.value);
                          } else {
                            const index = values.indexOf(option.value);
                            if (index > -1) {
                              values.splice(index, 1);
                            }
                          }
                          field.onChange(values);
                        }}
                        className="mr-2"
                      />
                      {option.label} (+${option.price.toLocaleString()})
                    </label>
                  ))}
                </div>
              )}
            />
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary-dark transition"
        >
          Calculate Estimate
        </button>
      </form>
      
      {totalCost > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-medium mb-2">Estimated Cost</h3>
          <p className="text-3xl font-bold text-primary">${totalCost.toLocaleString()}</p>
          <p className="mt-2 text-sm text-gray-600">
            This is an estimate only. Schedule a consultation for a personalized quote.
          </p>
          <button className="mt-4 w-full bg-secondary text-white py-2 rounded-md hover:bg-secondary-dark transition">
            Schedule Consultation
          </button>
        </div>
      )}
    </div>
  );
}
```

## 6. Data Architecture

### Content Model
Create a flexible content model for your procedures:

```typescript
// types/procedure.ts
export interface Procedure {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  description: string;
  featuredImage: string;
  thumbnailUrl: string;
  metaTitle: string;
  metaDescription: string;
  benefits: string[];
  faq: {
    question: string;
    answer: string;
  }[];
  beforeAfterGallery: {
    id: string;
    title: string;
    before: string;
    after: string;
    description?: string;
  }[];
  relatedProcedures: {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string;
  }[];
  doctors: {
    id: string;
    slug: string;
    name: string;
    title: string;
    photoUrl: string;
  }[];
  categories: string[];
  createdAt: string;
  updatedAt: string;
}
```

### API Routes
Implement secure API routes for form submissions:

```typescript
// pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message, procedure } = req.body;
    
    // Validate inputs
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Send email notification
    await sendEmail({
      to: 'contact@alluremd.com',
      subject: `New Contact Form Submission: ${procedure || 'General Inquiry'}`,
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Procedure: ${procedure || 'N/A'}
        Message: ${message}
      `,
    });
    
    // Store in database if needed
    
    return res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({ message: 'Error submitting form' });
  }
}
```

## 7. Analytics & Tracking

### Basic Analytics Setup
Set up Google Analytics 4 with Next.js:

```tsx
// pages/_app.tsx
import Script from 'next/script';

// Inside your App component
<>
  {/* Google Analytics */}
  <Script
    strategy="afterInteractive"
    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  />
  <Script
    id="google-analytics"
    strategy="afterInteractive"
    dangerouslySetInnerHTML={{
      __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
          page_path: window.location.pathname,
        });
      `,
    }}
  />
</>
```

### Event Tracking
Implement enhanced event tracking with a custom hook:

```tsx
// hooks/useAnalytics.ts
import { useRouter } from 'next/router';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: any
    ) => void;
  }
}

export default function useAnalytics() {
  const router = useRouter();
  
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID as string, {
          page_path: url,
        });
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  const trackEvent = (
    action: string,
    category: string,
    label: string,
    value?: number
  ) => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };
  
  return { trackEvent };
}
```

## 8. Deployment & Hosting

### CI/CD Pipeline
Set up a GitHub Actions workflow for continuous deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Build project
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_GA_ID: ${{ secrets.NEXT_PUBLIC_GA_ID }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Performance Monitoring
Set up real user monitoring with Vercel Analytics:

```tsx
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

## 9. Security & Compliance

### Content Security Policy
Implement a strict Content Security Policy:

```tsx
// pages/_document.tsx
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com;" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
```

### HIPAA Compliance Considerations
For contact forms that may collect medical information:

```tsx
// components/HIPAACompliantForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function HIPAACompliantForm() {
  const [submitted, setSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    // Use HTTPS to submit the form
    const response = await fetch('/api/secure-contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      setSubmitted(true);
    }
  };
  
  if (submitted) {
    return (
      <div className="p-6 bg-green-50 rounded-lg">
        <h3 className="text-xl font-medium text-green-800">Thank you for contacting us</h3>
        <p className="mt-2 text-green-700">
          Your message has been received securely. We'll respond as soon as possible.
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-blue-800">
          This form is secured with encryption and follows HIPAA guidelines. Your information is protected.
        </p>
      </div>
      
      {/* Form fields */}
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          {...register('name', { required: true })}
          className="w-full p-2 border rounded-md"
        />
        {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
      </div>
      
      {/* Additional fields */}
      
      <button
        type="submit"
        className="w-full bg-primary text-white py-2 rounded-md"
      >
        Submit Securely
      </button>
    </form>
  );
}
```

## 10. Mobile Optimization

### Responsive Design
Implement a mobile-first approach with Tailwind CSS:

```tsx
// components/ProcedureCard.tsx
export default function ProcedureCard({ procedure }) {
  return (
    <div className="group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-48 md:h-64 overflow-hidden">
        <Image
          src={procedure.thumbnailUrl}
          alt={procedure.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-4 md:p-6 bg-white">
        <h3 className="text-lg md:text-xl font-medium mb-2">
          {procedure.title}
        </h3>
        
        <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-3">
          {procedure.summary}
        </p>
        
        <Link
          href={`/procedures/${procedure.slug}`}
          className="inline-flex items-center text-primary font-medium"
        >
          Learn More
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
```

### Touch-Friendly Navigation
Create a mobile-friendly navigation menu:

```tsx
// components/MobileNav.tsx
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  
  // Close menu when route changes
  useEffect(() => {
    router.events.on('routeChangeComplete', closeMenu);
    return () => {
      router.events.off('routeChangeComplete', closeMenu);
    };
  }, [router.events]);
  
  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 focus:outline-none"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 bg-white shadow-lg z-50"
          >
            <nav className="py-4 px-6 space-y-4">
              <Link
                href="/"
                className={`block py-2 ${
                  router.pathname === '/' ? 'text-primary font-medium' : ''
                }`}
              >
                Home
              </Link>
              
              <Link
                href="/about"
                className={`block py-2 ${
                  router.pathname.startsWith('/about') ? 'text-primary font-medium' : ''
                }`}
              >
                About
              </Link>
              
              {/* More navigation links */}
              
              <Link
                href="/contact"
                className="block py-2 px-4 bg-primary text-white rounded-md text-center"
              >
                Contact Us
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## Conclusion

This implementation guide provides a comprehensive foundation for building a high-performance Next.js website for Allure MD Plastic Surgery and Dermatology. By following these technical specifications and best practices, you'll create a website that not only ranks well in search engines but also provides an exceptional user experience that converts visitors into patients.

Remember that the key to success is implementing these techniques with your specific practice's needs and strengths in mind. Customize the code examples and strategies to highlight what makes Allure MD unique in the Newport Beach market.
