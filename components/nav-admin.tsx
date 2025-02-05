"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Image, Settings, Users, FolderOpen, Album, ImageIcon } from "lucide-react"

// Define the collections structure based on the navMain data
const collections = {
  "plastic-surgery": {
    title: "Plastic Surgery",
    albums: [
      "Face",
      "Eyelids",
      "Ears",
      "Nose",
      "Neck",
      "Breast Augmentation",
      "Breast Lift",
      "Breast Reduction",
      "Breast Revision",
      "Breast Nipple Areolar Complex",
      "Abdominoplasty",
      "Mini Abdominoplasty",
      "Liposuction",
      "Arm Lift",
      "Thigh Lift"
    ]
  },
  "emsculpt": {
    title: "Emsculpt",
    albums: [
      "Abdomen",
      "Buttocks",
      "Arms",
      "Calves"
    ]
  },
  "sylfirmx": {
    title: "Sylfirm X",
    albums: []
  },
  "facials": {
    title: "Facials",
    albums: []
  }
}

// Convert the collections structure to navigation items
const collectionNavItems = Object.entries(collections).map(([id, collection]) => ({
  title: collection.title,
  href: `/admin/collections/${id}`,
  icon: FolderOpen
}))

const items = [
  {
    title: "Admin Dashboard",
    href: "/admin",
  },
  {
    title: "Collections",
    href: "/admin/collections",
    icon: FolderOpen,
    children: collectionNavItems
  },
  {
    title: "Albums",
    href: "/admin/albums",
    icon: Album,
  },
  {
    title: "Cases",
    href: "/admin/cases",
    icon: ImageIcon,
  },
  {
    title: "Media",
    href: "/admin/upload",
    icon: Image,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  }
]

interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

export function NavAdmin() {
  const pathname = usePathname()
  const [expanded, setExpanded] = React.useState<string[]>([])

  const toggleExpanded = (href: string) => {
    setExpanded(prev => 
      prev.includes(href) 
        ? prev.filter(h => h !== href)
        : [...prev, href]
    )
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = pathname === item.href
    const isExpanded = expanded.includes(item.href)
    const hasChildren = item.children && item.children.length > 0
    const isParentOfActive = item.children?.some(child => pathname === child.href)

    return (
      <div key={item.href} className="space-y-1">
        <Button
          variant={isActive || isParentOfActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            level > 0 && "pl-8",
            (isActive || isParentOfActive)
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            level === 2 && "text-sm"
          )}
          onClick={() => hasChildren ? toggleExpanded(item.href) : undefined}
          asChild={!hasChildren}
        >
          {hasChildren ? (
            <div className="flex items-center">
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.title}
              <ChevronRight 
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  isExpanded && "rotate-90"
                )} 
              />
            </div>
          ) : (
            <Link href={item.href}>
              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
              {item.title}
              {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          )}
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="pl-4">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {items.map(item => renderNavItem(item))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

