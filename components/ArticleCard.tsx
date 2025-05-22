"use client"

import { motion } from "framer-motion";
import Link from "next/link";
import { Article } from "@/lib/types";
import ArticleImage from "./media/ArticleImage";

interface ArticleCardProps {
article: Article;
priority?: boolean;
}

export default function ArticleCard({ article, priority = false }: ArticleCardProps) {
// Convert article image to proper Cloudinary URL
const imageUrl = article.image ?
(article.image.includes('https://res.cloudinary.com')
? article.image
: `articles/${article.image}`)
: '/placeholder-image.jpg';

return (
<Link
href={`/articles/${article.slug}`}
className="group"
>
<motion.div
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
viewport={{ once: true }}
className="bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden h-full flex flex-col"
>
<div className="relative h-48">
<ArticleImage
src={imageUrl}
alt={article.title}
fill
className="object-cover group-hover:scale-105 transition-transform duration-300"
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
priority={priority}
/>
</div>
<div className="p-6 flex-1 flex flex-col">
<h3 className="text-xl font-serif font-semibold group-hover:text-primary transition-colors duration-300 mb-2">
{article.title}
</h3>
<p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-4">{article.excerpt}</p>
<div className="text-sm text-gray-500 dark:text-gray-400">
{new Date(article.date).toLocaleDateString('en-US', {
year: 'numeric',
month: 'short',
day: 'numeric'
})}
</div>
</div>
</motion.div>
</Link>
);
}