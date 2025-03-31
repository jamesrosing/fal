import React, { useState, useEffect } from 'react';
import { CldImage, CldUploadWidget } from 'next-cloudinary';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import styles from './SiteMediaManager.module.css';
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


/**
 * SiteMediaManager Component
 * 
 * A comprehensive media management component that follows Next Cloudinary best practices.
 * This component allows for:
 * - Viewing all media assets organized by section and area
 * - Uploading new media assets
 * - Replacing existing media assets
 * - Previewing media assets with optimized delivery
 * 
 * @see https://next.cloudinary.dev/ for Next Cloudinary documentation
 */
interface MediaPlaceholder {
  id: string;
  name: string;
  description: string;
  area: string;
  path: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  cloudinary: {
    optimization: {
      format: string;
      quality: string;
      fetchFormat: string;
    };
    responsive: {
      sizes: string;
      breakpoints: number[];
    };
  };
}

interface MediaSection {
  id: string;
  name: string;
  path: string;
  sections: {
    id: string;
    name: string;
    description: string;
    mediaPlaceholders: MediaPlaceholder[];
  }[];
}

interface SiteMediaManagerProps {
  mediaMap?: MediaSection[];
  onUpload?: (placeholderId: string, publicId: string) => void;
}

export const SiteMediaManager: React.FC<SiteMediaManagerProps> = ({ 
  mediaMap = [], 
  onUpload 
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<MediaPlaceholder | null>(null);

  useEffect(() => {
    // Set initial active section and area if available
    if (mediaMap.length > 0 && !activeSection) {
      setActiveSection(mediaMap[0].id);
      
      if (mediaMap[0].sections.length > 0) {
        setActiveArea(mediaMap[0].sections[0].id);
      }
    }
  }, [mediaMap, activeSection]);

  const handleUploadSuccess = (result: any, placeholderId: string) => {
    if (result.info && result.info.public_id) {
      // Call the onUpload callback with the placeholder ID and public ID
      onUpload?.(placeholderId, result.info.public_id);
    }
  };

  const getActivePlaceholders = () => {
    if (!activeSection || !activeArea) return [];
    
    const section = mediaMap.find(s => s.id === activeSection);
    if (!section) return [];
    
    const area = section.sections.find(a => a.id === activeArea);
    if (!area) return [];
    
    return area.mediaPlaceholders;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Site Media Manager</h1>
      
      <div className={styles.layout}>
        {/* Navigation */}
        <div className={styles.navigation}>
          <h2>Sections</h2>
          <ul className={styles.sectionList}>
            {mediaMap.map(section => (
              <li 
                key={section.id}
                className={`${styles.sectionItem} ${activeSection === section.id ? styles.active : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.name}
                
                {activeSection === section.id && (
                  <ul className={styles.areaList}>
                    {section.sections.map(area => (
                      <li 
                        key={area.id}
                        className={`${styles.areaItem} ${activeArea === area.id ? styles.active : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveArea(area.id);
                        }}
                      >
                        {area.name}
                        <span className={styles.count}>
                          ({area.mediaPlaceholders.length})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Media Grid */}
        <div className={styles.mediaGrid}>
          <h2>
            {activeSection && activeArea && 
              `${mediaMap.find(s => s.id === activeSection)?.name} > 
               ${mediaMap.find(s => s.id === activeSection)?.sections.find(a => a.id === activeArea)?.name}`
            }
          </h2>
          
          <div className={styles.grid}>
            {getActivePlaceholders().map(placeholder => (
              <div 
                key={placeholder.id} 
                className={styles.mediaItem}
                onClick={() => setSelectedPlaceholder(placeholder)}
              >
                <div className={styles.mediaPreview}>
                  {/* Use CldImage for optimized image delivery */}
                  <CldImage
                    width={placeholder.dimensions.width}
                    height={placeholder.dimensions.height}
                    src={placeholder.id}
                    alt={placeholder.name}
                    format="auto"
                    quality="auto"
                    placeholder="blur"
                    blurDataURL={getCloudinaryUrl(placeholder.id, { 
                      width: 10, 
                      height: Math.round(10 / placeholder.dimensions.aspectRatio) 
                    })}
                    sizes={placeholder.cloudinary.responsive.sizes}
                    className={styles.previewImage}
                  />
                </div>
                <div className={styles.mediaInfo}>
                  <h3>{placeholder.name}</h3>
                  <p>{placeholder.description}</p>
                  <p className={styles.dimensions}>
                    {placeholder.dimensions.width} × {placeholder.dimensions.height}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Detail Panel */}
        {selectedPlaceholder && (
          <div className={styles.detailPanel}>
            <button 
              className={styles.closeButton}
              onClick={() => setSelectedPlaceholder(null)}
            >
              ×
            </button>
            
            <h2>{selectedPlaceholder.name}</h2>
            <p>{selectedPlaceholder.description}</p>
            
            <div className={styles.detailPreview}>
              <CldImage
                width={selectedPlaceholder.dimensions.width}
                height={selectedPlaceholder.dimensions.height}
                src={selectedPlaceholder.id}
                alt={selectedPlaceholder.name}
                format="auto"
                quality="auto"
                className={styles.fullPreviewImage}
              />
            </div>
            
            <div className={styles.detailInfo}>
              <div className={styles.infoItem}>
                <strong>ID:</strong> {selectedPlaceholder.id}
              </div>
              <div className={styles.infoItem}>
                <strong>Path:</strong> {selectedPlaceholder.path}
              </div>
              <div className={styles.infoItem}>
                <strong>Dimensions:</strong> {selectedPlaceholder.dimensions.width} × {selectedPlaceholder.dimensions.height}
              </div>
              <div className={styles.infoItem}>
                <strong>Aspect Ratio:</strong> {selectedPlaceholder.dimensions.aspectRatio.toFixed(2)}
              </div>
            </div>
            
            <div className={styles.uploadSection}>
              <h3>Replace Image</h3>
              <CldUploadWidget
                uploadPreset="site_media"
                options={{
                  sources: ['local', 'url', 'camera'],
                  multiple: false,
                  cropping: true,
                  croppingAspectRatio: selectedPlaceholder.dimensions.aspectRatio,
                  croppingDefaultSelectionRatio: 0.8,
                  resourceType: 'image',
                  folder: `site-media/${selectedPlaceholder.path}`,
                  clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
                  maxImageFileSize: 10000000, // 10MB
                }}
                onSuccess={(result) => handleUploadSuccess(result, selectedPlaceholder.id)}
              >
                {({ open }) => (
                  <button 
                    className={styles.uploadButton}
                    onClick={() => open()}
                  >
                    Upload New Image
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 