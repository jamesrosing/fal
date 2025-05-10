import { cn } from "@/lib/utils"
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';


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
