import { Metadata } from "next"
import type { ReactNode } from "react"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


export const metadata: Metadata = {
  title: 'Articles - Allure MD',
  description: 'Latest news and updates from Allure MD',
}

export default function ArticlesLayout({ children }: { children: ReactNode }) {
  return children;
} 