import { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: 'Articles - Allure MD',
  description: 'Latest news and updates from Allure MD',
}

export default function ArticlesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article className="border rounded-lg overflow-hidden shadow-lg">
          <div className="relative h-48">
            <Image 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/julia%20oxygeneo%20facial%20procedure-ZQLNbwBjHKNSxmLHpiRZgHKb4X2zwm.webp"
              alt="RF Microneedling"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">
              Allure MD Introduces Revolutionary New RF Microneedling Technology
            </h2>
            <p className="text-gray-600 mb-4">
              Experience the latest advancement in skin rejuvenation with our new state-of-the-art RF microneedling system.
            </p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>March 15, 2024</span>
              <span>4 min read</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
} 