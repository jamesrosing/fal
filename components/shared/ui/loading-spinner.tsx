import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
size?: "sm" | "md" | "lg"
text?: string
className?: string
fullPage?: boolean
}

export function LoadingSpinner({
size = "md",
text,
className,
fullPage = false,
}: LoadingSpinnerProps) {
const sizeClasses = {
sm: "w-4 h-4",
md: "w-8 h-8",
lg: "w-12 h-12",
}

const spinner = (
<div className={cn("flex flex-col items-center justify-center", className)}>
<Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
{text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
</div>
)

if (fullPage) {
return (
<div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
{spinner}
</div>
)
}

return spinner
}