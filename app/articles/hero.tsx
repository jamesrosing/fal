"use client"

import React from "react"
import { CldVideoPlayer } from 'next-cloudinary'
import 'next-cloudinary/dist/cld-video-player.css'

export function ArticlesHero() {
  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ height: "25vh" }}>
      {/* Video background */}
      <div className="absolute inset-0">
        <CldVideoPlayer
          id="articles-hero-video"
          src="videos/backgrounds/water"
          width="1920"
          height="1080"
          autoplay={true}
          muted={true}
          loop={true}
          controls={false}
          config={{
            cloud: {
              cloudName: 'dyrzyfg3w'
            }
          }}
        />
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Simple hero content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="text-white max-w-3xl">
            <h1 className="text-4xl font-light mb-4">Articles & Resources</h1>
            <p className="text-lg mb-2">Stay informed and educated</p>
            <p className="text-base opacity-80">
              Discover the latest news, educational content, and resources about aesthetic procedures, dermatology treatments, and wellness.
            </p>
          </div>
        </div>
      </div>
      
      {/* Basic video styling */}
      <style jsx global>{`
        .cld-video-player {
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        
        .cld-video-player video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        .cld-video-player .vjs-control-bar {
          display: none !important;
        }
      `}</style>
    </section>
  )
} 