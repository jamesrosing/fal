"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function NavBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Allure MD
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#mission" className="text-white hover:text-gray-300">
              Mission
            </Link>
            <Link href="#dermatology" className="text-white hover:text-gray-300">
              Dermatology
            </Link>
            <Link href="#medical-spa" className="text-white hover:text-gray-300">
              Medical Spa
            </Link>
            <Link href="#team" className="text-white hover:text-gray-300">
              Team
            </Link>
            <Link href="#about" className="text-white hover:text-gray-300">
              About
            </Link>
            <Link href="/background-remover">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                Background Remover
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}

