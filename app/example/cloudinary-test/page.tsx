'use client'

import { CldImage } from 'next-cloudinary'
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'
import CldVideo from '@/components/media/CldVideo'
import { CldVideoWrapper } from '@/components/media/CldVideoWrapper'
import { useState } from 'react'

export default function CloudinaryTestPage() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Cloudinary Components Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Test 1: Basic CldImage */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">1. Basic CldImage</h2>
          <CldImage
            src="emsculpt/hero-image"
            width={400}
            height={300}
            alt="Emsculpt Hero Image"
            crop="fill"
          />
        </div>
        
        {/* Test 2: Direct CldVideoPlayer */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">2. Direct CldVideoPlayer</h2>
          <CldVideoPlayer
            src="emsculpt/videos/hero/hero-720p-mp4"
            width="400"
            height="225"
            autoplay ={false}
            muted={true}
            controls={true}
          />
        </div>
        
        {/* Test 3: CldVideo Component */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">3. CldVideo Component</h2>
          <CldVideo
            publicId="emsculpt/videos/hero/hero-480p-mp4"
            width={400}
            height={225}
            autoplay ={false}
            controls={true}
            muted={true}
            showLoading={true}
          />
          <p className="mt-2 text-sm text-gray-600">
            CldVideo Component with error handling
          </p>
        </div>
        
        {/* Test 4: CldVideoWrapper Component */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">4. CldVideoWrapper Component</h2>
          <CldVideoWrapper
            publicId="emsculpt/videos/hero/hero-720p-mp4"
            width={400}
            height={225}
            autoplay ={false}
            controls={true}
            muted={true}
          />
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
    </div>
  )
} 
