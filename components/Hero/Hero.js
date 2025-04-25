import OptimizedImage from '../media/OptimizedImage';
import { OptimizedVideo } from '../media/OptimizedVideo';

/**
 * Hero Component - Full-width hero section with support for images or videos
 * 
 * This component demonstrates co-located assets and media organization best practices
 */
export function Hero({
  media,
  title,
  subtitle,
  align = 'center',
  overlayOpacity = 50,
  height = 'lg'
}) {
  // Determine if the media is a video or image
  const isVideo = media.type === 'video';
  
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
  
  // Calculate overlay opacity
  const opacityClass = `bg-opacity-${overlayOpacity}`;

  return (
    <section className={`relative w-full ${heightClass} overflow-hidden`}>
      {/* Media background */}
      <div className="absolute inset-0 z-0">
        {isVideo ? (
          <OptimizedVideo
            id={media.id}
            options={{
              autoPlay: true,
              muted: true,
              loop: true,
              controls: false
            }}
            fallbackImageId={media.fallbackId}
            className="object-cover w-full h-full"
          />
        ) : (
          <OptimizedImage
            id={media.id}
            alt={media.alt || title}
            fill
            priority
            className="object-cover"
          />
        )}
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black to-transparent ${opacityClass}`}></div>
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