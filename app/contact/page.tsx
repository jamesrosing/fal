"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { NavBar } from '@/components/shared/layout/nav-bar'
import { LearnMoreButton } from '@/components/shared/ui/learn-more-button'
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import Head from "next/head"
import axios from 'axios'
import CldImage from '@/components/shared/media/CldImage'

/// <reference path="../../types/maps.d.ts" />

// Business location coordinates
const BUSINESS_LOCATION = {
  lat: 33.6137574,
  lng: -117.8695081,
  address: "1441 Avocado Ave. Suite 708",
  city: "Newport Beach",
  state: "CA",
  zip: "92660",
  name: "Allure MD Plastic Surgery + Dermatology",
  place_id: "ChIJ6e69CM7hnIARYDRDVNLahGY" // Add the place_id for direct access
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
    href: "https://www.google.com/maps/place/Allure+MD+Plastic+Surgery+%2B+Dermatology/@33.6137574,-117.8695081,17z/data=!3m1!5s0x80dce085de53ba0d:0xfb9d03c83d3100fc!4m6!3m5!1s0x80dce08f08bdeee9:0x664db2da54303460!8m2!3d33.6137574!4d-117.8695081!16s%2Fg%2F11h0vjxcb?entry=ttu&g_ep=EgoyMDI1MDIyNS4wIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D",
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
  const scriptsLoaded = useRef({
    google: false,
    apple: false
  })
  const currentMap = useRef<google.maps.Map | null>(null)
  const currentMarker = useRef<google.maps.Marker | null>(null)
  const currentInfoWindow = useRef<google.maps.InfoWindow | null>(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [businessData, setBusinessData] = useState<any>(null)
  const [isLoadingBusinessData, setIsLoadingBusinessData] = useState(false)
  const [businessDataError, setBusinessDataError] = useState<string | null>(null)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isMapLoading, setIsMapLoading] = useState(true)

  useEffect(() => {
    // Clear URL parameters if they exist
    const url = new URL(window.location.href)
    const hasParams = url.searchParams.toString().length > 0
    
    if (hasParams) {
      // Remove URL parameters without refreshing the page
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleGoogleMapsLoad = () => {
    console.log("Google Maps script loaded successfully");
    scriptsLoaded.current.google = true;
    
    if (mapProvider === 'google') {
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

  // Initialize Google Maps
  const initGoogleMap = () => {
    if (!mapRef.current || mapInitialized.current) return
    
    console.log("Initializing Google Map...");
    console.log("Map container exists:", !!mapRef.current);
    
    try {
      // Log important information for debugging
      console.log("Using Google Maps API key: AIzaSyCXWUoSOrmjjsKDo0wfLzl8lK8Vts5UnGc");
      console.log("Current hostname:", window.location.hostname);
      console.log("Current URL:", window.location.href);
      
      // Create map instance
      const mapOptions = {
      center: BUSINESS_LOCATION,
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: true,
        zoomControl: true
      }
      
      console.log("Creating map with options:", JSON.stringify(mapOptions));
      
      // Check if google maps is loaded properly
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps API not loaded properly");
      }
      
      const map = new google.maps.Map(mapRef.current, mapOptions);
    currentMap.current = map;
      mapInitialized.current = true;
      setIsMapLoading(false);

      console.log("Google Map initialized successfully");

      // Create a Places Service instance
    const service = new google.maps.places.PlacesService(map);
      
      // Use place_id if available (more reliable), otherwise search by name/address
      if (BUSINESS_LOCATION.place_id) {
        fetchPlaceDetails(service, BUSINESS_LOCATION.place_id);
      } else {
        searchForBusiness(map, service);
      }
    } catch (error) {
      console.error("Error initializing Google Map:", error);
      setIsMapLoading(false);
      
      // Check if error is related to API key
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('API key') || errorMsg.includes('apiKey') || errorMsg.includes('ApiKey') || 
          errorMsg.includes('authentication') || errorMsg.includes('MapsApiLoad') || 
          errorMsg.includes('ApiTargetBlockedMapError')) {
        console.error('Error appears to be related to Google Maps API key or permissions');
      }
      
      // Show default marker if possible
      if (currentMap.current) {
        showDefaultMarker(currentMap.current);
      } else {
        console.error("Could not show default marker - map was not initialized");
      }
    }
  }
  
  // Function to search for the business by name and address
  const searchForBusiness = (map: google.maps.Map, service: google.maps.places.PlacesService) => {
    const searchQuery = "Allure MD Plastic Surgery + Dermatology 1441 Avocado Ave Suite 708 Newport Beach CA";
    
    console.log("Searching for business with query:", searchQuery);
    
    // First try with findPlaceFromQuery (most specific)
    service.findPlaceFromQuery({
      query: searchQuery,
      fields: ['place_id', 'name', 'formatted_address', 'geometry']
    }, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        console.log("Found business with findPlaceFromQuery:", results);
        
        // Find the most relevant place
        const matchingPlace = results.find(place => 
          place.formatted_address?.includes("708") && 
          place.formatted_address?.includes("1441")
        ) || results[0];
        
        if (matchingPlace.place_id) {
          // Now get detailed information using the place_id
          service.getDetails({
            placeId: matchingPlace.place_id,
            fields: [
              'name', 'formatted_address', 'formatted_phone_number',
              'opening_hours', 'website', 'url', 'geometry', 'rating', 
              'reviews', 'photos', 'business_status', 'user_ratings_total',
              'utc_offset_minutes'
            ]
          }, (place: google.maps.places.PlaceResult | null, detailStatus: google.maps.places.PlacesServiceStatus) => {
            if (detailStatus === google.maps.places.PlacesServiceStatus.OK && place) {
              console.log("Successfully retrieved place details:", place);
              displayBusinessDetails(place, map);
            } else {
              console.error("Failed to get place details after search:", detailStatus);
              showDefaultMarker(map);
            }
          });
        } else {
          showDefaultMarker(map);
        }
      } else {
        console.log("Failed with findPlaceFromQuery, trying textSearch:", status);
        
        // Fallback to textSearch if findPlaceFromQuery fails
        service.textSearch({
          query: searchQuery,
          location: new google.maps.LatLng(BUSINESS_LOCATION.lat, BUSINESS_LOCATION.lng),
          radius: 500
        }, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            console.log("Found business with textSearch:", results);
            
            const matchingPlace = results.find(place => 
              place.formatted_address?.includes("708") && 
              place.formatted_address?.includes("1441")
            ) || results[0];
            
            if (matchingPlace.place_id) {
    service.getDetails({
                placeId: matchingPlace.place_id,
      fields: [
                  'name', 'formatted_address', 'formatted_phone_number',
                  'opening_hours', 'website', 'url', 'geometry', 'rating', 
                  'reviews', 'photos', 'business_status', 'user_ratings_total',
                  'utc_offset_minutes'
                ]
              }, (place: google.maps.places.PlaceResult | null, detailStatus: google.maps.places.PlacesServiceStatus) => {
                if (detailStatus === google.maps.places.PlacesServiceStatus.OK && place) {
                  console.log("Successfully retrieved place details:", place);
                  displayBusinessDetails(place, map);
                } else {
                  console.error("Failed to get place details after textSearch:", detailStatus);
                  showDefaultMarker(map);
                }
              });
            } else {
              showDefaultMarker(map);
            }
          } else {
            console.error("All search methods failed, showing default marker");
            showDefaultMarker(map);
          }
        });
      }
    });
  };
  
  // Display business details on the map with a marker and info window
  const displayBusinessDetails = (place: google.maps.places.PlaceResult, map: google.maps.Map) => {
    // Create a marker for the business
        const marker = new google.maps.Marker({
          map: map,
          position: place.geometry?.location,
          title: place.name,
          animation: google.maps.Animation.DROP
        });

        currentMarker.current = marker;

    // Format opening hours
    let hoursHTML = '';
    if (place.opening_hours?.weekday_text) {
      hoursHTML = `
        <div style="margin-top: 12px;">
          <p style="margin: 0 0 5px 0; font-weight: 600; color: #333; font-size: 14px;">Business Hours:</p>
          <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 13px; line-height: 1.4;">
            ${place.opening_hours.weekday_text.map(day => 
              `<li>${day}</li>`
            ).join('')}
          </ul>
        </div>
      `;
    }
    
    // Format reviews
    let reviewsHTML = '';
    let reviewDetailsHTML = '';
    
    if (place.rating && place.user_ratings_total) {
      // Create a visual star rating (filled and empty stars)
      const fullStars = Math.floor(place.rating);
      const hasHalfStar = place.rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      
      const starsHTML = 
        '<span style="color: #FBC02D;">' + 
        '★'.repeat(fullStars) + 
        (hasHalfStar ? '★' : '') + 
        '</span>' +
        '<span style="color: #E0E0E0;">' + 
        '★'.repeat(emptyStars) + 
        '</span>';
      
      reviewsHTML = `
        <div style="margin-top: 10px; display: flex; align-items: center;">
          <div style="font-size: 16px; line-height: 1; margin-right: 8px;">${starsHTML}</div>
          <div style="color: #333; font-size: 14px;">${place.rating.toFixed(1)} · ${place.user_ratings_total} reviews</div>
                </div>
      `;
      
      // Add review details if available (limited to 3)
      if (place.reviews && place.reviews.length > 0) {
        const reviews = place.reviews.slice(0, 3); // Max 3 reviews
        
        reviewDetailsHTML = `
          <div style="margin-top: 10px; border-top: 1px solid #E0E0E0; padding-top: 10px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #333; font-size: 14px;">Recent Reviews:</p>
            ${reviews.map(review => {
              // Format the relative time
              const reviewDate = new Date(review.time ? review.time * 1000 : Date.now());
              const timeAgo = getRelativeTimeString(reviewDate);
              
              // Create star rating for this review
              const reviewRating = review.rating || 5; // Default to 5 if undefined
              const reviewStars = 
                '<span style="color: #FBC02D;">' + 
                '★'.repeat(reviewRating) + 
                '</span>' +
                '<span style="color: #E0E0E0;">' + 
                '★'.repeat(5 - reviewRating) + 
                '</span>';
              
              return `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <img src="${review.profile_photo_url || '/images/profile-placeholder.png'}" alt="${review.author_name || 'Reviewer'}" 
                      style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px;" />
                    <span style="font-weight: 500; color: #333; font-size: 13px;">${review.author_name || 'Anonymous'}</span>
                  </div>
                  <div style="font-size: 14px; margin-bottom: 3px;">${reviewStars}</div>
                  <p style="margin: 0 0 3px 0; color: #555; font-size: 12px;">${timeAgo}</p>
                  <p style="margin: 0; color: #333; font-size: 13px; line-height: 1.4;">${review.text || ''}</p>
                </div>
              `;
            }).join('')}
                ${place.url ? `
              <a href="${place.url}#reviews" target="_blank" style="display: inline-block; color: #1a73e8; text-decoration: none; 
                font-size: 13px; margin-top: 5px; font-weight: 500;">
                See all reviews on Google
              </a>
                ` : ''}
          </div>
        `;
      }
    }
    
    // Create photo gallery if available
    let photosHTML = '';
    if (place.photos && place.photos.length > 0) {
      const photos = place.photos.slice(0, 3); // Max 3 photos
      
      photosHTML = `
        <div style="margin-top: 10px; display: flex; gap: 5px; overflow-x: auto;">
          ${photos.map(photo => {
            const photoUrl = photo.getUrl ? photo.getUrl({maxWidth: 150, maxHeight: 150}) : '';
            return `
              <img src="${photoUrl || '/images/place-placeholder.png'}" alt="${place.name || 'Business photo'}" 
                style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" />
            `;
          }).join('')}
        </div>
      `;
    }
    
    // Build the info window content
    const infoWindowContent = `
      <div class="business-info" style="font-family: 'Google Sans', Roboto, Arial, sans-serif; padding: 12px; max-width: 350px;">
        <h3 style="margin: 0 0 8px 0; color: #202124; font-size: 18px; font-weight: 500;">${place.name}</h3>
        
        ${reviewsHTML}
        
        <p style="margin: 10px 0 0 0; color: #5f6368; font-size: 14px; line-height: 1.4;">${place.formatted_address || BUSINESS_LOCATION.address}</p>
        <p style="margin: 5px 0 0 0; color: #5f6368; font-size: 14px;">${place.formatted_phone_number || '(949) 706-7874'}</p>
        
        ${photosHTML}
        ${hoursHTML}
        ${reviewDetailsHTML}
        
        <div style="margin-top: 15px; display: flex; gap: 12px;">
                ${place.website ? `
            <a href="${place.website}" target="_blank" style="color: #1a73e8; text-decoration: none; 
              font-size: 14px; font-weight: 500;">
              Visit Website
            </a>
          ` : ''}
          ${place.url ? `
            <a href="${place.url}" target="_blank" style="color: #1a73e8; text-decoration: none; 
              font-size: 14px; font-weight: 500;">
              View on Google Maps
            </a>
                ` : ''}
              </div>
            </div>
    `;
    
    // Create and open the info window
    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
      maxWidth: 350
        });

        currentInfoWindow.current = infoWindow;

        // Add click listener to marker
    marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // Open info window by default
        infoWindow.open(map, marker);
  };
  
  // Get relative time string (e.g., "2 days ago")
  const getRelativeTimeString = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffYear > 0) return `${diffYear} ${diffYear === 1 ? 'year' : 'years'} ago`;
    if (diffMonth > 0) return `${diffMonth} ${diffMonth === 1 ? 'month' : 'months'} ago`;
    if (diffDay > 0) return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    if (diffHour > 0) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    if (diffMin > 0) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    return 'Just now';
  };
  
  // Function to show a default marker at the business location
  const showDefaultMarker = (map: google.maps.Map) => {
    console.log("Showing default marker at coordinates");
    const marker = new google.maps.Marker({
      map: map,
      position: new google.maps.LatLng(BUSINESS_LOCATION.lat, BUSINESS_LOCATION.lng),
      title: BUSINESS_LOCATION.name,
      animation: google.maps.Animation.DROP
    });
    
    currentMarker.current = marker;
    
    // Create a more detailed info window with styled content
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="info-window" style="font-family: 'Google Sans', Roboto, Arial, sans-serif; padding: 12px; max-width: 300px;">
          <h3 style="margin: 0 0 8px 0; color: #202124; font-size: 18px; font-weight: 500;">${BUSINESS_LOCATION.name}</h3>
          <p style="margin: 8px 0 5px 0; color: #5f6368; font-size: 14px; line-height: 1.4;">${BUSINESS_LOCATION.address}, ${BUSINESS_LOCATION.city}, ${BUSINESS_LOCATION.state} ${BUSINESS_LOCATION.zip}</p>
          <p style="margin: 0 0 10px 0; color: #5f6368; font-size: 14px;">Phone: (949) 706-7874</p>
          <a href="https://www.google.com/maps/place/Allure+MD+Plastic+Surgery+%2B+Dermatology/@33.6137574,-117.8695081,17z/data=!3m1!5s0x80dce085de53ba0d:0xfb9d03c83d3100fc!4m6!3m5!1s0x80dce08f08bdeee9:0x664db2da54303460!8m2!3d33.6137574!4d-117.8695081!16s%2Fg%2F11h0vjxcb?entry=ttu" 
            style="color: #1a73e8; text-decoration: none; font-size: 14px; font-weight: 500;" target="_blank">
            View on Google Maps
          </a>
        </div>
      `,
      maxWidth: 300
    });
    
    currentInfoWindow.current = infoWindow;
    
    // Add click listener to marker
    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
    
    // Open info window by default
    infoWindow.open(map, marker);
  };

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

  // Add status UI for map loading
  const renderMapStatus = () => {
    // Log the API key for debugging
    console.log("API key used for Google Maps:", "AIzaSyCXWUoSOrmjjsKDo0wfLzl8lK8Vts5UnGc");
    
    if (isMapLoading) {
      return <div className="text-amber-500 mb-4">Loading map...</div>
    }
    
    if (businessDataError) {
      return (
        <div className="text-red-500 mb-4">
          {businessDataError}
        </div>
      )
    }
    
    return null
  }

  // Fetch place details using Places API
  const fetchPlaceDetails = (service: google.maps.places.PlacesService, placeId: string) => {
    console.log("Fetching place details for place_id:", placeId)
    
    service.getDetails({
      placeId: placeId,
      fields: [
        'name', 
        'formatted_address', 
        'formatted_phone_number',
        'opening_hours', 
        'website', 
        'url', 
        'geometry', 
        'rating', 
        'reviews',
        'photos'
      ]
    }, (place, status) => {
      console.log("PlacesService.getDetails result status:", status)
      
      if (status === google.maps.places.PlacesServiceStatus.OK && place && currentMap.current) {
        displayBusinessDetails(place, currentMap.current)
      } else {
        console.warn("Failed to retrieve place details:", status)
        if (currentMap.current) {
          searchForBusiness(currentMap.current, service)
        }
      }
    })
  }

  return (
    <>
      <Head>
        <title>Contact | Allure MD Plastic Surgery + Dermatology</title>
        <meta name="description" content="Contact Allure MD for consultations, appointments, and inquiries. Located in Newport Beach, California." />
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
        {/* Load Google Maps API with new API key */}
        <Script
          id="google-maps"
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCXWUoSOrmjjsKDo0wfLzl8lK8Vts5UnGc&libraries=places"
          strategy="lazyOnload"
          onLoad={handleGoogleMapsLoad}
          onError={(e) => {
            console.error("Google Maps script failed to load:", e);
            // Try to provide more details about the error
            if (e instanceof Error) {
              console.error("Error name:", e.name);
              console.error("Error message:", e.message);
            }
          }}
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
            <CldImage 
              src="hero/1441-1401-avocado-avenue.jpg" 
              alt="Contact Allure MD" 
              priority 
              fill 
              config={{
                cloud: {
                  cloudName: 'dyrzyfg3w'
                }
              }}
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
                <p>We&apos;re here to help you with any questions or concerns you may have.</p>
                <p>Please fill out the form below and we&apos;ll get back to you as soon as possible.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Map and Contact Methods Section */}
        <section className="w-full py-14 md:py-24 px-6 sm:px-10 lg:px-20 max-w-8xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Map Column */}
            <div className="bg-neutral-900 rounded-xl overflow-hidden">
              <div className="flex items-center border-b border-neutral-800 px-4 py-3">
                {/* Map Provider Selector */}
                <div className="flex items-center space-x-2 bg-neutral-800 p-1 rounded-full">
                  <button
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full transition",
                      mapProvider === 'google' 
                        ? "bg-primary text-white font-medium" 
                        : "text-neutral-400 hover:text-white"
                    )}
                    onClick={() => setMapProvider('google')}
                  >
                    Google Maps
                  </button>
                  <button
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-full transition",
                      mapProvider === 'apple' 
                        ? "bg-primary text-white font-medium" 
                        : "text-neutral-400 hover:text-white"
                    )}
                    onClick={() => setMapProvider('apple')}
                  >
                    Apple Maps
                  </button>
                </div>
                
                {/* Authentication status UI */}
                <div className="ml-auto">
                  {mapProvider === 'google' && renderMapStatus()}
                </div>
              </div>
              
              {/* Map container */}
              <div className="relative h-[400px] md:h-[500px]">
                <div 
                  ref={mapRef} 
                  className="w-full h-full"
                ></div>
              </div>
              
              {/* Business info container */}
              <div id="business-info" className="px-6 py-4"></div>
            </div>
            
            {/* Contact Methods Column */}
            <div className="md:col-span-1">
              <h2 className="text-2xl font-serif text-white mb-8">
                Contact Methods
              </h2>
              <div className="space-y-6">
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