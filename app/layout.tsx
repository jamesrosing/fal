import { ThemeProvider } from "next-themes"
import "./globals.css"
import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { ChatBubble } from '@/components/ui/chat-bubble'
import { ToasterProvider } from "@/providers/toaster-provider"
import Script from "next/script"
import { Analytics } from '@vercel/analytics/react'
import { generatePracticeSchema, generateDoctorSchema } from "@/lib/schema"

export const metadata: Metadata = {
  metadataBase: new URL('https://allure-md.com'),
  title: "Allure MD Plastic Surgery + Dermatology | Newport Beach",
  description:
    "Experience advanced aesthetic medicine and plastic surgery by Dr. James Rosing, MD, FACS at Allure MD in Newport Beach. Board certified plastic surgeon.",
  keywords: "plastic surgery, Newport Beach, Dr. James Rosing, dermatology, medical spa, breast augmentation, facelift, rhinoplasty, Newport Beach plastic surgeon",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://allure-md.com',
    title: 'Allure MD Plastic Surgery + Dermatology | Newport Beach',
    description: 'Advanced aesthetic medicine and plastic surgery by Dr. James Rosing, MD, FACS in Newport Beach.',
    siteName: 'Allure MD',
    images: [
      {
        url: 'https://res.cloudinary.com/dyrzyfg3w/image/upload/v1743748610/hero/hero-poster',
        width: 1200,
        height: 630,
        alt: 'Allure MD Plastic Surgery + Dermatology'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allure MD Plastic Surgery + Dermatology | Newport Beach',
    description: 'Advanced aesthetic medicine and plastic surgery by Dr. James Rosing, MD, FACS in Newport Beach.',
    images: ['https://res.cloudinary.com/dyrzyfg3w/image/upload/v1743748610/hero/hero-poster']
  },
  alternates: {
    canonical: 'https://allure-md.com'
  },
  icons: [
    {
      url: "/favicon.ico",
      rel: "icon",
      type: "image/png",
      sizes: "180x180",
    },
  ],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: 'dark',
}

// Generate Schema.org structured data
const practiceSchema = generatePracticeSchema();
const doctorSchema = generateDoctorSchema();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/lbp8vud.css" />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(practiceSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(doctorSchema)
          }}
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ToasterProvider />
          {children}
          <Footer />
          <ChatBubble />
          <Analytics />
          
          {/* Google Tag Manager - using the existing setup */}
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-XXXXXXX');
              `,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

