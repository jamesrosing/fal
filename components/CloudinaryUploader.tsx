'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  initUploadWidget, 
  UploadWidgetOptions,
  ImageArea,
  CloudinaryAsset
} from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


export interface CloudinaryUploaderProps {
  onSuccess?: (result: CloudinaryAsset | CloudinaryAsset[]) => void;
  onFailure?: (error: any) => void;
  onClose?: () => void;
  area?: ImageArea;
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
  collections?: string[];
  multiple?: boolean;
  maxFiles?: number;
  resourceType?: 'image' | 'video' | 'auto' | 'raw';
  cropping?: boolean;
  croppingAspectRatio?: number;
  buttonLabel?: string;
  buttonClassName?: string;
  autoOpen?: boolean;
  children?: React.ReactNode;
  description?: string;
  useUploadPreset?: boolean;
  uploadPreset?: string;
  showAdvancedOptions?: boolean;
  sources?: Array<'local' | 'url' | 'camera' | 'google_drive' | 'dropbox' | 'instagram' | 'shutterstock'>;
  mediaType?: 'image' | 'video';
}

/**
 * Enhanced CloudinaryUploader component that provides media upload with advanced organizational features
 * 
 * @example
 * // Basic usage
 * <CloudinaryUploader onSuccess={(asset) => console.log(asset)} />
 * 
 * // With advanced organization
 * <CloudinaryUploader 
 *   area="team"
 *   folder="team/headshots/2023"
 *   tags={["team", "headshot", "staff", "featured"]}
 *   context={{
 *     alt: "Team member portrait",
 *     name: "Jane Smith",
 *     role: "CEO",
 *     department: "Executive"
 *   }}
 *   collections={["Team Members", "Website Assets"]}
 *   cropping={true}
 *   croppingAspectRatio={3/4}
 *   onSuccess={handleSuccess}
 * />
 */
