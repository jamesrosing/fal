"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/providers/theme-provider"
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  )
}

