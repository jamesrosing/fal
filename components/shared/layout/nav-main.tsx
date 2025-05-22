"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar
} from "./ui/sidebar"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';

interface NavItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavItem[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold px-2 py-2">GALLERY</h2>
      <SidebarMenu>
        {items.map((item) => (
          <NavMenuItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </div>
  )
}

function NavMenuItem({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)

  return (
    <li>
      {item.items ? (
        <>
          <SidebarMenuButton>
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto h-4 w-4" />
          </SidebarMenuButton>
          <div className="pl-4">
            <ul>
              {item.items.map((subItem) => (
                <NavMenuItem key={subItem.title} item={subItem} />
              ))}
            </ul>
          </div>
        </>
      ) : (
        <SidebarMenuButton asChild data-active={isActive}>
          <Link href={item.url}>
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      )}
    </li>
  )
}

