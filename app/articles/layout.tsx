import { Metadata } from "next"
import type { ReactNode } from "react"
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


export const metadata: Metadata = {
  title: 'Articles - Allure MD',
  description: 'Latest news and updates from Allure MD',
}

export default function ArticlesLayout({ children }: { children: ReactNode }) {
  return children;
} 