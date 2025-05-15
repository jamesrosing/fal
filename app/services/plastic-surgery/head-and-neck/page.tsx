"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { CloudinaryImage } from '@/components/media/CloudinaryMedia'
import CldImage from '@/components/media/CldImage'
import CldVideo from '@/components/media/CldVideo'



const procedures = [
  {
    title: "Eyelids (Blepharoplasty)",
    description: "Rejuvenate tired-looking eyes and restore a more youthful appearance.",
    story: "Our eyelid procedures are designed to restore the bright, alert look of youth. As we age, the delicate skin around our eyes can droop and create a tired appearance, regardless of how rested we feel. Blepharoplasty carefully removes excess tissue, revealing a refreshed, more open expression that truly reflects your inner energy. Patients often tell us they're amazed at how this relatively simple procedure makes them look years younger and more approachable.",
    imageId: "fal/pages/services/plastic-surgery/head-and-neck/eyelids"
  },
  {
    title: "Ears (Otoplasty)",
    description: "Reshape and reposition the ears for improved facial harmony.",
    story: "Ear reshaping can be truly transformative, especially for those who've felt self-conscious about prominent or asymmetrical ears. This procedure brings balance to your profile, allowing your other features to shine. Many of our patients share touching stories of renewed confidence after otoplasty—from finally wearing their hair up without worry to feeling comfortable in social situations they once avoided. The subtle changes create natural-looking results that complement your unique facial features.",
    imageId: "fal/pages/services/plastic-surgery/head-and-neck/ears"
  },
  {
    title: "Face (Rhytidectomy)",
    description: "Comprehensive facial rejuvenation to address signs of aging.",
    story: "A facelift is more than just tightening skin—it's about restoring the natural contours that define youthful beauty. Our advanced techniques focus on the deeper facial structures to create lasting, natural-looking results. Patients often tell us they love that they still look like themselves, just more refreshed and vibrant. Friends might comment that they look well-rested or ask if they've changed their skincare routine, never suspecting they've had a procedure that so elegantly turns back the clock.",
    imageId: "fal/pages/services/plastic-surgery/head-and-neck/face"
  },
  {
    title: "Neck (Cervicoplasty)",
    description: "Restore a more defined and youthful neck contour.",
    story: "The neck often shows signs of aging earlier than the face, with loosening skin and diminished definition along the jawline. Our neck procedures restore that crisp, elegant profile that frames your face beautifully. Patients are consistently amazed at how addressing this area creates such dramatic improvement in their overall appearance. Many tell us they feel more comfortable in professional settings or wearing certain necklines, and enjoy a renewed sense of confidence in their profile from any angle.",
    imageId: "fal/pages/services/plastic-surgery/head-and-neck/neck"
  },
  {
    title: "Nose (Rhinoplasty)",
    description: "Enhance nasal aesthetics and improve breathing function.",
    story: "Rhinoplasty is truly the art of balance—making subtle adjustments that bring harmony to all your facial features. Beyond the aesthetic improvements, many patients experience functional benefits like easier breathing or relief from chronic sinus issues. We take a highly personalized approach, carefully considering your facial structure, ethnicity, and personal goals to create results that look completely natural. Patients often share that rhinoplasty gave them not just a nose they love, but a newfound sense of facial harmony they hadn't imagined possible.",
    imageId: "fal/pages/services/plastic-surgery/head-and-neck/nose"
  }
]

