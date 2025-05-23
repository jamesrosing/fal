"use client"

import * as React from "react"
import { Album, ImageIcon, LayoutGrid, Settings, Upload, Star, Pin, LogIn, Building2, Calendar, LayoutDashboard } from "lucide-react"
import Link from "next/link"

import { NavMain } from "@/components/shared/layout/nav-main"
import { NavUser } from "@/components/shared/layout/nav-user"
import { TeamSwitcher } from "./team-switcher"
import { NavAdmin } from "./nav-admin"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarCollapsible
} from "@/components/shared/ui/sidebar"
import { Button } from "@/components/shared/ui/button"
import { ThemeToggle } from "@/components/shared/ui/theme-toggle"
import { ScrollArea } from "@/components/shared/ui/scroll-area"
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';

const data = {
  teams: [
    {
      name: "Allure MD",
      logo: Building2,
      plan: "Pro"
    }
  ],
  navMain: [
    {
      title: "Collections",
      url: "/gallery",
      icon: LayoutGrid,
      items: [
        {
          title: "Plastic Surgery",
          url: "/gallery/plastic-surgery",
          items: [
            { title: "Face", url: "/gallery/plastic-surgery/face" },
            { title: "Eyelids", url: "/gallery/plastic-surgery/eyelids" },
            { title: "Ears", url: "/gallery/plastic-surgery/ears" },
            { title: "Nose", url: "/gallery/plastic-surgery/nose" },
            { title: "Neck", url: "/gallery/plastic-surgery/neck" },
            { title: "Breast Augmentation", url: "/gallery/plastic-surgery/breast-augmentation" },
            { title: "Breast Lift", url: "/gallery/plastic-surgery/breast-lift" },
            { title: "Breast Reduction", url: "/gallery/plastic-surgery/breast-reduction" },
            { title: "Breast Revision", url: "/gallery/plastic-surgery/breast-revision" },
            { title: "Breast Nipple Areolar Complex", url: "/gallery/plastic-surgery/breast-nipple-areolar-complex" },
            { title: "Abdominoplasty", url: "/gallery/plastic-surgery/abdominoplasty" },
            { title: "Mini Abdominoplasty", url: "/gallery/plastic-surgery/mini-abdominoplasty" },
            { title: "Liposuction", url: "/gallery/plastic-surgery/liposuction" },
            { title: "Arm Lift", url: "/gallery/plastic-surgery/arm-lift" },
            { title: "Thigh Lift", url: "/gallery/plastic-surgery/thigh-lift" },
          ],
        },
        {
          title: "Emsculpt",
          url: "/gallery/emsculpt",
          items: [
            { title: "Abdomen", url: "/gallery/emsculpt/abdomen" },
            { title: "Buttocks", url: "/gallery/emsculpt/buttocks" },
            { title: "Arms", url: "/gallery/emsculpt/arms" },
            { title: "Calves", url: "/gallery/emsculpt/calves" },
          ],
        },
        {
          title: "SylfirmX",
          url: "/gallery/sylfirmx",
        },
        {
          title: "Facials",
          url: "/gallery/facials",
        },
      ],
    },
  ],
  admin: [
    {
      name: "Gallery",
      url: "/admin/gallery",
      icon: LayoutGrid,
    },
    {
      name: "Upload",
      url: "/admin/upload",
      icon: Upload,
    },
    {
      name: "Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isAdminPage?: boolean
}

export function AppSidebar({ isAdminPage = true, ...props }: AppSidebarProps) {
  const [currentSection, setCurrentSection] = React.useState<string>("")

  const handleNavigate = (section: string) => {
    setCurrentSection(section)
  }

  return (
    <Sidebar className="border-r bg-background" collapsible="icon" {...props}>
      <SidebarHeader className="border-b px-2 py-2">
        {isAdminPage ? (
          <TeamSwitcher teams={data.teams} />
        ) : (
          <Link href="/" className="flex items-center justify-center">
            <span className="font-['lorimer-no-2-condensed'] font-semibold text-2xl">ALLURE MD</span>
          </Link>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {isAdminPage && <NavAdmin onNavigate={handleNavigate} currentSection={currentSection} />}
      </SidebarContent>
      <SidebarFooter className="border-t">
        {isAdminPage ? (
          <div className="p-2 space-y-2">
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login / Create Account
              </Link>
            </Button>
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
