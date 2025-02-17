"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from "@/components/nav-bar"
import { LearnMoreButton } from "@/components/ui/learn-more-button"
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import Head from "next/head"

/// <reference path="../../types/maps.d.ts" />

// Business location coordinates
const BUSINESS_LOCATION = {
  lat: 33.6137574,
  lng: -117.8695081,
  address: "1441 Avocado Ave. Suite 708",
  city: "Newport Beach",
  state: "CA",
  zip: "92660",
  name: "Allure MD Plastic Surgery + Dermatology"
}

const contactMethods = [
  {
    title: "Call Us",
    description: "Speak directly with our patient care team",
    icon: Phone,
    action: "949-706-7874",
    href: "tel:9497067874",
    isHighlighted: true
  },
  {
    title: "Visit Us",
    description: `${BUSINESS_LOCATION.name}\n${BUSINESS_LOCATION.address},\n${BUSINESS_LOCATION.city}, ${BUSINESS_LOCATION.state} ${BUSINESS_LOCATION.zip}`,
    icon: MapPin,
    action: "Get Directions",
    href: "https://maps.apple.com/place?q=Allure%20MD%20Plastic%20Surgery%20%2B%20Dermatology&ll=33.6135252%2C-117.8696291&auid=7888385386305459629&lsp=9902&address=1441%20Avocado%20Ave%2C%20%23708%2C%20Newport%20Beach%2C%20CA%20%2092660%2C%20United%20States",
    isHighlighted: false
  },
  {
    title: "Hours",
    description: "Monday - Thursday: 8:30am - 5pm\nFriday: 8:30am - 12pm",
    icon: Clock,
    action: "Schedule Now",
    href: "/appointment",
    isHighlighted: false
  },
  {
    title: "Chat",
    description: "Message us directly for quick responses",
    icon: MessageCircle,
    action: "Start Chat",
    href: "/chat",
    isHighlighted: true
  }
]

