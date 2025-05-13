import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { AspectRatio } from "../../components/ui/aspect-ratio"
import { cn } from "@/lib/utils"
import type { Article } from '@/lib/types'
import { Bookmark, Share2 } from 'lucide-react'
import { getCloudinaryUrl } from '@/lib/cloudinary'

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  // Convert the article image to a proper Cloudinary URL
  const imageUrl = article.image ? 
    getCloudinaryUrl(article.image, {
      width: 600,
      height: 400,
      crop: 'fill',
      gravity: 'auto'
    }) : 
    '/placeholder-image.jpg';

  return (
    <Card className="h-full overflow-hidden border-none shadow-none">
      <AspectRatio ratio={16/9}>
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </AspectRatio>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">{article.category}</span>
        </div>
        <h3 className={cn(
          "text-lg font-bold text-foreground mb-2",
          "line-clamp-2 leading-tight font-serif"
        )}>
          {article.title}
        </h3>
        <p className={cn(
          "text-sm text-muted-foreground",
          "line-clamp-4 leading-normal font-sans"
        )}>
          {article.excerpt}
        </p>
        <div className="flex justify-between items-center mt-4">
          <Link href={`/article/${article.id}`} className="text-sm font-medium text-primary hover:underline">
            Full article
          </Link>
          <div className="flex space-x-2">
            <Bookmark className="w-4 h-4 text-muted-foreground" />
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
