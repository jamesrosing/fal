"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';

interface NavItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  items?: NavItem[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>GALLERY</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMenuItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
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
          <SidebarMenuSub>
            <ul>
              {item.items.map((subItem) => (
                <NavMenuItem key={subItem.title} item={subItem} />
              ))}
            </ul>
          </SidebarMenuSub>
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

