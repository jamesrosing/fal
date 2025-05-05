interface SchemaOrgProps {
  procedureSchema?: any;
  doctorSchema?: any;
  articleSchema?: any;
  practiceSchema?: boolean;
}

export default function SchemaOrg({ 
  procedureSchema = null,
  doctorSchema = null,
  articleSchema = null,
  practiceSchema = true,
}: SchemaOrgProps) {
  const schemas = [];
  
  // Add practice schema by default
  if (practiceSchema) {
    schemas.push(generatePracticeSchema());
  }
  
  // Add additional schemas if provided
  if (procedureSchema) {
    schemas.push(procedureSchema);
  }
  
  if (doctorSchema) {
    schemas.push(doctorSchema);
  }
  
  if (articleSchema) {
    schemas.push(articleSchema);
  }
  
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={`schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

function generatePracticeSchema() {
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