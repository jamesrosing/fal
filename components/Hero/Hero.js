import { MediaRenderer } from '../media/MediaRenderer';

/**
 * Hero Component - Full-width hero section with support for images or videos
 * 
 * This component demonstrates co-located assets and media organization best practices
 */
export function Hero({
  media, // Expected: { id: string, type: 'image' | 'video', alt?: string, fallbackId?: string }
  title,
  subtitle,
  align = 'center',
  overlayOpacity = 50,
  height = 'lg'
}) {
  // Determine if the media is a video or image - No longer needed with MediaRenderer
  // const isVideo = media.type === 'video';
  
  // Calculate height class based on size prop
  const heightClass = {
    'sm': 'h-[300px] md:h-[400px]',
    'md': 'h-[400px] md:h-[500px]',
    'lg': 'h-[500px] md:h-[600px]',
    'xl': 'h-[600px] md:h-[80vh]',
    'full': 'h-screen'
  }[height] || 'h-[500px] md:h-[600px]';
  
  // Calculate text alignment classes
  const alignmentClass = {
    'left': 'text-left items-start',
    'center': 'text-center items-center',
    'right': 'text-right items-end'
  }[align] || 'text-center items-center';
  
  // Calculate overlay opacity - Ensure template literal is correct
  const opacityValue = Math.min(100, Math.max(0, overlayOpacity)); // Clamp between 0-100
  const opacityStyle = { backgroundColor: `rgba(0, 0, 0, ${opacityValue / 100})` }; 

  return (
    <section className={`relative w-full ${heightClass} overflow-hidden`}>
      {/* Media background using MediaRenderer */}
      <div className="absolute inset-0 z-0">
        <MediaRenderer
          placeholderId={media.id}
          // Image specific props
          alt={media.alt || title}
          fill // Ensures the media covers the container
          priority // Assume hero media is high priority
          // Video specific props
          posterPlaceholderId={media.fallbackId} // Map fallbackId to poster
          options={{
             autoPlay: true,
             muted: true,
             loop: true,
             controls: false,
             // Add other necessary video options if needed
          }}
          // Common props
          className="object-cover w-full h-full" // Class for sizing/fitting
          // Pass width/height if needed for non-fill scenarios, but fill=true covers this
        />
        
        {/* Gradient overlay using inline style for dynamic opacity */}
        <div 
           className="absolute inset-0 bg-gradient-to-t from-black to-transparent"
           style={opacityStyle} // Apply calculated opacity
        ></div>
      </div>
      
      {/* Content */}
      <div className={`relative z-10 container mx-auto px-4 h-full flex flex-col justify-center ${alignmentClass}`}>
        {title && (
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {title}
          </h1>
        )}
        
        {subtitle && (
          <p className="text-xl md:text-2xl text-white max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * SimpleHero - A simplified hero with a local component asset
 * This demonstrates using component-specific assets from the assets folder
 */
export function SimpleHero({ title, subtitle }) {
  return (
    <Hero
      media={{
        // Use a component-specific asset reference pattern
        id: 'component:Hero/assets/hero-background.jpg',
        alt: title,
        type: 'image'
      }}
      title={title}
      subtitle={subtitle}
    />
  );
}

export default Hero; 