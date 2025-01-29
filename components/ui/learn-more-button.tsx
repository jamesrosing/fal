"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

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
        className={`group inline-flex items-center space-x-2 ${className} ${
          underline ? "border-b border-current pb-1" : ""
        }`}
        whileHover={{ x: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <span className="text-lg">{children}</span>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </motion.div>
    </Link>
  )
}

