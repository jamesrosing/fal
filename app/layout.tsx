import { ThemeProvider } from "next-themes"
import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Allure MD | Advanced Aesthetic Medicine in Newport Beach",
  description:
    "Experience the perfect blend of science and beauty at Allure MD. Offering dermatology, medical spa treatments, and plastic surgery in Newport Beach.",
  icons: [
    {
      url: "/favicon.ico",
      rel: "icon",
      type: "image/png",
      sizes: "180x180",
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/1bp8vud.css" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

