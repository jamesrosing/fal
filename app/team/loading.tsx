import { NavBar } from "@/components/nav-bar"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeamLoading() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section Skeleton */}
      <section className="relative pt-20">
        <div className="relative aspect-[16/9] w-full">
          <Skeleton className="w-full h-full bg-zinc-800" />
        </div>
        
        {/* Hero Text Content */}
        <div className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 p-6 bg-black lg:bg-transparent">
          <div className="max-w-3xl text-white">
            <Skeleton className="h-6 w-32 bg-zinc-800 mb-2" />
            <Skeleton className="h-16 w-full bg-zinc-800 mb-8" />
            <Skeleton className="h-24 w-full bg-zinc-800" />
          </div>
        </div>
      </section>

      {/* Providers Section Skeleton */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <Skeleton className="h-6 w-32 bg-zinc-800 mb-2" />
            <Skeleton className="h-12 w-3/4 bg-zinc-800 mb-8" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="relative">
                <Skeleton className="aspect-[3/4] w-full bg-zinc-800" />
                <div className="mt-4">
                  <Skeleton className="h-8 w-3/4 bg-zinc-800 mb-2" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Section Skeleton */}
      <section className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <Skeleton className="h-6 w-32 bg-zinc-800 mb-2" />
            <Skeleton className="h-12 w-3/4 bg-zinc-800 mb-8" />
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="relative">
                <Skeleton className="aspect-[3/4] w-full bg-zinc-800" />
                <div className="mt-4">
                  <Skeleton className="h-8 w-3/4 bg-zinc-800 mb-2" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
} 