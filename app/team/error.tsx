'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { NavBar } from '@/components/nav-bar'

export default function TeamErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Team page error:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif text-white mb-6">
            Unable to load team members
          </h2>
          
          <div className="bg-zinc-900 p-8 rounded-lg mb-8">
            <p className="text-zinc-300 mb-4">
              We're experiencing technical difficulties loading our team information.
            </p>
            
            <p className="text-zinc-400 text-sm mb-8">
              Error: {error.message || 'Unknown error'}
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button 
                onClick={() => reset()}
                className="bg-white text-black hover:bg-zinc-200"
              >
                Try again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="border-white text-white hover:bg-white hover:text-black"
              >
                Return home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 