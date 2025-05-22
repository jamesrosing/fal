import { CldImage } from 'next-cloudinary';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaImageProps {
publicId: string;
alt: string;
width?: number;
height?: number;
priority?: boolean;
fill?: boolean;
sizes?: string;
className?: string;
fallbackSrc?: string;
onLoad?: () => void;
onError?: () => void;
}

export default function MediaImage({
publicId,
alt,
width,
height,
priority = false,
fill = false,
sizes = '100vw',
className = '',
fallbackSrc = '/images/placeholder.jpg',
onLoad,
onError,
...props
}: MediaImageProps) {
const [isLoading, setIsLoading] = useState(true);
const [hasError, setHasError] = useState(false);

// Handle Cloudinary public ID format
const formattedPublicId = publicId.startsWith('http')
? publicId
: publicId.replace(/^\//, ''); // Remove leading slash if present

const handleLoad = () => {
setIsLoading(false);
onLoad?.();
};

const handleError = () => {
setIsLoading(false);
setHasError(true);
onError?.();
};

if (hasError) {
return (
<img
src={fallbackSrc}
alt={alt}
className={className}
width={width}
height={height}
style={fill ? { objectFit: 'cover', position: 'absolute', width: '100%', height: '100%' } : undefined}
/>
);
}

return (
<>
{isLoading && (
<Skeleton
className={`${className} ${fill ? 'absolute inset-0' : ''}`}
style={!fill && width && height ? { width, height } : undefined}
/>
)}
<CldImage
src={formattedPublicId}
width={fill ? undefined : (width || 800)}
height={fill ? undefined : (height || 600)}
alt={alt}
priority={priority}
sizes={sizes}
className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
fill={fill}
onLoad={handleLoad}
onError={handleError}
{...props}
/>
</>
);
}