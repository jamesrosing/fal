"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { CloudinaryImage } from '@/components/media/CloudinaryMedia'
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';



const procedures = [
  {
    title: "Breast Augmentation",
    description: "Enhance breast size and shape with implants or fat transfer.",
    story: "Breast augmentation is a uniquely personal journey for each woman. Some of our patients have always desired more volume, while others are looking to restore fullness lost after pregnancy or weight changes. We take a personalized approach to create natural-looking results that complement your figure and boost confidence. Many patients tell us they finally feel comfortable in clothing they've always loved but never felt quite right in, or that their proportions finally feel balanced with the rest of their body.",
    imageId: "fal/pages/services/plastic-surgery/breast/breast-augmentation"
  },
  {
    title: "Breast Lift (Mastopexy)",
    description: "Restore a more youthful breast position and shape.",
    story: "A breast lift can be transformative for women who've experienced changes in their breast shape due to pregnancy, weight fluctuations, or simply the natural aging process. This procedure doesn't change your size, but rather restores the youthful position and contour that time has altered. Patients often share how a breast lift has helped them feel more confident in intimate settings and how clothing fits better than it has in years. It's remarkable how this procedure can help women reclaim a part of themselves they thought was lost to time.",
    imageId: "fal/pages/services/plastic-surgery/breast/breast-lift"
  },
  {
    title: "Breast Reduction",
    description: "Achieve more proportionate breasts and relieve discomfort.",
    story: "Breast reduction is as much about comfort as it is aesthetics. Our patients who choose this procedure often tell us about years of back pain, shoulder grooves from bra straps, and difficulty finding clothes that fit properly. After surgery, they frequently mention how liberating it feels to engage in physical activities without discomfort or self-consciousness. Many wish they'd had the procedure sooner after experiencing the physical relief and newfound confidence that comes with having breasts in proportion with their body frame.",
    imageId: "fal/pages/services/plastic-surgery/breast/breast-reduction"
  },
  {
    title: "Breast Revision",
    description: "Correct or improve previous breast surgery results.",
    story: "Breast revision surgery represents our commitment to ensuring every patient achieves their desired outcome, even if their initial procedure wasn't performed by us. Women seek revision for many reasons—from changes in personal preference to addressing complications or unsatisfactory results from previous surgeries. We approach each case with fresh eyes and advanced techniques to help patients finally achieve the results they've been hoping for. The satisfaction that comes from helping someone find resolution after disappointment is particularly rewarding for our surgical team.",
    imageId: "fal/pages/services/plastic-surgery/breast/breast-revision"
  },
  {
    title: "Nipple & Areola Procedures",
    description: "Enhance or correct nipple and areola appearance.",
    story: "Nipple and areola refinements may seem like subtle changes, but they can have a profound impact on how women feel about their breasts overall. These procedures address concerns like overly large areolas, inverted nipples, or asymmetry that can affect confidence and comfort. Patients are often amazed at how these relatively minor adjustments can enhance the overall aesthetic result of their breast procedures. For many, it's the finishing touch that helps them feel completely comfortable and confident with their appearance.",
    imageId: "fal/pages/services/plastic-surgery/breast/nipple-areola"
  }
]

export default function BreastPage() {
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
              id="fal/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero" 
              alt="Breast Procedures" 
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
                Breast Procedures
              </h1>
              <h2 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Customized breast enhancement and reconstruction
              </h2>
              <div className="space-y-6 text-base font-cerebri font-light">
                <p>
                  Our comprehensive breast procedures are designed to help you achieve your desired shape and size while maintaining a natural appearance. Each procedure is tailored to your unique anatomy and aesthetic goals.
                </p>
                <div className="space-y-4">
                  <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/gallery/plastic-surgery/breast">View Before & After Gallery</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Desktop Hero with Text over Image */}
        <div className="hidden lg:block relative h-[70vh]">
          <div className="absolute inset-0">
            <CloudinaryImage 
              id="fal/pages/services/plastic-surgery/breast/plastic-surgery-breast-hero" 
              alt="Breast Procedures" 
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
                  Breast Procedures
                </h1>
                <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                  Customized breast enhancement and reconstruction
                </h2>
                <div className="space-y-6 text-base font-cerebri font-light">
                  <p>
                    Our comprehensive breast procedures are designed to help you achieve your desired shape and size while maintaining a natural appearance. Each procedure is tailored to your unique anatomy and aesthetic goals.
                  </p>
                  <div className="space-y-4">
                    <LearnMoreButton href="/appointment">Schedule a Consultation</LearnMoreButton>
                    <br />
                    <LearnMoreButton href="/gallery/plastic-surgery/breast">View Before & After Gallery</LearnMoreButton>
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