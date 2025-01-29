import localFont from "next/font/local"

export const aeonFont = localFont({
  src: [
    {
      path: "../public/fonts/aeon-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/aeon-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-aeon",
})

