"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Image, Settings, Users, FolderOpen, Album, ImageIcon, MoreHorizontal } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSidebar } from "@/components/ui/sidebar"
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


// Define the collections structure
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
  id: id,
  icon: FolderOpen
}))

const items = [
  {
    title: "Admin Dashboard",
    id: "dashboard",
  },
  {
    title: "Team",
    id: "team",
    icon: Users,
  },
  {
    title: "Collections",
    id: "collections",
    icon: FolderOpen,
    children: collectionNavItems
  },
  {
    title: "Albums",
    id: "albums",
    icon: Album,
  },
  {
    title: "Cases",
    id: "cases",
    icon: ImageIcon,
  },
  {
    title: "Media",
    id: "media",
    icon: Image,
  },
  {
    title: "Settings",
    id: "settings",
    icon: Settings,
  }
]

interface NavItem {
  title: string
  id: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

interface NavAdminProps {
  onNavigate: (section: string, collection?: string) => void
  currentSection: string
  currentCollection?: string
}

export function NavAdmin({ onNavigate, currentSection, currentCollection }: NavAdminProps) {
  const [expanded, setExpanded] = React.useState<string[]>([])
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const toggleExpanded = (id: string) => {
    setExpanded(prev => 
      prev.includes(id) 
        ? prev.filter(h => h !== id)
        : [...prev, id]
    )
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = currentSection === item.id || 
                    (item.children && currentCollection && item.id === 'collections')
    const isExpanded = expanded.includes(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isParentOfActive = item.children?.some(child => currentCollection === child.id)

    if (isCollapsed) {
      return (
        <Button
          key={item.id}
          variant={isActive || isParentOfActive ? "secondary" : "ghost"}
          size="icon"
          className="w-full h-9"
          onClick={() => {
            if (item.id === 'team') {
              window.location.href = '/admin/team'
            } else {
              onNavigate(item.id)
            }
          }}
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          <span className="sr-only">{item.title}</span>
        </Button>
      )
    }

    return (
      <div key={item.id} className="space-y-1">
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
          onClick={() => {
            if (item.id === 'team') {
              window.location.href = '/admin/team'
            } else if (hasChildren) {
              toggleExpanded(item.id)
            } else {
              onNavigate(item.id)
            }
          }}
        >
          <div className="flex items-center w-full">
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            {item.title}
            {hasChildren && (
              <ChevronRight 
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  isExpanded && "rotate-90"
                )} 
              />
            )}
          </div>
        </Button>
        
        {hasChildren && isExpanded && (
          <div className="pl-4">
            {item.children?.map(child => (
              <Button
                key={child.id}
                variant={currentCollection === child.id ? "secondary" : "ghost"}
                className="w-full justify-start pl-8 hover:bg-transparent hover:underline"
                onClick={() => onNavigate('collections', child.id)}
              >
                {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                {child.title}
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-[52px]" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b px-2">
        {!isCollapsed && <span className="font-semibold px-2">Admin Panel</span>}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-4">
          <div className="px-1">
            <div className="space-y-1">
              {items.map(item => renderNavItem(item))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t">
          <div className="flex p-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="size-8 rounded-full bg-muted" />
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-medium truncate">Admin</span>
                <span className="text-xs text-muted-foreground truncate">admin@example.com</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mr-2">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

