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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/lbp8vud.css" />
        {/* Remove or comment out eruda.js if not needed */}
        {/* <script src="/__replco/static/devtools/eruda/3.2.3/eruda.js"></script> */}
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

