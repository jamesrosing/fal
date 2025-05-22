import { CldVideoPlayer } from 'next-cloudinary';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface MediaVideoProps {
publicId: string;
width?: number;
height?: number;
autoPlay?: boolean;
loop?: boolean;
muted?: boolean;
controls?: boolean;
className?: string;
fallbackSrc?: string;
onLoad?: () => void;
onError?: () => void;
}

export default function MediaVideo({
publicId,
width,
height,
autoPlay = false,
loop = false,
muted = true,
controls = true,
className = '',
fallbackSrc = '/videos/placeholder.mp4',
onLoad,
onError,
...props
}: MediaVideoProps) {
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
<video
src={fallbackSrc}
className={className}
width={width}
height={height}
autoPlay={autoPlay}
loop={loop}
muted={muted}
controls={controls}
/>
);
}

return (
<>
{isLoading && (
<Skeleton
className={className}
style={width && height ? { width, height } : undefined}
/>
)}
<CldVideoPlayer
id={`video-${publicId.split('/').pop()}`}
src={formattedPublicId}
width={width || 800}
height={height || 450}
autoPlay={autoPlay}
loop={loop}
muted={muted}
controls={controls}
className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
onLoad={handleLoad}
onError={handleError}
{...props}
/>
</>
);
}