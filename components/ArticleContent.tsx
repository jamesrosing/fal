"use client"

import { ArticleContent as ArticleContentType } from "@/lib/types";

interface ArticleContentRendererProps {
content: string | ArticleContentType[];
}

export default function ArticleContentRenderer({ content }: ArticleContentRendererProps) {
if (!content) return null;

if (typeof content === 'string') {
return (
<>
{content.split('\n\n').map((paragraph: string, index: number) => {
if (paragraph.startsWith('# ')) {
return <h2 key={index} className="text-3xl font-serif font-semibold mt-8 mb-4">{paragraph.slice(2)}</h2>
} else if (paragraph.startsWith('## ')) {
return <h3 key={index} className="text-2xl font-serif font-semibold mt-6 mb-3">{paragraph.slice(3)}</h3>
} else if (paragraph.startsWith('> ')) {
return (
<blockquote key={index} className="border-l-4 border-zinc-700 pl-4 italic my-6">
{paragraph.slice(2)}
</blockquote>
)
} else {
return <p key={index} className="mb-6">{paragraph}</p>
}
})}
</>
);
} else {
// Handle structured content
return (
<>
{content.map((block: ArticleContentType, index: number) => {
// Implement rendering logic for structured content
return <p key={index}>{block.content}</p>;
})}
</>
);
}
}