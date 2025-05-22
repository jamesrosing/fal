import { MediaRenderer } from '../media/MediaRenderer';

/**
 * TwoColumnLayout - A reusable layout component with a media column and a content column
 * 
 * @param {Object} props
 * @param {Object} props.leftMedia - Media object with id and alt properties
 * @param {React.ReactNode} props.rightContent - Content to display in the right column
 * @param {boolean} props.reverseOnMobile - Whether to reverse the column order on mobile
 * @param {string} props.className - Additional class names
 */
export function TwoColumnLayout({ 
  leftMedia, 
  rightContent,
  reverseOnMobile = false,
  className = ''
}) {
  // Determine classes for mobile ordering
  const leftColClass = reverseOnMobile ? 'order-2 md:order-1' : 'order-1';
  const rightColClass = reverseOnMobile ? 'order-1 md:order-2' : 'order-2';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 ${className}`}>
      <div className={`col-span-1 relative min-h-[300px] md:min-h-[400px] ${leftColClass}`}>
        <MediaRenderer 
          id={leftMedia.id} 
          alt={leftMedia.alt || 'Column image'} 
          fill={true}
          className="object-cover rounded-lg"
          imageOptions={{
            quality: 85
          }}
        />
      </div>
      <div className={`col-span-1 flex flex-col justify-center ${rightColClass}`}>
        {rightContent}
      </div>
    </div>
  );
}

/**
 * MediaContentSection - A full-width section with media and content in a two-column layout
 */
export function MediaContentSection({
  media,
  title,
  description,
  children,
  reverseLayout = false,
  className = ''
}) {
  return (
    <section className={`container mx-auto py-12 px-4 ${className}`}>
      <TwoColumnLayout
        leftMedia={media}
        reverseOnMobile={reverseLayout}
        rightContent={
          <div className="space-y-4">
            {title && <h2 className="text-3xl font-bold">{title}</h2>}
            {description && <p className="text-lg text-gray-700">{description}</p>}
            {children}
          </div>
        }
      />
    </section>
  );
}

export default TwoColumnLayout; 