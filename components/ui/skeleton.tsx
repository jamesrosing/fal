import { cn } from "@/lib/utils"
// import OptimizedImage from '@/components/media/OptimizedImage';
// import OptimizedVideo from '@/components/media/OptimizedVideo';


function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
