"use client"

import { CldImage } from 'next-cloudinary';
import Image from 'next/image';

interface ArticleImageProps {
src: string;
alt: string;
width?: number;
height?: number;
priority?: boolean;
sizes?: string;
className?: string;
fill?: boolean;
}

export default function ArticleImage({
src,
alt,
width,
height,
priority = false,
sizes = '100vw',
className = '',
fill = false,
...props
}: ArticleImageProps) {
// Check if it's a Cloudinary URL
const isCloudinaryUrl = src?.includes('res.cloudinary.com');

// Extract public ID if it's a Cloudinary URL
const getPublicId = (url: string) => {
if (!url) return '';
const match = url.match(/\/v\d+\/(.+?)(?:\.[^.]+)?$/);
return match ? match[1] : url;
};

if (isCloudinaryUrl) {
return (
<CldImage
src={getPublicId(src)}
width={width || (fill ? undefined : 800)}
height={height || (fill ? undefined : 600)}
alt={alt}
priority={priority}
sizes={sizes}
className={className}
format="auto"
quality="auto"
fill={fill}
{...props}
/>
);
}

// Fallback to regular Next Image
return (
<Image
src={src}
alt={alt}
width={width}
height={height}
priority={priority}
sizes={sizes}
className={className}
fill={fill}
{...props}
/>
);
}