export default function ContactPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInitialized = useRef(false)
  const [mapProvider, setMapProvider] = useState<'google' | 'apple'>('google')
  const scriptsLoaded = useRef<{ google: boolean; apple: boolean }>({ google: false, apple: false })
  const currentMap = useRef<google.maps.Map | null>(null)
  const currentMarker = useRef<google.maps.Marker | null>(null)
  const currentInfoWindow = useRef<google.maps.InfoWindow | null>(null)

  const handleGoogleMapsLoad = () => {
    scriptsLoaded.current.google = true;
    if (mapProvider === 'google' && !mapInitialized.current) {
      initGoogleMap();
    }
  }

  const handleAppleMapsLoad = () => {
    scriptsLoaded.current.apple = true;
    if (mapProvider === 'apple' && !mapInitialized.current) {
      initAppleMap();
    }
  }

  // Cleanup function for Google Maps
  const cleanupGoogleMap = () => {
    if (currentInfoWindow.current) {
      currentInfoWindow.current.close();
      currentInfoWindow.current = null;
    }
    if (currentMarker.current) {
      currentMarker.current.setMap(null);
      currentMarker.current = null;
    }
    if (currentMap.current) {
      currentMap.current = null;
    }
    mapInitialized.current = false;
  }

  const initGoogleMap = () => {
    if (!mapRef.current) return;

    // Clean up existing map
    cleanupGoogleMap();

    // Create map with minimal initial configuration
    const map = new google.maps.Map(mapRef.current, {
      zoom: 17,
      center: BUSINESS_LOCATION,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      gestureHandling: 'greedy',
    });

    currentMap.current = map;

    // Initialize Places Service
    const service = new google.maps.places.PlacesService(map);
    
    // Search for the business by PlaceID
    service.getDetails({
      placeId: 'ChIJ6e6N0PD8woARYDTTVNqjZGY',
      fields: [
        'name',
        'formatted_address',
        'formatted_phone_number',
        'opening_hours',
        'url',
        'website',
        'geometry',
        'icon',
        'rating',
        'reviews',
        'photos',
        'business_status',
        'place_id',
        'types',
        'price_level',
        'user_ratings_total'
      ]
    }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        // Create marker using the place data
        const marker = new google.maps.Marker({
          map: map,
          position: place.geometry?.location,
          title: place.name,
          animation: google.maps.Animation.DROP
        });

        currentMarker.current = marker;

        // Create info window with rich content
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: black; padding: 16px; max-width: 400px;">
              <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 500;">${place.name}</h3>
              ${place.rating ? `
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="color: #FFD700; margin-right: 4px;">★</span>
                  <span style="font-weight: 500;">${place.rating}</span>
                  ${place.user_ratings_total ? `
                    <span style="color: #70757a; margin-left: 4px;">(${place.user_ratings_total} reviews)</span>
                  ` : ''}
                </div>
              ` : ''}
              <p style="margin: 0 0 8px 0; color: #3c4043;">${place.formatted_address}</p>
              ${place.formatted_phone_number ? `
                <p style="margin: 0 0 8px 0; color: #3c4043;">
                  <a href="tel:${place.formatted_phone_number}" style="color: #1a73e8; text-decoration: none;">
                    ${place.formatted_phone_number}
                  </a>
                </p>
              ` : ''}
              ${place.opening_hours?.weekday_text ? `
                <div style="margin: 8px 0; padding: 8px 0; border-top: 1px solid #e8eaed; border-bottom: 1px solid #e8eaed;">
                  <p style="margin: 0 0 4px 0; color: #3c4043; font-weight: 500;">Hours</p>
                  <p style="margin: 0; color: #3c4043; font-size: 14px;">
                    ${place.opening_hours.weekday_text[new Date().getDay() - 1]}
                  </p>
                  <button onclick="this.nextElementSibling.classList.toggle('hidden')" style="font-size: 12px; color: #1a73e8; background: none; border: none; padding: 4px 0; cursor: pointer;">
                    See more hours
                  </button>
                  <div class="hidden" style="margin-top: 4px; font-size: 14px; color: #3c4043;">
                    ${place.opening_hours.weekday_text.map(hours => `<p style="margin: 2px 0;">${hours}</p>`).join('')}
                  </div>
                </div>
              ` : ''}
              <div style="display: flex; gap: 8px; margin-top: 12px;">
                ${place.url ? `
                  <a href="${place.url}" target="_blank" style="text-decoration: none; color: #1a73e8; font-weight: 500; font-size: 14px; padding: 8px 16px; border-radius: 16px; background: #e8f0fe;">View on Google Maps</a>
                ` : ''}
                ${place.website ? `
                  <a href="${place.website}" target="_blank" style="text-decoration: none; color: #1a73e8; font-weight: 500; font-size: 14px; padding: 8px 16px; border-radius: 16px; border: 1px solid #dadce0;">Visit Website</a>
                ` : ''}
              </div>
            </div>
          `
        });

        currentInfoWindow.current = infoWindow;

        // Add click listener to marker
        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        // Open info window by default
        infoWindow.open(map, marker);
      }
    });

    mapInitialized.current = true;
  }

  const initAppleMap = async () => {
    const win = window as Window;
    if (!mapRef.current) return;

    // Initialize MapKit JS with minimal configuration
    win.mapkit.init({
      authorizationCallback: (done: (token: string) => void) => {
        fetch('/api/mapkit-token')
          .then(res => res.text())
          .then(token => done(token))
          .catch(error => console.error('Error getting MapKit JS token:', error))
      }
    });

    try {
      // Create map with minimal initial configuration
      const map = new win.mapkit.Map(mapRef.current, {
        center: new win.mapkit.Coordinate(BUSINESS_LOCATION.lat, BUSINESS_LOCATION.lng),
        zoom: 17,
        showsMapTypeControl: false,
        showsZoomControl: true,
        showsUserLocationControl: false,
        padding: new win.mapkit.Padding(0, 0, 0, 0)
      });

      // Create and add annotation
      const annotation = new win.mapkit.MarkerAnnotation(
        new win.mapkit.Coordinate(BUSINESS_LOCATION.lat, BUSINESS_LOCATION.lng),
        {
          title: BUSINESS_LOCATION.name,
          subtitle: `${BUSINESS_LOCATION.address}, ${BUSINESS_LOCATION.city}, ${BUSINESS_LOCATION.state} ${BUSINESS_LOCATION.zip}`
        }
      );

      map.addAnnotation(annotation);

      // Set region to show the location
      const region = new win.mapkit.CoordinateRegion(
        new win.mapkit.Coordinate(BUSINESS_LOCATION.lat, BUSINESS_LOCATION.lng),
        new win.mapkit.CoordinateSpan(0.005, 0.005)
      );
      map.region = region;

    } catch (error) {
      console.error('Error initializing Apple Maps:', error);
    }

    mapInitialized.current = true;
  }

  // Initialize Google Maps
  useEffect(() => {
    if (mapProvider === 'google' && scriptsLoaded.current.google) {
      initGoogleMap();
    }
    
    // Cleanup when changing providers or unmounting
    return () => {
      if (mapProvider === 'google') {
        cleanupGoogleMap();
      }
    };
  }, [mapProvider]);

  // Initialize Apple Maps
  useEffect(() => {
    if (mapProvider === 'apple' && scriptsLoaded.current.apple) {
      initAppleMap();
    }
  }, [mapProvider]);

  return (
    <>
      <Head>
        <link 
          rel="preconnect" 
          href="https://maps.googleapis.com" 
        />
        <link 
          rel="preconnect" 
          href="https://maps.gstatic.com" 
        />
        <link 
          rel="preconnect" 
          href="https://cdn.apple-mapkit.com" 
        />
      </Head>

      <main className="min-h-screen bg-black">
        {/* Load both scripts at start */}
        <Script
          id="google-maps"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=weekly&libraries=places`}
          strategy="lazyOnload"
          onLoad={handleGoogleMapsLoad}
        />
        <Script
          id="apple-maps"
          src="https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js"
          strategy="lazyOnload"
          onLoad={handleAppleMapsLoad}
        />
        
        <NavBar />
        
        {/* Hero Section */}
        <section className="relative">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="https://res.cloudinary.com/dyrzyfg3w/image/upload/v1738570833/hero/1441-1401-avocado-avenue.jpg"
              alt="Contact Allure MD"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
          
          {/* Hero Text Content */}
          <div className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 p-6 bg-black lg:bg-transparent">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-white"
            >
              <h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
                Contact Us
              </h1>
              <h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
                Get in touch with our team
              </h2>
              <div className="space-y-6 text-lg font-cerebri font-light">
                <p>
                  Our dedicated patient care team is here to assist you with any questions about our services, scheduling, or general inquiries. Reach out to us through your preferred method of contact.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={cn(
                    "p-8 rounded-lg border",
                    method.isHighlighted 
                      ? "bg-zinc-900 border-zinc-800" 
                      : "bg-black border-zinc-900"
                  )}
                >
                  <method.icon className="w-6 h-6 text-white mb-6" />
                  <h3 className="text-2xl font-serif text-white mb-4">{method.title}</h3>
                  <p className="whitespace-pre-line text-gray-400 font-cerebri font-light mb-8">{method.description}</p>
                  <LearnMoreButton href={method.href}>
                    {method.action}
                  </LearnMoreButton>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-24 bg-zinc-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-16"
            >
              <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
                Our Location
              </h2>
              <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
                Visit our Newport Beach office
              </h3>
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => {
                    mapInitialized.current = false
                    setMapProvider('google')
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg font-cerebri text-sm",
                    mapProvider === 'google'
                      ? "bg-zinc-800 text-white"
                      : "bg-transparent text-gray-400 hover:text-white"
                  )}
                >
                  Google Maps
                </button>
                <button
                  onClick={() => {
                    mapInitialized.current = false
                    setMapProvider('apple')
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg font-cerebri text-sm",
                    mapProvider === 'apple'
                      ? "bg-zinc-800 text-white"
                      : "bg-transparent text-gray-400 hover:text-white"
                  )}
                >
                  Apple Maps
                </button>
              </div>
            </motion.div>

            <div ref={mapRef} className="w-full aspect-[16/9] rounded-lg overflow-hidden" />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-white">
                Ready to Begin?
              </h2>
              <h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
                Take the first step today
              </h3>
              <div className="space-y-6 text-lg font-cerebri font-light text-gray-400">
                <p>
                  Whether you're ready to schedule an appointment or just have questions, we're here to help you achieve your aesthetic goals.
                </p>
                <div>
                  <LearnMoreButton href="tel:9497067874">Call 949-706-7874</LearnMoreButton>
                  <br />
                  <LearnMoreButton href="/appointment">Schedule Online</LearnMoreButton>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
} 