"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const services = [
  { value: "plastic-surgery", label: "Plastic Surgery Consultation" },
  { value: "dermatology", label: "Dermatology Consultation" },
  { value: "medical-spa", label: "Medical Spa Treatment" },
  { value: "functional-medicine", label: "Functional Medicine Consultation" },
]

export default function AppointmentPage() {
  const [date, setDate] = useState<Date>()

  return (
    <main className="min-h-screen bg-black">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-[50vh]">
        <div className="absolute inset-0">
          <Image
            src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/hero/appointment-hero.jpg"
            alt="Schedule an Appointment"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-white"
            >
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                Schedule an Appointment
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Begin your transformation journey
              </h2>
              <p className="text-lg font-cerebri font-light">
                Take the first step towards achieving your aesthetic goals. Our expert team is ready to guide you through your personalized treatment plan.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <form className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-serif text-white">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName"
                      autoComplete="given-name"
                      data-form-type="other"
                      placeholder="Enter your first name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName"
                      autoComplete="family-name"
                      data-form-type="other"
                      placeholder="Enter your last name" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    autoComplete="email"
                    data-form-type="other"
                    placeholder="Enter your email" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel" 
                    autoComplete="tel"
                    data-form-type="other"
                    placeholder="Enter your phone number" 
                  />
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-serif text-white">Appointment Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea
                    id="message"
                    placeholder="Please share any specific concerns or questions you have"
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full">
                Schedule Consultation
              </Button>

              {/* Additional Information */}
              <div className="text-sm text-muted-foreground text-center space-y-2">
                <p>
                  By submitting this form, you agree to our{" "}
                  <a href="/terms" className="underline hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="underline hover:text-primary">
                    Privacy Policy
                  </a>
                  .
                </p>
                <p>
                  For immediate assistance, please call us at{" "}
                  <a href="tel:9497067874" className="text-primary hover:underline">
                    (949) 706-7874
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
} 