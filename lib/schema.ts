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
    name: 'Allure MD Plastic Surgery & Dermatology',
    url: 'https://allure-md.com',
    logo: 'https://allure-md.com/logo.png',
    telephone: '+1-949-706-7874',
    email: 'office@allure-md.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1441 Avocado Ave Suite 708',
      addressLocality: 'Newport Beach',
      addressRegion: 'CA',
      postalCode: '92660',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.6137574,
      longitude: -117.8695081,
    },
    priceRange: '$$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
    ],
    medicalSpecialty: [
      {
        '@type': 'MedicalSpecialty',
        name: 'Plastic Surgery'
      },
      {
        '@type': 'MedicalSpecialty',
        name: 'Dermatology'
      }
    ],
    sameAs: [
      'https://www.facebook.com/alluremdplasticsurgery',
      'https://www.instagram.com/alluremdplasticsurgery',
      'https://www.youtube.com/channel/alluremdplasticsurgery'
    ]
  };
} 