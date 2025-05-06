/**
 * Schema.org utility functions for generating structured data
 */

/**
 * Generates structured data for a medical procedure
 */
export function generateProcedureSchema(procedure: any, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: procedure.title,
    description: procedure.description || procedure.summary,
    url: url,
    image: procedure.featuredImage,
    performedBy: {
      '@type': 'Physician',
      name: 'Dr. James Rosing, MD, FACS',
      url: 'https://allure-md.com/about',
      medicalSpecialty: {
        '@type': 'MedicalSpecialty',
        name: 'Plastic Surgery'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * Generates structured data for a physician
 */
export function generateDoctorSchema(doctor: any = null) {
  // Default doctor data if not provided
  const doctorData = doctor || {
    name: 'Dr. James Rosing',
    credentials: 'MD, FACS',
    title: 'Board Certified Plastic Surgeon',
    description: 'Board Certified Plastic Surgeon specializing in cosmetic and reconstructive procedures in Newport Beach, CA.',
    slug: 'dr-james-rosing',
    image: '/images/team/headshots/dr-rosing.jpg'
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: doctorData.name,
    honorificPrefix: 'Dr.',
    honorificSuffix: doctorData.credentials,
    jobTitle: doctorData.title,
    description: doctorData.description,
    url: `https://allure-md.com/team/${doctorData.slug}`,
    image: doctorData.image,
    telephone: '+1-949-706-7874',
    email: 'office@allure-md.com',
    workLocation: {
      '@type': 'MedicalClinic',
      name: 'Allure MD Plastic Surgery + Dermatology',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1441 Avocado Ave Suite 708',
        addressLocality: 'Newport Beach',
        addressRegion: 'CA',
        postalCode: '92660',
        addressCountry: 'US',
      }
    },
    medicalSpecialty: {
      '@type': 'MedicalSpecialty',
      name: 'Plastic Surgery'
    }
  };
}

/**
 * Generates structured data for a blog article
 */
export function generateArticleSchema(article: any, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary || article.description,
    image: article.featuredImage,
    author: {
      '@type': 'Person',
      name: article.author?.name || 'Allure MD Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Allure MD Plastic Surgery & Dermatology',
      logo: {
        '@type': 'ImageObject',
        url: 'https://allure-md.com/logo.png'
      }
    },
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * Generates structured data for a FAQPage
 */
export function generateFAQSchema(faqs: Array<{question: string, answer: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

/**
 * Generates LocalBusiness structured data for the practice
 */
export function generatePracticeSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Allure MD Plastic Surgery + Dermatology',
    url: 'https://allure-md.com',
    logo: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/v1743748610/branding/logo',
    description: 'Advanced aesthetic medicine and plastic surgery by Dr. James Rosing, MD, FACS in Newport Beach.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Main Street',
      addressLocality: 'Newport Beach',
      addressRegion: 'CA',
      postalCode: '92660',
      addressCountry: 'US'
    },
    telephone: '+1-949-123-4567',
    email: 'info@allure-md.com',
    openingHours: 'Mo,Tu,We,Th,Fr 09:00-17:00',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.6189,
      longitude: -117.9298
    },
    medicalSpecialty: [
      'PlasticSurgery',
      'Dermatology'
    ],
    priceRange: '$$$',
    sameAs: [
      'https://www.facebook.com/alluremd',
      'https://www.instagram.com/alluremd',
      'https://twitter.com/alluremd'
    ]
  };
}

import { CldImageProps } from 'next-cloudinary';

export function generateImageSchema(image: {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
  const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${image.publicId}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": imageUrl,
    "name": image.alt,
    "description": image.alt,
    "width": image.width || 800,
    "height": image.height || 600
  };
}

/**
 * Generates structured data for a video
 */
export function generateVideoSchema(video: {
  publicId: string;
  title: string;
  description?: string;
  width?: number;
  height?: number;
  duration?: number;
  thumbnailUrl?: string;
  uploadDate?: string;
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w';
  const videoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${video.publicId}`;
  const thumbnailUrl = video.thumbnailUrl || 
    `https://res.cloudinary.com/${cloudName}/video/upload/so_auto,w_800,h_450,c_fill,g_auto,q_auto,f_auto/${video.publicId}.jpg`;
  
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description || video.title,
    "contentUrl": videoUrl,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": video.uploadDate || new Date().toISOString(),
    "width": video.width || 1280,
    "height": video.height || 720,
    "duration": video.duration ? `PT${Math.floor(video.duration / 60)}M${Math.floor(video.duration % 60)}S` : undefined
  };
} 