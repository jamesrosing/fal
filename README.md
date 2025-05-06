# Allure MD - Advanced Aesthetic Medicine Website

## Features

- Responsive design for desktop and mobile devices
- Dynamic navigation menu with dropdown functionality
- Hero section with background video
- Dark mode support (default)
- Smooth scrolling and animations
- Accessible design with proper ARIA attributes
- Adobe Typekit font integration (Miller Text, Lorimer No 2, Figgins Sans)

## Tech Stack

- Next.js 13+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Radix UI for accessible component primitives
- Lucide React for icons
- next-themes for dark mode support
- Adobe Typekit fonts

## Setup Instructions

1. Clone the repository:


## Font Usage

The application uses Adobe Typekit fonts:
- Miller Text (serif)
- Lorimer No 2 (sans-serif)
- Figgins Sans (sans-serif)

These fonts are loaded through Adobe Typekit's CDN and are configured in the Tailwind CSS configuration. You can use them with the following utility classes:
- `font-miller` - Miller Text
- `font-lorimer` - Lorimer No 2
- `font-figgins` - Figgins Sans

The default sans-serif font is set to Figgins Sans, and the default serif font is set to Miller Text.

## Media Optimization

### Cloudinary Integration

We've implemented an optimized Cloudinary integration that provides:

- **Consistent URL Generation**: Unified approach to generating Cloudinary URLs
- **Optimized Components**: Improved CloudinaryImage and CloudinaryVideo components with error handling and performance optimizations
- **SEO Enhancements**: Schema.org structured data for images and practice information
- **Better Error Handling**: Smart retry logic and graceful fallbacks
- **Responsive Design**: Optimized loading for different devices and screen sizes

See [docs/cloudinary-optimization.md](docs/cloudinary-optimization.md) for full implementation details.

```jsx
// Example usage
import CloudinaryImage from '@/components/media/CloudinaryImage';
import CloudinaryVideo from '@/components/media/CloudinaryVideo';

// Image with area preset
<CloudinaryImage 
  publicId="hero/main-image" 
  area="hero"
  alt="Hero image" 
  priority={true}
/>

// Video with multiple formats
<CloudinaryVideo 
  publicId="videos/hero-video" 
  formats={['mp4', 'webm']}
  autoPlay
  loop
  muted
/>
```

## Adding Video Content

To display the background video in the hero section:

1. Prepare your video in WebM and MP4 formats.
2. Name them `background-video.webm` and `background-video.mp4`.
3. Place these files in the `public` directory.
4. Add a poster image named `video-poster.jpg` in the `public` directory.

## Customizing Content

- Update navigation menu items in `components/nav-bar.tsx`
- Modify hero section content in `components/hero.tsx`
- Add new pages in the `app` directory

## Deployment

1. Push your code to a GitHub repository.
2. Import the project in your Vercel dashboard.
3. Vercel will automatically set up the build configuration.
4. Deploy!

## Contributing

Contributions are welcome! Please submit a Pull Request.

## License

This project is licensed under the MIT License.

Note: The application uses dark mode by default. To change this, modify the `defaultTheme` prop in `app/layout.tsx`.

