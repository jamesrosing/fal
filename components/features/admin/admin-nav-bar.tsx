"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';


export function AdminNavBar() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/admin" className="text-xl font-bold">
            Admin Dashboard
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">Back to Site</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

