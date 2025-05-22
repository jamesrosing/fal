"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { NavBar } from '@/components/shared/layout/nav-bar'
import { LearnMoreButton } from '@/components/shared/ui/learn-more-button'
import { CloudinaryImage } from '@/components/shared/media/CloudinaryMedia'
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';



const procedures = [
  {
    title: "Tummy Tuck (Abdominoplasty)",
    description: "Achieve a flatter, more toned abdominal profile.",
    story: "A tummy tuck is one of our most transformative procedures, especially for those who've experienced pregnancy or significant weight loss. This surgery addresses not just excess skin but also repairs and tightens the underlying muscles that can separate over time. Patients often share that beyond the visible results, they experience improved core strength and posture. Many tell us they feel a renewed sense of confidence wearing clothing they've avoided for years—from fitted dresses to tucked-in shirts and even swimwear they never thought they'd wear again.",
    imageId: "fal/pages/services/plastic-surgery/body/tummy-tuck"
  },
  {
    id: 'mini-abdominoplasty',
    title: 'Mini Abdominoplasty',
    imageId: 'fal/pages/services/plastic-surgery/body/mini-abdominoplasty',
    description: 'A less invasive alternative to a full tummy tuck, targeting only the lower abdomen with less scarring and a faster recovery time.',
    story: 'Mini abdominoplasty is perfect for patients who have good skin elasticity and muscle tone above the navel, but struggle with a small pooch or excess skin in the lower abdomen. The procedure requires a shorter incision and does not involve repositioning the belly button. Many patients appreciate the quicker recovery time and less extensive scarring compared to a full tummy tuck.',
    benefits: [
      'Smaller incision than a full tummy tuck',
      'Faster recovery time',
      'Flattens the lower abdomen below the belly button',
      'Ideal for patients with minimal excess skin',
      'Can be combined with liposuction for enhanced results'
    ],
    details: 'Mini abdominoplasty is perfect for patients who have good skin elasticity and muscle tone above the navel, but struggle with a small pooch or excess skin in the lower abdomen. The procedure requires a shorter incision and does not involve repositioning the belly button.'
  },
  {
    title: "Liposuction",
    description: "Sculpt and contour various areas of the body.",
    story: "Liposuction allows us to artfully sculpt areas of the body resistant to diet and exercise. Today's advanced techniques mean more precise contouring with less downtime than ever before. Patients appreciate that this procedure can be tailored to their specific trouble spots—whether it's addressing love handles, refining the jawline, or creating more definition in the arms or thighs. The satisfaction of finally having proportion and balance in areas that have been stubbornly out of harmony with the rest of your body can be truly life-changing.",
    imageId: "fal/pages/services/plastic-surgery/body/liposuction"
  },
  {
    title: "Arm Lift (Brachioplasty)",
    description: "Reshape and tighten the upper arms.",
    story: "Arm lift surgery helps patients overcome one of the most common sources of body insecurity—upper arm laxity that doesn't respond to diet or exercise. This procedure removes excess skin and fat, creating slimmer, more toned-looking arms. Our patients frequently tell us how liberating it feels to wear sleeveless tops with confidence or to raise their arms without self-consciousness. Many wish they hadn't waited so long for a procedure that has such a significant impact on their daily comfort and clothing choices.",
    imageId: "fal/pages/services/plastic-surgery/body/arm-lift"
  },
  {
    id: 'thigh-lift',
    title: 'Thigh Lift',
    imageId: 'fal/pages/services/plastic-surgery/body/thigh-lift',
    description: 'Reshape the thighs by reducing excess skin and fat, resulting in smoother skin and better-proportioned thigh contours.',
    story: 'A thigh lift is designed to tighten and improve the appearance of thighs that have experienced significant skin laxity due to aging or weight loss. The procedure may involve an incision in the groin that extends downward or around the back of the thigh depending on the specific technique used. Patients often report increased comfort during physical activities and newfound confidence wearing shorts, swimwear, and fitted clothing after recovery.',
    benefits: [
      'Removes excess skin and fat from inner and outer thighs',
      'Creates more proportionate thigh contours',
      'Reduces sagging in the thigh area',
      'Improves mobility and comfort',
      'Can be combined with liposuction for enhanced results'
    ],
    details: 'A thigh lift is designed to tighten and improve the appearance of thighs that have experienced significant skin laxity due to aging or weight loss. The procedure may involve an incision in the groin that extends downward or around the back of the thigh depending on the specific technique used.'
  }
]

export default function BodyPage() {
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
              id="fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero" 
              alt="Body Procedures" 
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
                Body Procedures
              </h1>
              <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Advanced body contouring and sculpting
              </h2>
              <div className="space-y-6 text-base font-cerebri font-light">
                <p>
                  Our comprehensive body procedures are designed to help you achieve your ideal silhouette. From post-weight loss contouring to targeted fat reduction, we offer customized solutions for your unique goals.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/gallery/plastic-surgery/body">View Before & After Gallery</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Desktop Hero with Text over Image */}
        <div className="hidden lg:block relative h-[70vh]">
          <div className="absolute inset-0">
            <CloudinaryImage 
              id="fal/pages/services/plastic-surgery/body/plastic-surgery-body-hero" 
              alt="Body Procedures" 
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
                  Body Procedures
                </h1>
                <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                  Advanced body contouring and sculpting
                </h2>
                <div className="space-y-6 text-base font-cerebri font-light">
                  <p>
                    Our comprehensive body procedures are designed to help you achieve your ideal silhouette. From post-weight loss contouring to targeted fat reduction, we offer customized solutions for your unique goals.
                  </p>
                  <div className="space-y-4">
                    <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                    <br />
                    <LearnMoreButton href="/gallery/plastic-surgery/body">View Before & After Gallery</LearnMoreButton>
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