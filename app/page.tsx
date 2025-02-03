import { NavBar } from "@/components/nav-bar"
import { Hero } from "@/components/hero"
import { MissionSection } from "@/components/sections/mission-section"
import { PlasticSurgerySection } from "@/components/sections/plastic-surgery-section"
import { DermatologySection } from "@/components/sections/dermatology-section"
import { MedicalSpaSection } from "@/components/sections/medical-spa-section"
import { FunctionalMedicineSection } from "@/components/sections/functional-medicine-section"
import { TeamSection } from "@/components/sections/team-section"
import { AboutSection } from "@/components/sections/about-section"
import { NewsSection } from "@/components/sections/news-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      <Hero />
      <MissionSection />
      <PlasticSurgerySection />
      <DermatologySection />
      <MedicalSpaSection />
      <FunctionalMedicineSection />
      <TeamSection />
      <AboutSection />
      <NewsSection />
    </main>
  )
}
