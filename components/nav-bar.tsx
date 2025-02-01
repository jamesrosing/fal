"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface SubItem {
  name: string;
  description: string;
  subItems?: string[];
}

interface NavItem {
  title: string;
  items: SubItem[];
  description: string;
}

const navItems: NavItem[] = [
  {
    title: "PLASTIC SURGERY",
    items: [
      {
        name: "Head & neck",
        description: "Procedures for eyelids, ears, face, neck, and nose.",
        subItems: ["Eyelids", "Ears", "Face", "Neck", "Nose"],
      },
      {
        name: "Breast",
        description: "Augmentation, lift, reduction, revision, and nipple areolar complex procedures.",
        subItems: ["Augmentation", "Lift", "Reduction", "Revision", "Nipple areolar complex"],
      },
      {
        name: "Body",
        description: "Abdominoplasty, Mini-Abdominoplasty, Liposuction, Arm Lift, and Thigh Lift.",
        subItems: ["Abdominoplasty", "Mini-Abdominoplasty", "Liposuction", "Arm Lift", "Thigh Lift"],
      },
    ],
    description: "Comprehensive plastic surgery solutions for face, breast, and body.",
  },
  {
    title: "DERMATOLOGY",
    items: [
      { name: "Skin screening", description: "Comprehensive skin health evaluations." },
      { name: "Acne", description: "Advanced treatments for acne and related conditions." },
      { name: "Eczema", description: "Management and treatment of eczema and dermatitis." },
      { name: "Rosacea", description: "Specialized care for rosacea symptoms." },
      { name: "Psoriasis", description: "Cutting-edge psoriasis treatments and management." },
    ],
    description: "Expert dermatological care for all your skin health needs.",
  },
  {
    title: "MEDICAL SPA",
    items: [
      { name: "Emsculpt", description: "Non-invasive body contouring treatment." },
      { name: "Shapescale", description: "Advanced 3D body scanning for precise measurements." },
      { name: "RF microneedling", description: "Skin rejuvenation combining radiofrequency and microneedling." },
      { name: "Cosmetic injections", description: "Botox, fillers, and other injectable treatments." },
      { name: "Skin lasers", description: "Laser treatments for various skin concerns." },
      { name: "Esthetician services", description: "Professional skincare treatments and facials." },
    ],
    description: "Advanced medical spa treatments for rejuvenation and wellness.",
  },
  {
    title: "FUNCTIONAL MEDICINE",
    items: [
      { name: "Cardiometabolic optimization", description: "Comprehensive approach to heart and metabolic health." },
      { name: "Epigenetic optimization", description: "Personalized treatments based on genetic factors." },
      { name: "Hair restoration", description: "Advanced techniques for hair regrowth and restoration." },
      { name: "Hormone optimization", description: "Balancing and optimizing hormone levels for overall well-being." },
      { name: "Neurocognitive performance", description: "Enhancing brain function and cognitive abilities." },
      {
        name: "Sleep & travel optimization",
        description: "Improving sleep quality and managing travel-related health issues.",
      },
    ],
    description: "Holistic approach to optimize your overall health and well-being.",
  },
  {
    title: "GALLERY",
    items: [
      { name: "Before & after pictures", description: "Visual results of our successful treatments." },
      { name: "Videos", description: "Informative videos about our procedures and patient experiences." },
    ],
    description: "View our portfolio of successful treatments and procedures.",
  },
  {
    title: "ARTICLES",
    items: [
      { name: "Latest News", description: "Stay updated with our latest medical advances and clinic news." },
      { name: "Educational Content", description: "In-depth articles about treatments and procedures." },
      { name: "Patient Stories", description: "Real experiences from our satisfied patients." },
      { name: "Health Tips", description: "Expert advice for maintaining your results." },
    ],
    description: "Stay informed with our latest articles and educational content.",
  },
  {
    title: "RESOURCES",
    items: [
      { name: "About Us", description: "Learn about our practice, mission, and values." },
      { name: "Contact", description: "Get in touch with us for consultations and inquiries." },
      { name: "Membership", description: "Exclusive benefits for our members." },
      { name: "Financing", description: "Flexible payment options for your treatments." },
      { name: "Gift certificates", description: "Perfect gifts for your loved ones." },
      { name: "Out-of-town clients", description: "Special arrangements for non-local patients." },
    ],
    description: "Helpful information and resources for our patients.",
  },
]

