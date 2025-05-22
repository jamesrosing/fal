import Head from 'next/head';

interface MetaTagsProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  author?: string;
  robots?: string;
}

/**
 * MetaTags component for SEO optimization
 * 
 * @param title - Page title (will be appended with site name)
 * @param description - Meta description
 * @param canonicalUrl - Canonical URL for the page
 * @param ogImage - Open Graph image URL
 * @param ogType - Open Graph type (default: website)
 * @param keywords - Meta keywords
 * @param author - Content author
 * @param robots - Robots directive
 */
export default function MetaTags({
  title,
  description,
  canonicalUrl,
  ogImage = '/images/global/allure-md-social-share.jpg',
  ogType = 'website',
  keywords,
  author = 'Allure MD Plastic Surgery & Dermatology',
  robots = 'index, follow',
}: MetaTagsProps) {
  const fullTitle = `${title} | Allure MD Plastic Surgery & Dermatology`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Standard meta tags */}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Allure MD" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
} 