import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { motion, MotionProps } from "framer-motion"

interface SectionContainerProps {
children: ReactNode
className?: string
background?: "black" | "zinc-900" | "white" | "custom"
customBackground?: string
fullWidth?: boolean
as?: "section" | "div" | "article"
id?: string
motionProps?: MotionProps
}

export function SectionContainer({
children,
className,
background = "black",
customBackground,
fullWidth = false,
as: Component = "section",
id,
motionProps,
}: SectionContainerProps) {
const backgroundClasses = {
black: "bg-black text-white",
"zinc-900": "bg-zinc-900 text-white",
white: "bg-white text-black",
custom: customBackground || "",
}

return (
<Component
id={id}
className={cn(
"py-24",
backgroundClasses[background],
className
)}
>
<div className={cn(fullWidth ? "w-full" : "container mx-auto px-4")}>
{motionProps ? (
<motion.div {...motionProps}>{children}</motion.div>
) : (
children
)}
</div>
</Component>
)
}

interface SectionHeaderProps {
title: string
subtitle: string
description?: string | ReactNode
centered?: boolean
className?: string
motionProps?: MotionProps
}

export function SectionHeader({
title,
subtitle,
description,
centered = false,
className,
motionProps,
}: SectionHeaderProps) {
const content = (
<div
className={cn(
"mb-16 max-w-3xl",
centered && "mx-auto text-center",
className
)}
>
<h2 className="mb-2 text-md font-cerebri font-normal uppercase tracking-wide text-zinc-500">
{title}
</h2>
<h3 className="mb-8 text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight font-serif text-white">
{subtitle}
</h3>
{description && (
<div className="space-y-6 text-lg font-cerebri font-light text-zinc-300">
{typeof description === "string" ? <p>{description}</p> : description}
</div>
)}
</div>
)

if (motionProps) {
return <motion.div {...motionProps}>{content}</motion.div>
}

return content
}