export function NavBar() {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])
  const [activeItem, setActiveItem] = React.useState<string | null>(null)
  const [activeDescription, setActiveDescription] = React.useState<string>("")
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isHidden, setIsHidden] = React.useState(false)
  const lastScrollY = React.useRef(0)

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 0)
      setIsHidden(currentScrollY > lastScrollY.current && currentScrollY > 100)
      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [title]))
  }

  const MobileNavItem = ({ item }: { item: (typeof navItems)[0] }) => (
    <div className="border-b border-gray-800">
      <button
        className="flex w-full items-center justify-between py-6 text-2xl font-serif"
        onClick={() => toggleExpanded(item.title)}
      >
        {item.title}
        {item.items.length > 0 &&
          (expandedItems.includes(item.title) ? (
            <Minus className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          ))}
      </button>
      {expandedItems.includes(item.title) && item.items.length > 0 && (
        <div className="pb-6">
          {item.items.map((subItem, index) => (
            <div key={index} className="py-3">
              {subItem.subItems ? (
                <div>
                  <button
                    className={cn(
                      "flex w-full items-center justify-between text-xl font-cerebri font-normal text-gray-300 hover:text-white"
                    )}
                    onClick={() => toggleExpanded(`${item.title}-${subItem.name}`)}
                  >
                    {subItem.name}
                    {expandedItems.includes(`${item.title}-${subItem.name}`) ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                  {expandedItems.includes(`${item.title}-${subItem.name}`) && (
                    <div className="ml-4 mt-3 space-y-3">
                      {subItem.subItems.map((nestedItem, nestedIndex) => (
                        <Link
                          key={nestedIndex}
                          href="#"
                          className="block text-lg font-cerebri font-light text-gray-400 hover:text-white"
                        >
                          {nestedItem.toUpperCase()}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="#"
                  className="block text-xl font-cerebri font-light text-gray-300 hover:text-white"
                >
                  {subItem.name.toUpperCase()}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 border-b",
        isScrolled || activeItem 
          ? "bg-black/80 backdrop-blur-md [&_*]:border-gray-200 dark:[&_*]:border-gray-800 border-gray-200 dark:border-gray-800" 
          : "bg-transparent [&_*]:border-white border-white",
        isHidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className={cn(
              "text-xl font-['lorimer-no-2-condensed'] font-semibold",
              isScrolled ? "text-gray-900 dark:text-white" : "text-white"
            )}>
              ALLURE MD
            </span>
          </Link>
          <nav className="hidden md:flex items-center">
            <div className="h-16 border-l flex items-center"></div>
            {navItems.slice(0, -1).map((item) => (
              <React.Fragment key={item.title}>
                <div className="relative group border-r flex items-center">
                  <button
                    className={cn(
                      "h-16 px-4 text-sm font-cerebri font-normal focus:outline-none",
                      isScrolled
                        ? "text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                        : "text-white hover:text-gray-200",
                    )}
                    onMouseEnter={() => {
                      setActiveItem(item.title)
                      setActiveDescription(item.description)
                    }}
                    onMouseLeave={() => setActiveItem(null)}
                  >
                    {item.title}
                  </button>
                </div>
              </React.Fragment>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <div className="relative group border-l flex items-center h-16 hidden md:flex">
              <button
                className={cn(
                  "h-16 px-4 text-sm font-cerebri font-normal focus:outline-none",
                  isScrolled
                    ? "text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                    : "text-white hover:text-gray-200",
                )}
                onMouseEnter={() => {
                  setActiveItem("RESOURCES")
                  setActiveDescription(navItems[navItems.length - 1].description)
                }}
                onMouseLeave={() => setActiveItem(null)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "md:hidden h-16 px-4",
                    isScrolled ? "text-gray-900 dark:text-white" : "text-white hover:text-gray-200"
                  )}
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full p-0 sm:max-w-sm bg-black">
                <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
                <div className="px-6 py-8">
                  {navItems.map((item) => (
                    <MobileNavItem key={item.title} item={item} />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      {activeItem && (
        <div
          className="absolute left-0 w-full bg-black/80 backdrop-blur-md shadow-lg border-t"
          onMouseEnter={() => setActiveItem(activeItem)}
          onMouseLeave={() => setActiveItem(null)}
        >
          <div className="mx-auto max-w-screen-xl">
            <div className="flex h-96">
              <div className="w-1/3 p-4 border-r flex items-center justify-center">
                <div className="text-left">
                  <h2 className="text-2xl font-serif text-white mb-4">{activeItem}</h2>
                  <div className="space-y-2">
                    {navItems
                      .find((item) => item.title === activeItem)
                      ?.items.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href="#"
                          className="block text-lg font-cerebri font-light text-gray-300 hover:text-white transition-all duration-200"
                          onMouseEnter={() => setActiveDescription(subItem.description)}
                        >
                          {subItem.name.toUpperCase()}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
              <div className="w-2/3 p-4 flex items-center">
                <p className="text-gray-400 font-cerebri font-normal text-xl">{activeDescription}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}