export function CloudinaryUploader({
  onSuccess,
  onFailure,
  onClose,
  area,
  folder,
  tags = [],
  context = {},
  collections = [],
  multiple = false,
  maxFiles = 1,
  resourceType = 'image',
  cropping = false,
  croppingAspectRatio,
  buttonLabel = 'Upload',
  buttonClassName = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
  autoOpen = false,
  children,
  description,
  useUploadPreset = false,
  uploadPreset,
  showAdvancedOptions = false,
  sources = ['local', 'url', 'camera', 'google_drive', 'dropbox'],
  mediaType = 'image'
}: CloudinaryUploaderProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedAssets, setUploadedAssets] = useState<CloudinaryAsset[]>([]);

  // Load the Cloudinary Upload Widget script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.body.appendChild(script);
    } else if (typeof window !== 'undefined' && window.cloudinary) {
      setIsScriptLoaded(true);
    }
  }, []);

  // Auto-open widget when requested
  useEffect(() => {
    if (autoOpen && isScriptLoaded && !isOpen) {
      openWidget();
    }
  }, [autoOpen, isScriptLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Process results from upload widget
  const processResults = useCallback(async (error: any, result: any) => {
    if (error) {
      console.error('Cloudinary Upload Widget error:', error);
      if (onFailure) onFailure(error);
      return;
    }

    if (result.event === 'success') {
      console.log('Cloudinary Upload success:', result.info);
      
      // Create structured asset object
      const asset: CloudinaryAsset = {
        publicId: result.info.public_id,
        area: area || 'gallery',
        width: result.info.width,
        height: result.info.height,
        format: result.info.format,
        resourceType: result.info.resource_type,
        tags: result.info.tags || [],
        context: result.info.context || context
      };
      
      // Add asset to tracked uploads
      setUploadedAssets(prev => [...prev, asset]);
      
      // Add to collections if specified
      if (collections.length > 0 && typeof window !== 'undefined') {
        try {
          // Log collection information for debugging
          console.log('Adding to collections:', collections);
          console.log('Asset public ID:', asset.publicId);
          
          // Add to collections via API
          const response = await fetch('/api/cloudinary/organize', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              publicId: asset.publicId,
              collections: collections,
              tag: asset.tags && asset.tags.length > 0 ? asset.tags[0] : undefined,
              folder: folder || undefined
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error adding to collection:', errorData);
          } else {
            console.log('Successfully added to collections');
          }
        } catch (err) {
          console.error('Error adding to collection:', err);
        }
      }
      
      // Call success callback with single asset or accumulated assets
      if (onSuccess) {
        if (multiple) {
          onSuccess([...uploadedAssets, asset]);
        } else {
          onSuccess(asset);
        }
      }
    } else if (result.event === 'queues-end') {
      // All uploads finished
      console.log('All uploads completed');
    } else if (result.event === 'close') {
      console.log('Cloudinary Upload Widget closed');
      setIsOpen(false);
      if (onClose) onClose();
    }
  }, [area, multiple, onSuccess, onFailure, onClose, uploadedAssets, collections, folder, context]);

  // Open the upload widget
  const openWidget = useCallback(() => {
    if (!isScriptLoaded) {
      console.warn('Cloudinary Upload Widget script is not loaded yet');
      return;
    }

    console.log('Opening Cloudinary upload widget...');

    // Prepare context metadata as string
    const contextString = Object.entries(context)
      .map(([key, value]) => `${key}=${value}`)
      .join('|');

    // Combine area-specific tags with custom tags
    const combinedTags = [...tags];
    if (area && !tags.includes(area)) {
      combinedTags.push(area);
    }

    // Generate folder path with area prefix if needed
    let folderPath = folder || '';
    if (area && !folderPath.startsWith(area + '/') && !folderPath.includes('/')) {
      folderPath = area ? `${area}/${folderPath}` : folderPath;
    }

    // Configure widget options
    const options: UploadWidgetOptions = {
      folder: folderPath,
      tags: combinedTags,
      context: contextString || undefined,
      resourceType: mediaType,
      multiple,
      maxFiles,
      cropping,
      croppingAspectRatio,
      sources,
      defaultSource: 'local',
      showAdvancedOptions,
      // If upload preset specified, use it instead of unsigned
      ...(useUploadPreset ? { uploadPreset, useUploadPreset: true } : { useUploadPreset: false }),
      // Allow only appropriate file types
      allowedFormats: mediaType === 'video' 
        ? ['mp4', 'webm', 'mov'] 
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    };

    console.log('Widget configuration:', {
      useUploadPreset, 
      uploadPreset: useUploadPreset ? uploadPreset : 'Not using upload preset', 
      folder: folderPath,
      tags: combinedTags
    });

    setIsOpen(true);
    setUploadedAssets([]);
    
    try {
      initUploadWidget(options, processResults);
      console.log('Widget initialized successfully');
    } catch (error) {
      console.error('Failed to initialize upload widget:', error);
      if (onFailure) onFailure({error: 'Failed to initialize upload widget'});
    }
  }, [
    isScriptLoaded, area, folder, tags, context, resourceType, 
    multiple, maxFiles, cropping, croppingAspectRatio, processResults,
    useUploadPreset, uploadPreset, showAdvancedOptions, sources, onFailure, mediaType
  ]);

  return (
    <div className="w-full">
      {description && (
        <div className="flex items-center mb-2 text-sm text-gray-500">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 mr-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>{description}</span>
        </div>
      )}
      
      {children ? (
        <div onClick={openWidget} className="inline-block cursor-pointer">
          {children}
        </div>
      ) : (
        <Button
          onClick={openWidget}
          className={buttonClassName}
          disabled={!isScriptLoaded}
        >
          {buttonLabel || `Upload ${mediaType === 'video' ? 'Video' : 'Image'}`}
        </Button>
      )}
    </div>
  );
}

export default CloudinaryUploader; 