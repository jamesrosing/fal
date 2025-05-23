import { Metadata } from 'next'
import { getCloudinaryUrl } from '@/lib/cloudinary'

interface SEOProps {
  title: string;
  description: string;
  image?: {
    path: string;
    alt: string;
  };
  noIndex?: boolean;
}

const defaultSEO = {
  siteName: 'Advanced Aesthetic Medicine',
  description: 'Experience the perfect blend of artistry and medical expertise in aesthetic and wellness services.',
  url: 'https://www.alluremd.com', // Replace with your actual domain
}

export function generateMetadata({
  title,
  description,
  image,
  noIndex = false,
}: SEOProps): Metadata {
  const displayTitle = `${title} | ${defaultSEO.siteName}`
  
  const ogImage = image ? getCloudinaryUrl(image.path, {
    width: 1200,
    height: 630,
    crop: 'fill',
    gravity: 'auto',
    quality: 90
  }) : getCloudinaryUrl('default-og-image', {
    width: 1200,
    height: 630,
    crop: 'fill',
    gravity: 'auto',
    quality: 90
  })

  return {
    title: displayTitle,
    description,
    metadataBase: new URL(defaultSEO.url),
    openGraph: {
      title: displayTitle,
      description,
      siteName: defaultSEO.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: image?.alt || defaultSEO.siteName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    alternates: {
      canonical: defaultSEO.url,
    },
  }
}

// Helper function for generating structured data
export function generateStructuredData(type: string, data: any) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return baseStructuredData;
}