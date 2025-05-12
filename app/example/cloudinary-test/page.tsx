'use client'

import { CldImage } from 'next-cloudinary'
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'

export default function CloudinaryTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Cloudinary Standard Implementation Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Image Test */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">1. Basic Image</h2>
          <CldImage
            src="emsculpt/hero-image"
            width={400}
            height={300}
            alt="Emsculpt Hero Image"
            sizes="100vw"
            preserveTransformations
            loading="lazy"
          />
          <p className="mt-2 text-sm text-gray-600">Basic implementation with width/height</p>
        </div>
        
        {/* Responsive Image Test */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">2. Responsive Image</h2>
          <CldImage
            src="emsculpt/hero-image"
            width={600}
            height={400}
            alt="Responsive Emsculpt Hero"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <p className="mt-2 text-sm text-gray-600">Responsive image with sizes attribute</p>
        </div>
        
        {/* Transformed Image Test */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">3. Transformed Image</h2>
          <CldImage
            src="services/medical-spa/skin-lasers/hero"
            width={400}
            height={300}
            alt="Skin Lasers Hero with Transformations"
            crop="fill"
            gravity="auto"
            quality="auto"
            format="auto"
          />
          <p className="mt-2 text-sm text-gray-600">With transformations (crop, gravity, quality)</p>
        </div>
        
        {/* Video Test */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">4. Standard Video Player</h2>
          <CldVideoPlayer
            src="emsculpt/videos/hero/hero-720p-mp4"
            width="400"
            height="225"
            autoplay={false}
            muted={true}
            controls={true}
          />
          <p className="mt-2 text-sm text-gray-600">Standard CldVideoPlayer implementation</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Cloudinary Configuration</h2>
        <ul className="list-disc pl-6">
          <li><strong>Cloud Name:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not set'}</li>
          <li><strong>Upload Preset:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'Not set'}</li>
          <li><strong>API Key:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'Set ✅' : 'Not set ❌'}</li>
        </ul>
      </div>
      
      <div className="mt-8 p-6 rounded-lg shadow-md bg-amber-50">
        <h2 className="text-xl font-semibold mb-4">Implementation Notes</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Using standard <code>next-cloudinary</code> implementation</li>
          <li>Images are loaded directly from Cloudinary CDN</li>
          <li>Responsive images use the <code>sizes</code> attribute</li>
          <li>Quality and format set to <code>auto</code> for optimal delivery</li>
          <li>Some images use <code>priority</code> for LCP optimization</li>
        </ul>
      </div>
    </div>
  )
} 