export default function HeadAndNeckPage() {
  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="bg-black">
        {/* Mobile Hero with Image on top + Text below */}
        <div className="lg:hidden">
          {/* Media container with full width */}
          <div className="relative w-full aspect-[16/9]">
            <CloudinaryImage 
              id="fal/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero" 
              alt="Head and Neck Procedures" 
              priority 
              fill 
              width={1920}
              height={1080}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          {/* Text content below image */}
          <div className="px-4 py-10 bg-black">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                Head & Neck Procedures
              </h1>
              <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Refined procedures for facial rejuvenation and harmony
              </h2>
              <div className="space-y-6 text-base font-cerebri font-light">
                <p>
                  Our comprehensive suite of head and neck procedures is designed to enhance your natural beauty and restore a more youthful appearance. Each procedure is tailored to your unique features and aesthetic goals.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/gallery/plastic-surgery/head-and-neck">View Before & After Gallery</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Desktop Hero with Text over Image */}
        <div className="hidden lg:block relative h-[70vh]">
          <div className="absolute inset-0">
            <CloudinaryImage 
              id="fal/pages/services/plastic-surgery/head-and-neck/plastic-surgery-head-and-neck-hero" 
              alt="Head and Neck Procedures" 
              priority 
              fill 
              width={1920}
              height={1080}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl text-white"
              >
                <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                  Head & Neck Procedures
                </h1>
                <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                  Refined procedures for facial rejuvenation and harmony
                </h2>
                <div className="space-y-6 text-base font-cerebri font-light">
                  <p>
                    Our comprehensive suite of head and neck procedures is designed to enhance your natural beauty and restore a more youthful appearance. Each procedure is tailored to your unique features and aesthetic goals.
                  </p>
                  <div className="space-y-4">
                    <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                    <br />
                    <LearnMoreButton href="/gallery/plastic-surgery/head-and-neck">View Before & After Gallery</LearnMoreButton>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Procedures Section */}
      <section className="bg-black">
        <div className="py-10 lg:py-16 px-0 lg:container lg:mx-auto lg:px-4">
          <div className="grid gap-16 lg:gap-20">
            {procedures.map((procedure, index) => (
              <motion.div
                key={procedure.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="scroll-mt-20"
              >
                {/* Mobile View */}
                <div className="lg:hidden">
                  {/* Full-width image container */}
                  <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] aspect-[4/3]">
                    <CloudinaryImage
                      id={procedure.imageId}
                      alt={procedure.title}
                      fill
                      width={800}
                      height={600}
                      className="object-cover"
                      sizes="100vw"
                    />
                  </div>
                  
                  {/* Text content with proper padding */}
                  <div className="px-4 py-8 bg-black">
                    <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
                      {procedure.title}
                    </h3>
                    <p className="mb-6 text-[clamp(1.5rem,3vw,2rem)] leading-tight tracking-tight font-serif text-white">
                      {procedure.description}
                    </p>
                    
                    <p className="text-base font-cerebri font-light leading-relaxed mb-8 text-white">
                      {procedure.story}
                    </p>
                    
                    <div className="mt-6">
                      <LearnMoreButton href="/appointment">
                        Schedule a Consultation
                      </LearnMoreButton>
                    </div>
                  </div>
                </div>
                
                {/* Desktop View */}
                <div className={`hidden lg:flex ${
                  index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                } gap-10 items-center px-4 lg:px-0`}>
                  <div className="w-1/2">
                    <div className="relative aspect-[4/3] w-full">
                      <CloudinaryImage
                        id={procedure.imageId}
                        alt={procedure.title}
                        fill
                        width={800}
                        height={600}
                        className="object-cover w-full h-full"
                        sizes="50vw"
                      />
                    </div>
                  </div>
                  
                  <div className="w-1/2 text-white">
                    <h3 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                      {procedure.title}
                    </h3>
                    <p className="mb-6 text-[clamp(1.5rem,3vw,2rem)] leading-tight tracking-tight font-serif">
                      {procedure.description}
                    </p>
                    
                    <p className="text-base font-cerebri font-light leading-relaxed mb-8">
                      {procedure.story}
                    </p>
                    
                    <div className="mt-6">
                      <LearnMoreButton href="/appointment">
                        Schedule a Consultation
                      </LearnMoreButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 lg:py-20 bg-[#f5f5f5] dark:bg-black">
        <div className="px-4 lg:container lg:mx-auto lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
              Your Journey Begins Here
            </h2>
            <h3 className="mb-6 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif">
              Transform with confidence
            </h3>
            <div className="space-y-6 text-base font-cerebri font-light">
              <p>
                Take the first step towards achieving your aesthetic goals with our expert team of board-certified plastic surgeons.
              </p>
              <div className="space-y-4">
                <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                <br />
                <LearnMoreButton href="/financing">Learn About Financing</LearnMoreButton>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
} 