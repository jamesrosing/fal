import { SimpleHero } from '@/components/Hero/Hero';
import { MediaContentSection } from '@/components/layouts/TwoColumnLayout';
import OptimizedImage from '@/components/media/OptimizedImage';
import { OptimizedVideo } from '@/components/media/OptimizedVideo';
import { MediaRenderer } from '@/components/media/MediaRenderer';

export const metadata = {
  title: 'Media Components Example',
  description: 'Example of using the new media components following best practices',
};

export default function MediaExamplePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section using component-specific assets */}
      <SimpleHero
        title="Media Organization Best Practices"
        subtitle="Demonstrating the new media system and components"
      />
      
      {/* Two-column layout with media */}
      <MediaContentSection
        media={{
          id: 'hero-1',
          alt: 'Example media layout',
          type: 'image'
        }}
        title="Two-Column Layout"
        description="This section demonstrates using our layout component with the MediaRenderer component."
      >
        <p className="mt-4">
          The MediaRenderer component automatically determines if the content is an image or video
          based on the media type, and renders the appropriate component.
        </p>
        
        <div className="mt-6 flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Learn More
          </button>
          <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded">
            Contact Us
          </button>
        </div>
      </MediaContentSection>
      
      {/* Image Gallery Example */}
      <section className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Asset Organization Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example 1: Component-specific Image */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-64">
              <OptimizedImage
                id="component:Hero/assets/hero-background.jpg"
                alt="Component-specific asset" 
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 bg-white">
              <h3 className="font-bold mb-2">Component-Specific Asset</h3>
              <p className="text-gray-700">
                <code>component:Hero/assets/hero-background.jpg</code>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Assets co-located with the component that uses them.
              </p>
            </div>
          </div>
          
          {/* Example 2: Page-specific Image */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-64">
              <OptimizedImage
                id="page:example/hero.jpg"
                alt="Page-specific asset" 
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 bg-white">
              <h3 className="font-bold mb-2">Page-Specific Asset</h3>
              <p className="text-gray-700">
                <code>page:example/hero.jpg</code>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Assets specific to a particular page, stored in <code>/public/images/pages/example/</code>
              </p>
            </div>
          </div>
          
          {/* Example 3: Cloudinary Asset */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-64">
              <OptimizedImage
                id="services/example-service"
                alt="Cloudinary asset example" 
                fill
                className="object-cover"
                options={{
                  quality: 75,
                  width: 600
                }}
              />
            </div>
            <div className="p-4 bg-white">
              <h3 className="font-bold mb-2">Cloudinary Asset</h3>
              <p className="text-gray-700">
                <code>services/example-service</code>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Remote assets stored in Cloudinary following our folder structure.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Video Examples */}
      <section className="container mx-auto py-12 px-4 bg-gray-50">
        <h2 className="text-3xl font-bold mb-8 text-center">Video Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cloudinary Video */}
          <div className="rounded-lg overflow-hidden shadow-lg bg-white">
            <OptimizedVideo
              id="videos/backgrounds/example-video"
              options={{
                autoPlay: true,
                muted: true,
                loop: true,
                controls: true
              }}
              fallbackImageId="video-thumbnail/example-video-thumbnail"
              className="w-full aspect-video"
            />
            <div className="p-4">
              <h3 className="font-bold mb-2">Cloudinary Video</h3>
              <p className="text-gray-700">
                <code>videos/backgrounds/example-video</code>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Video stored in Cloudinary with responsive sources and fallback image.
              </p>
            </div>
          </div>
          
          {/* Local Page Video */}
          <div className="rounded-lg overflow-hidden shadow-lg bg-white">
            <OptimizedVideo
              id="page:videos/backgrounds/example-background.mp4"
              options={{
                autoPlay: true,
                muted: true,
                loop: true,
                controls: true
              }}
              className="w-full aspect-video"
            />
            <div className="p-4">
              <h3 className="font-bold mb-2">Page-Specific Video</h3>
              <p className="text-gray-700">
                <code>page:videos/backgrounds/example-background.mp4</code>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Video specific to a page, stored locally in the public folder.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Layout-Based Placement Example */}
      <section className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-black">Layout-Based Media Organization</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 border rounded-lg bg-white">
            <h3 className="text-xl font-bold mb-4 text-black">Structured Hierarchy</h3>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>Place global assets in <code>public/images/global</code></li>
              <li>Page-specific assets in <code>public/images/pages/[pageName]</code></li>
              <li>Component-specific assets in component folders</li>
              <li>Use Cloudinary for dynamic and optimized assets</li>
            </ul>
          </div>
          
          <div className="p-6 border rounded-lg bg-white">
            <h3 className="text-xl font-bold mb-4 text-black">Accessing Assets</h3>
            <ul className="list-disc list-inside space-y-2 text-black">
              <li>Component assets: <code>component:ComponentName/assets/file.jpg</code></li>
              <li>Page assets: <code>page:pageName/image.jpg</code></li>
              <li>Global assets: <code>page:global/icons/icon.svg</code></li>
              <li>Cloudinary assets: <code>folder/subfolder/assetName</code></li>
            </ul>
          </div>
        </div>
        
        <div className="p-6 border rounded-lg bg-white">
          <h3 className="text-xl font-bold mb-4 text-black">Example Layout Usage</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto text-black">
{`// In your page component
import { MediaContentSection } from '@/components/layouts/TwoColumnLayout';

export default function ServicePage() {
  return (
    <MediaContentSection
      media={{
        id: 'page:services/example-service.jpg', // Local page-specific asset
        alt: 'Our service',
        type: 'image'
      }}
      title="Our Service"
      description="Service description goes here."
      reverseLayout={true}
    >
      <button className="btn">Learn More</button>
    </MediaContentSection>
  );
}`}
          </pre>
        </div>
      </section>
    </main>
  );
} 