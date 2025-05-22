"use client"

import { ReactNode } from "react"
import { NavBar } from "@/components/nav-bar"
import { motion } from "framer-motion"

interface MainLayoutProps {
children: ReactNode
heroSection?: ReactNode
showNavBar?: boolean
className?: string
}

export function MainLayout({
children,
heroSection,
showNavBar = true,
className = "",
}: MainLayoutProps) {
return (
<main className={`min-h-screen bg-black ${className}`}>
{showNavBar && <NavBar />}
{heroSection}
{children}
</main>
)
}

export interface HeroSectionProps {
title: string
subtitle: string
description?: string | ReactNode
backgroundImage: string
height?: string
children?: ReactNode
}

export function HeroSection({
title,
subtitle,
description,
backgroundImage,
height = "h-[70vh]",
children,
}: HeroSectionProps) {
return (
<section className={`relative ${height}`}>
<div className="absolute inset-0">
<img
src={backgroundImage}
alt={title}
className="object-cover w-full h-full"
/>
<div className="absolute inset-0 bg-black/50" />
</div>

<div className="relative h-full flex items-center">
<div className="container mx-auto px-4">
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8 }}
className="max-w-3xl text-white"
>
<h1 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide">
{title}
</h1>
<h2 className="mb-8 text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-tight font-serif">
{subtitle}
</h2>
{description && (
<div className="space-y-6 text-lg font-cerebri font-light">
{typeof description === "string" ? <p>{description}</p> : description}
</div>
)}
{children}
</motion.div>
</div>
</div>
</section>
)
}