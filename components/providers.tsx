"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/providers/theme-provider"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  )
}

