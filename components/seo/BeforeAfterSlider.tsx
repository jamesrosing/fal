import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

/**
 * Interactive before/after image comparison slider
 * Allows users to drag to reveal the before/after images
 */
export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = 'Before procedure',
  afterAlt = 'After procedure',
  className = '',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current || !isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(0, x), 100));
  };
  
  // Handle touch movement
  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!containerRef.current || !isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(0, x), 100));
  };
  
  // Start dragging
  const startDragging = () => {
    setIsDragging(true);
  };
  
  // Stop dragging
  const stopDragging = () => {
    setIsDragging(false);
  };
  
  // Add global event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchmove', handleTouchMove as any);
      window.addEventListener('touchend', stopDragging);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging]);
  
  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-square md:aspect-video overflow-hidden rounded-lg ${className}`}
      onMouseDown={startDragging}
      onTouchStart={startDragging}
    >
      {/* After image (bottom layer) */}
      <div className="absolute inset-0 z-10">
        <Image
          src={afterImage}
          alt={afterAlt}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
        />
      </div>
      
      {/* Before image (top layer, clipped) */}
      <div 
        className="absolute inset-0 z-20 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
        />
      </div>
      
      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white z-30 cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={startDragging}
        onTouchStart={startDragging}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
          <div className="w-4 h-4 bg-teal-600 rounded-full" />
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded z-40">
        Before
      </div>
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded z-40">
        After
      </div>
    </div>
  );
} 