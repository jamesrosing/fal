"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';


interface LearnMoreButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  underline?: boolean
}

export function LearnMoreButton({ href, children, className = "", underline = true }: LearnMoreButtonProps) {
  return (
    <Link href={href}>
      <motion.div
        className={cn(
          "group inline-flex items-center space-x-2",
          underline ? "border-b border-current pb-1" : "",
          className
        )}
        whileHover={{ x: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <span>{children}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </motion.div>
    </Link>
  )
}

