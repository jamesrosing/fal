# Media Reference Guide

This guide provides a reference for all media assets in the project and how to use them in components.

## Available Media Assets

| ID | Cloudinary Path | Type |
|-----|---------------|------|


## Usage Examples

### Using with CloudinaryImage Component

```jsx
import { CloudinaryImage } from '@/components/media/CloudinaryMedia';

// Example usage
<CloudinaryImage
  id="fal/pages/services/plastic-surgery/body/tummy-tuck"
  alt="Tummy Tuck Procedure"
  fill
  width={800}
  height={600}
  className="object-cover"
  sizes="100vw"
/>
```

### Using with CloudinaryVideo Component

```jsx
import { CloudinaryVideo } from '@/components/media/CloudinaryMedia';

// Example usage
<CloudinaryVideo
  id="fal/videos/backgrounds/hero-video"
  width={1920}
  height={1080}
  autoPlay
  muted
  loop
  className="w-full h-full object-cover"
/>
```
