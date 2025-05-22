"use client"

import { SidebarProvider } from '@/components/shared/ui/sidebar'
import { ThemeProvider } from "@/providers/theme-provider"
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  )
}

