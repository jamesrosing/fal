import dynamic from 'next/dynamic'
import { NavBar } from "@/components/shared/layout/nav-bar"
import { HeroSection } from "@/components/shared/layout/sections/hero-section"
import { SectionErrorBoundary } from "@/components/shared/ErrorBoundary"
import { Skeleton } from "@/components/shared/ui/skeleton"

// Dynamic imports for sections that aren't immediately visible
const MissionSection = dynamic(
  () => import("@/components/shared/layout/sections/mission-section").then(mod => ({ default: mod.MissionSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const PlasticSurgerySection = dynamic(
  () => import("@/components/shared/layout/sections/plastic-surgery-section").then(mod => ({ default: mod.PlasticSurgerySection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const DermatologySection = dynamic(
  () => import("@/components/shared/layout/sections/dermatology-section").then(mod => ({ default: mod.DermatologySection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const MedicalSpaSection = dynamic(
  () => import("@/components/shared/layout/sections/medical-spa-section").then(mod => ({ default: mod.MedicalSpaSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const FunctionalMedicineSection = dynamic(
  () => import("@/components/shared/layout/sections/functional-medicine-section").then(mod => ({ default: mod.FunctionalMedicineSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const TeamSection = dynamic(
  () => import("@/components/shared/layout/sections/team-section").then(mod => ({ default: mod.TeamSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const AboutSection = dynamic(
  () => import("@/components/shared/layout/sections/about-section").then(mod => ({ default: mod.AboutSection })),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

const ArticlesSection = dynamic(
  () => import("@/components/shared/layout/sections/articles-section"),
  { 
    loading: () => <SectionSkeleton />,
    ssr: true 
  }
)

// Loading skeleton for sections
function SectionSkeleton() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Skeleton className="mb-8 h-12 w-64 mx-auto" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      <HeroSection />
      
      <SectionErrorBoundary>
        <MissionSection />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary>
        <PlasticSurgerySection />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary>
        <DermatologySection />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary>
        <MedicalSpaSection />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary>
        <FunctionalMedicineSection />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary>
        <TeamSection />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary>
        <AboutSection />
      </SectionErrorBoundary>
      
      <SectionErrorBoundary>
        <ArticlesSection />
      </SectionErrorBoundary>
    </main>
  )
}
