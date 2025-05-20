import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SidebarInset({ children, className, ...props }: SidebarInsetProps) {
  return (
    <div
      className={cn(
        "bg-background md:col-span-1 border-r p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 