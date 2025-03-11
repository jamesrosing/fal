"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';
import { 
  CloudinaryAsset 
} from '@/lib/cloudinary';

// Style for the directory structure
const directoryStyles = {
  container: "border border-gray-700 rounded-md overflow-hidden mb-4",
  header: "bg-gray-900 px-4 py-3 font-medium flex items-center justify-between text-white border-b border-gray-700",
  folderIcon: "mr-2 text-yellow-500",
  content: "pl-0 bg-gray-950 text-white",
  item: "border-t border-gray-800 px-4 py-2 flex items-center",
  folderItem: "text-white hover:bg-gray-800 cursor-pointer",
  placeholder: "flex items-center justify-between w-full py-1.5",
  indentedContent: "pl-6",
  fileIcon: "mr-2 text-gray-400",
  fileText: "text-sm font-mono text-white",
  cloudinaryId: "ml-2 text-xs text-gray-400",
  replaceButton: "ml-auto px-3 py-1 text-xs bg-gray-800 text-white rounded-md border border-gray-600 hover:bg-gray-700"
};

// Add these FolderIcon and FileIcon components inside the component but before the return
const FolderIcon = () => (
  <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
    />
  </svg>
);

const FileIcon = () => (
  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
    />
  </svg>
);

// Add MediaAsset interface
interface MediaAsset {
  placeholder_id: string;
  cloudinary_id: string;
  uploaded_at: string;
  uploaded_by: string;
  metadata: Record<string, any>;
}

export default function MediaLibraryAdmin() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  
  // Add form state and creation function
  const [newPlaceholder, setNewPlaceholder] = useState({
    page: "global",
    section: "",
    element: ""
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Add search state near the top of the component
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add a state variable for migration mode
  const [showMigrationTool, setShowMigrationTool] = useState(false);
  const [migrationPlan, setMigrationPlan] = useState<{original: string, proposed: string, cloudinary_id: string}[]>([]);
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  
  // Cloudinary modal state
  const [cloudinaryModalOpen, setCloudinaryModalOpen] = useState(false);
  const [selectedPlaceholderId, setSelectedPlaceholderId] = useState<string | null>(null);
  
  // Add state for sidebar and content view
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchTerm && mediaAssets.length > 0) {
      // Get all category keys from the structure
      const allCategories: Record<string, boolean> = {};
      const addCategories = (obj: any, prefix = '') => {
        Object.keys(obj).forEach(key => {
          const fullKey = prefix ? `${prefix}-${key}` : key;
          allCategories[fullKey] = true;
          if (obj[key].children) {
            addCategories(obj[key].children, fullKey);
          }
        });
      };
      
      addCategories(organizeMediaAssets(mediaAssets));
      setExpandedCategories(allCategories);
    }
  }, [searchTerm, mediaAssets]);

  // Function to handle media selection from Cloudinary
  const handleMediaSelect = async (cloudinaryId: string) => {
    if (!selectedPlaceholderId) return;
    
    try {
      const response = await fetch('/api/site/media-assets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeholder_id: selectedPlaceholderId,
          cloudinary_id: cloudinaryId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the media assets list
      fetchMediaAssets();
      
      // Close the modal
      setCloudinaryModalOpen(false);
      setSelectedPlaceholderId(null);
    } catch (err) {
      setError(`Error updating media asset: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Move fetchMediaAssets outside of useEffect to make it accessible
  async function fetchMediaAssets() {
    try {
      const response = await fetch('/api/media/assets');
      const data = await response.json();
      
      if (data.mediaAssets) {
        setMediaAssets(data.mediaAssets);
      } else {
        setError('No media assets found');
      }
    } catch (error: any) {
      console.error('Error fetching media assets:', error);
      setError(`Error fetching media assets: ${error.message}`);
    }
  }

  // Add useEffect to fetch media assets on component mount
  useEffect(() => {
    fetchMediaAssets();
  }, []);
  
  // Handle Media Library selection with better error handling and feedback
  const handleMediaLibrarySelection = async (data: any) => {
    if (!data || !data.assets || data.assets.length === 0) {
      console.error('No assets selected from Media Library');
      return;
    }

    try {
      // Get the first selected asset
      const asset = data.assets[0];
      console.log('Selected asset from Media Library:', asset);

      // Create a modal to let users select which placeholder to assign this to
      // For now, we'll just show a dialog where user can select from a dropdown
      const placeholderId = prompt(
        `Assign "${asset.public_id}" to which placeholder location?`,
        ""
      );

      if (!placeholderId) {
        console.log('Assignment canceled');
        return;
      }

      // Update database mapping
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeholderId,
          publicId: asset.public_id,
          metadata: {
            format: asset.format,
            resource_type: asset.resource_type,
            secure_url: asset.secure_url,
            width: asset.width,
            height: asset.height,
            bytes: asset.bytes,
            created_at: asset.created_at || new Date().toISOString(),
            tags: asset.tags || []
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update media asset: ${response.statusText}`);
      }

      // Show success message
      alert(`Successfully assigned "${asset.public_id}" to ${placeholderId}`);
      
      // Refresh the page or update state as needed
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating media assignment:', error);
      alert(`Error assigning media: ${error.message}`);
    }
  };
  
  // Function to initialize the Cloudinary Media Library widget
  const openMediaLibrary = () => {
    if (typeof window === 'undefined' || !window.cloudinary) {
      setError('Cloudinary script not loaded');
      return;
    }
    
    try {
      // Get environment variables
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      
      if (!cloudName || !apiKey) {
        setError('Missing Cloudinary credentials. Check your .env.local file.');
        console.error('Missing Cloudinary credentials. Make sure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY are set in .env.local');
        return;
      }
      
      // Configure and open the Media Library widget
      const mediaLibrary = window.cloudinary.createMediaLibrary(
        {
          cloud_name: cloudName,
          api_key: apiKey,
          folder_mode: true, // Show folder hierarchy
          multiple: false,
          insert_caption: 'Select',
          default_transformations: [
            [{ quality: 'auto', fetch_format: 'auto' }]
          ],
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#0078FF',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#0078FF',
              action: '#FF620C',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1'
            }
          }
        },
        {
          // Updated insertHandler to use our new function
          insertHandler: handleMediaLibrarySelection,
          showHandler: () => console.log('Media Library opened'),
          hideHandler: () => console.log('Media Library closed')
        }
      );
      
      // Open the widget
      mediaLibrary.show();
      
    } catch (err) {
      console.error('Error opening Media Library:', err);
      setError('Error opening Media Library. See console for details.');
    }
  };
  
  // Once the script is loaded
  useEffect(() => {
    if (scriptLoaded) {
      console.log('Cloudinary Media Library script loaded');
    }
  }, [scriptLoaded]);
  
  // Add function to open Media Library for a specific placeholder
  const openMediaLibraryForPlaceholder = (placeholderId: string) => {
    if (typeof window === 'undefined' || !window.cloudinary) {
      setError('Cloudinary script not loaded');
      return;
    }
    
    try {
      // Get environment variables
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      
      if (!cloudName || !apiKey) {
        setError('Missing Cloudinary credentials. Check your .env.local file.');
        console.error('Missing Cloudinary credentials. Make sure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY are set in .env.local');
        return;
      }
      
      // Configure and open the Media Library widget for a specific placeholder
      const mediaLibrary = window.cloudinary.createMediaLibrary(
        {
          cloud_name: cloudName,
          api_key: apiKey,
          folder_mode: true,
          multiple: false,
          insert_caption: 'Select',
          default_transformations: [
            [{ quality: 'auto', fetch_format: 'auto' }]
          ],
          // Same styles as before
        },
        {
          insertHandler: (data: any) => {
            if (!data || !data.assets || data.assets.length === 0) {
              console.error('No assets selected from Media Library');
              return;
            }
            
            try {
              // Get the first selected asset
              const asset = data.assets[0];
              console.log('Selected asset from Media Library:', asset);
              
              // Here we already know which placeholder to assign to
              updateMediaAssignment(placeholderId, asset);
            } catch (error: any) {
              console.error('Error handling Media Library selection:', error);
              alert(`Error: ${error.message}`);
            }
          },
          showHandler: () => console.log('Media Library opened for placeholder:', placeholderId),
          hideHandler: () => console.log('Media Library closed')
        }
      );
      
      // Open the widget
      mediaLibrary.show();
      
    } catch (err: any) {
      console.error('Error opening Media Library:', err);
      setError(`Error opening Media Library: ${err.message}`);
    }
  };
  
  // Add helper function to update media assignment
  const updateMediaAssignment = async (placeholderId: string, asset: any) => {
    try {
      // Update database mapping
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeholderId,
          publicId: asset.public_id,
          metadata: {
            format: asset.format,
            resource_type: asset.resource_type,
            secure_url: asset.secure_url,
            width: asset.width,
            height: asset.height,
            bytes: asset.bytes,
            created_at: asset.created_at || new Date().toISOString(),
            tags: asset.tags || []
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update media asset: ${response.statusText}`);
      }
      
      // Show success message
      alert(`Successfully assigned "${asset.public_id}" to ${placeholderId}`);
      
      // Refresh the page
      window.location.reload();
    } catch (error: any) {
      console.error('Error updating media assignment:', error);
      alert(`Error assigning media: ${error.message}`);
    }
  };
  
  // Add a function to organize media assets by actual application structure
  const organizeMediaAssets = (assets: MediaAsset[]) => {
    // Create a hierarchical structure that mimics the file system
    const structure = {
      "homepage": {
        label: "Homepage",
        items: [] as MediaAsset[],
        children: {
          "hero": {
            label: "Hero",
            items: [] as MediaAsset[]
          },
          "mission-section": {
            label: "Mission Section",
            items: [] as MediaAsset[],
            children: {
              "background": {
                label: "Background",
                items: [] as MediaAsset[]
              }
            }
          },
          "plastic-surgery-section": {
            label: "Plastic Surgery Section",
            items: [] as MediaAsset[],
            children: {
              "background": {
                label: "Background",
                items: [] as MediaAsset[]
              }
            }
          },
          "dermatology-section": {
            label: "Dermatology Section",
            items: [] as MediaAsset[],
            children: {
              "background": {
                label: "Background",
                items: [] as MediaAsset[]
              }
            }
          },
          "medical-spa-section": {
            label: "Medical Spa Section",
            items: [] as MediaAsset[],
            children: {
              "background": {
                label: "Background",
                items: [] as MediaAsset[]
              }
            }
          },
          "functional-medicine-section": {
            label: "Functional Medicine Section",
            items: [] as MediaAsset[],
            children: {
              "background": {
                label: "Background",
                items: [] as MediaAsset[]
              }
            }
          },
          "team-section": {
            label: "Team Section",
            items: [] as MediaAsset[],
            children: {
              "background": {
                label: "Background",
                items: [] as MediaAsset[]
              }
            }
          },
          "about-section": {
            label: "About Section",
            items: [] as MediaAsset[],
            children: {
              "background": {
                label: "Background",
                items: [] as MediaAsset[]
              }
            }
          },
          "articles-section": {
            label: "Articles Section",
            items: [] as MediaAsset[]
          }
        }
      },
      "about": {
        label: "About Pages",
        items: [] as MediaAsset[],
        children: {
          "hero": {
            label: "Hero",
            items: [] as MediaAsset[]
          },
          "mission": {
            label: "Mission",
            items: [] as MediaAsset[]
          },
          "team": {
            label: "Team",
            items: [] as MediaAsset[]
          }
        }
      },
      "services": {
        label: "Services",
        items: [] as MediaAsset[],
        children: {
          "plastic-surgery": {
            label: "Plastic Surgery",
            items: [] as MediaAsset[],
            children: {
              "hero": {
                label: "Hero",
                items: [] as MediaAsset[]
              },
              "procedures": {
                label: "Procedures",
                items: [] as MediaAsset[]
              }
            }
          },
          "dermatology": {
            label: "Dermatology",
            items: [] as MediaAsset[],
            children: {
              "hero": {
                label: "Hero",
                items: [] as MediaAsset[]
              },
              "treatments": {
                label: "Treatments",
                items: [] as MediaAsset[]
              }
            }
          },
          "medical-spa": {
            label: "Medical Spa",
            items: [] as MediaAsset[],
            children: {
              "hero": {
                label: "Hero",
                items: [] as MediaAsset[]
              },
              "treatments": {
                label: "Treatments",
                items: [] as MediaAsset[]
              }
            }
          },
          "functional-medicine": {
            label: "Functional Medicine",
            items: [] as MediaAsset[],
            children: {
              "hero": {
                label: "Hero",
                items: [] as MediaAsset[]
              },
              "treatments": {
                label: "Treatments",
                items: [] as MediaAsset[]
              }
            }
          }
        }
      },
      "components": {
        label: "Shared Components",
        items: [] as MediaAsset[],
        children: {
          "sections": {
            label: "Sections",
            items: [] as MediaAsset[],
            children: {
              "about-section": {
                label: "About Section",
                items: [] as MediaAsset[]
              },
              "team-section": {
                label: "Team Section",
                items: [] as MediaAsset[]
              },
              "dermatology-section": {
                label: "Dermatology Section",
                items: [] as MediaAsset[]
              },
              "plastic-surgery-section": {
                label: "Plastic Surgery Section",
                items: [] as MediaAsset[]
              },
              "medical-spa-section": {
                label: "Medical Spa Section",
                items: [] as MediaAsset[]
              },
              "functional-medicine-section": {
                label: "Functional Medicine Section",
                items: [] as MediaAsset[]
              }
            }
          },
          "ui": {
            label: "UI Elements",
            items: [] as MediaAsset[]
          },
          "layout": {
            label: "Layout",
            items: [] as MediaAsset[]
          }
        }
      },
      "team": {
        label: "Team",
        items: [] as MediaAsset[]
      },
      "articles": {
        label: "Articles",
        items: [] as MediaAsset[]
      },
      "gallery": {
        label: "Gallery",
        items: [] as MediaAsset[]
      },
      "out-of-town": {
        label: "Out of Town",
        items: [] as MediaAsset[],
        children: {
          "hero": {
            label: "Hero",
            items: [] as MediaAsset[]
          },
          "accommodations": {
            label: "Accommodations",
            items: [] as MediaAsset[],
            children: {
              "pendry": {
                label: "Pendry",
                items: [] as MediaAsset[]
              },
              "pelican-hill": {
                label: "Pelican Hill",
                items: [] as MediaAsset[]
              },
              "lido-house": {
                label: "Lido House",
                items: [] as MediaAsset[]
              }
            }
          }
        }
      },
      "financing": {
        label: "Financing",
        items: [] as MediaAsset[]
      },
      "contact": {
        label: "Contact",
        items: [] as MediaAsset[]
      },
      "global": {
        label: "Global Elements",
        items: [] as MediaAsset[],
        children: {
          "logo": {
            label: "Logo",
            items: [] as MediaAsset[]
          },
          "icons": {
            label: "Icons",
            items: [] as MediaAsset[]
          },
          "backgrounds": {
            label: "Backgrounds",
            items: [] as MediaAsset[]
          }
        }
      },
      "misc": {
        label: "Miscellaneous",
        items: [] as MediaAsset[]
      }
    };

    // Function to place an asset in the structure
    const placeAsset = (asset: MediaAsset) => {
      const id = asset.placeholder_id.toLowerCase();
      const parts = id.split('-');
      
      // Try to match by specific patterns and place in the structure
      // Homepage sections
      if (id.match(/^home-hero/) || id === 'hero-home') {
        structure.homepage.children.hero.items.push(asset);
      }
      else if (id.match(/^home-mission/) || id.match(/^mission-section/)) {
        if (id.includes('background')) {
          structure.homepage.children["mission-section"].children.background.items.push(asset);
        } else {
          structure.homepage.children["mission-section"].items.push(asset);
        }
      }
      else if (id.match(/^home-plastic-surgery/) || id.match(/^plastic-surgery-section/)) {
        if (id.includes('background')) {
          structure.homepage.children["plastic-surgery-section"].children.background.items.push(asset);
        } else {
          structure.homepage.children["plastic-surgery-section"].items.push(asset);
        }
      }
      else if (id.match(/^home-dermatology/) || id.match(/^dermatology-section/)) {
        if (id.includes('background')) {
          structure.homepage.children["dermatology-section"].children.background.items.push(asset);
        } else {
          structure.homepage.children["dermatology-section"].items.push(asset);
        }
      }
      else if (id.match(/^home-medical-spa/) || id.match(/^medical-spa-section/)) {
        if (id.includes('background')) {
          structure.homepage.children["medical-spa-section"].children.background.items.push(asset);
        } else {
          structure.homepage.children["medical-spa-section"].items.push(asset);
        }
      }
      else if (id.match(/^home-functional-medicine/) || id.match(/^functional-medicine-section/)) {
        if (id.includes('background')) {
          structure.homepage.children["functional-medicine-section"].children.background.items.push(asset);
        } else {
          structure.homepage.children["functional-medicine-section"].items.push(asset);
        }
      }
      else if (id.match(/^home-team/) || id.match(/^team-section/)) {
        if (id.includes('background')) {
          structure.homepage.children["team-section"].children.background.items.push(asset);
        } else {
          structure.homepage.children["team-section"].items.push(asset);
        }
      }
      else if (id.match(/^home-about/) || id.match(/^about-section/)) {
        if (id.includes('background')) {
          structure.homepage.children["about-section"].children.background.items.push(asset);
        } else {
          structure.homepage.children["about-section"].items.push(asset);
        }
      }
      else if (id.match(/^home-articles/) || id.match(/^articles-section/)) {
        structure.homepage.children["articles-section"].items.push(asset);
      }
      // About page
      else if (id.match(/^about-hero/)) {
        structure.about.children.hero.items.push(asset);
      }
      else if (id.match(/^about-mission/)) {
        structure.about.children.mission.items.push(asset);
      }
      else if (id.match(/^about-team/)) {
        structure.about.children.team.items.push(asset);
      }
      else if (id.match(/^about/)) {
        structure.about.items.push(asset);
      }
      // Services and sub-pages
      else if (id.match(/^services-plastic-surgery-hero/)) {
        structure.services.children["plastic-surgery"].children.hero.items.push(asset);
      }
      else if (id.match(/^services-plastic-surgery-procedures/)) {
        structure.services.children["plastic-surgery"].children.procedures.items.push(asset);
      }
      else if (id.match(/^services-plastic-surgery/)) {
        structure.services.children["plastic-surgery"].items.push(asset);
      }
      else if (id.match(/^services-dermatology-hero/)) {
        structure.services.children.dermatology.children.hero.items.push(asset);
      }
      else if (id.match(/^services-dermatology-treatments/)) {
        structure.services.children.dermatology.children.treatments.items.push(asset);
      }
      else if (id.match(/^services-dermatology/)) {
        structure.services.children.dermatology.items.push(asset);
      }
      else if (id.match(/^services-medical-spa-hero/)) {
        structure.services.children["medical-spa"].children.hero.items.push(asset);
      }
      else if (id.match(/^services-medical-spa-treatments/)) {
        structure.services.children["medical-spa"].children.treatments.items.push(asset);
      }
      else if (id.match(/^services-medical-spa/)) {
        structure.services.children["medical-spa"].items.push(asset);
      }
      else if (id.match(/^services-functional-medicine-hero/)) {
        structure.services.children["functional-medicine"].children.hero.items.push(asset);
      }
      else if (id.match(/^services-functional-medicine-treatments/)) {
        structure.services.children["functional-medicine"].children.treatments.items.push(asset);
      }
      else if (id.match(/^services-functional-medicine/)) {
        structure.services.children["functional-medicine"].items.push(asset);
      }
      else if (id.match(/^services/)) {
        structure.services.items.push(asset);
      }
      // Components
      else if (id.includes('about-section')) {
        structure.components.children.sections.children["about-section"].items.push(asset);
      }
      else if (id.includes('team-section')) {
        structure.components.children.sections.children["team-section"].items.push(asset);
      }
      else if (id.includes('dermatology-section')) {
        structure.components.children.sections.children["dermatology-section"].items.push(asset);
      }
      else if (id.includes('plastic-surgery-section')) {
        structure.components.children.sections.children["plastic-surgery-section"].items.push(asset);
      }
      else if (id.includes('medical-spa-section')) {
        structure.components.children.sections.children["medical-spa-section"].items.push(asset);
      }
      else if (id.includes('functional-medicine-section')) {
        structure.components.children.sections.children["functional-medicine-section"].items.push(asset);
      }
      else if (id.includes('ui/')) {
        structure.components.children.ui.items.push(asset);
      }
      else if (id.includes('layout/')) {
        structure.components.children.layout.items.push(asset);
      }
      // Out of town
      else if (id.match(/^out-of-town-hero/)) {
        structure["out-of-town"].children.hero.items.push(asset);
      }
      else if (id.match(/^out-of-town-accommodations-pendry/)) {
        structure["out-of-town"].children.accommodations.children.pendry.items.push(asset);
      }
      else if (id.match(/^out-of-town-accommodations-pelican/)) {
        structure["out-of-town"].children.accommodations.children["pelican-hill"].items.push(asset);
      }
      else if (id.match(/^out-of-town-accommodations-lido/)) {
        structure["out-of-town"].children.accommodations.children["lido-house"].items.push(asset);
      }
      else if (id.match(/^out-of-town-accommodations/)) {
        structure["out-of-town"].children.accommodations.items.push(asset);
      }
      else if (id.match(/^out-of-town/)) {
        structure["out-of-town"].items.push(asset);
      }
      // Other top-level sections
      else if (id.match(/^team/)) {
        structure.team.items.push(asset);
      }
      else if (id.match(/^articles/)) {
        structure.articles.items.push(asset);
      }
      else if (id.match(/^gallery/)) {
        structure.gallery.items.push(asset);
      }
      else if (id.match(/^financing/)) {
        structure.financing.items.push(asset);
      }
      else if (id.match(/^contact/)) {
        structure.contact.items.push(asset);
      }
      // Global elements
      else if (id.match(/^global-logo/) || id.match(/^logo/)) {
        structure.global.children.logo.items.push(asset);
      }
      else if (id.match(/^global-icon/) || id.match(/^icon/)) {
        structure.global.children.icons.items.push(asset);
      }
      else if (id.match(/^global-background/) || id.match(/^background/)) {
        structure.global.children.backgrounds.items.push(asset);
      }
      else if (id.match(/^global/) || id.match(/^general/)) {
        structure.global.items.push(asset);
      }
      // Fallback for any other assets
      else {
        structure.misc.items.push(asset);
      }
    };

    // Place all assets in the structure
    assets.forEach(placeAsset);

    // Convert structure to a flattened format for rendering
    // (We'll handle nesting in the rendering logic)
    return structure;
  };
  
  // Function to create a new placeholder
  const createNewPlaceholder = async () => {
    if (!newPlaceholder.element) {
      alert("Please enter an element name");
      return;
    }
    
    // Generate placeholder ID
    const placeholderId = newPlaceholder.section 
      ? `${newPlaceholder.page}-${newPlaceholder.section}-${newPlaceholder.element}` 
      : `${newPlaceholder.page}-${newPlaceholder.element}`;
    
    try {
      // Check if placeholder already exists
      const exists = mediaAssets.some(asset => asset.placeholder_id === placeholderId);
      if (exists) {
        alert(`A placeholder with ID "${placeholderId}" already exists.`);
        return;
      }
      
      // Create new placeholder in database
      const response = await fetch('/api/media/assets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeholder_id: placeholderId,
          cloudinary_id: '',
          metadata: {
            page: newPlaceholder.page,
            section: newPlaceholder.section,
            element: newPlaceholder.element,
            created_at: new Date().toISOString()
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create placeholder: ${response.statusText}`);
      }
      
      // Refresh media assets
      const mediaResponse = await fetch('/api/media/assets');
      const data = await mediaResponse.json();
      
      if (data.mediaAssets) {
        setMediaAssets(data.mediaAssets);
      }
      
      // Reset form
      setNewPlaceholder({
        page: "global",
        section: "",
        element: ""
      });
      setShowCreateForm(false);
      
      alert(`Successfully created placeholder: ${placeholderId}`);
    } catch (error: any) {
      console.error('Error creating placeholder:', error);
      alert(`Error creating placeholder: ${error.message}`);
    }
  };
  
  // Add function to analyze placeholders and suggest renames
  const analyzePlaceholders = () => {
    const suggestions: {original: string, proposed: string, cloudinary_id: string}[] = [];
    
    mediaAssets.forEach(asset => {
      const id = asset.placeholder_id.toLowerCase();
      
      // Skip already well-formatted IDs
      if (id.match(/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/)) {
        return; // Already follows convention
      }
      
      let proposed = id;
      
      // Some common patterns to fix
      if (id.includes('general-') || id.includes('general_')) {
        proposed = id.replace('general-', 'global-').replace('general_', 'global-');
      }
      
      // Replace underscores with hyphens
      proposed = proposed.replace(/_/g, '-');
      
      // Add section name if missing
      if (proposed.split('-').length < 3) {
        if (proposed.startsWith('global-') || proposed.startsWith('home-')) {
          proposed = proposed.replace(/(global|home)-/, '$1-general-');
        } else if (proposed.includes('background')) {
          proposed = proposed.replace(/([a-z0-9]+)-(background.*)/, '$1-section-$2');
        } else if (proposed.includes('image') || proposed.includes('img')) {
          proposed = proposed.replace(/([a-z0-9]+)-(image.*|img.*)/, '$1-content-$2');
        }
      }
      
      // Check if we made any changes and add to suggestions
      if (proposed !== id) {
        suggestions.push({
          original: id,
          proposed: proposed,
          cloudinary_id: asset.cloudinary_id
        });
      }
    });
    
    setMigrationPlan(suggestions);
    setShowMigrationTool(true);
  };
  
  // Add function to execute the migrations
  const executeMigration = async () => {
    setMigrationInProgress(true);
    
    const results = [];
    
    for (const item of migrationPlan) {
      try {
        // Create new placeholder with the new ID
        const createResponse = await fetch('/api/media/assets/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            placeholder_id: item.proposed,
            cloudinary_id: item.cloudinary_id,
            metadata: {
              migrated_from: item.original,
              migrated_at: new Date().toISOString()
            }
          }),
        });
        
        if (!createResponse.ok) {
          throw new Error(`Failed to create new placeholder: ${createResponse.statusText}`);
        }
        
        // TODO: Implement API to delete old placeholder if needed
        
        results.push({
          original: item.original,
          proposed: item.proposed,
          success: true
        });
      } catch (error: any) {
        results.push({
          original: item.original,
          proposed: item.proposed,
          success: false,
          error: error.message
        });
      }
    }
    
    // Refresh media assets by calling the existing function
    await fetchMediaAssets();
    setMigrationInProgress(false);
    setShowMigrationTool(false);
    
    alert(`Migration completed. ${results.filter(r => r.success).length} placeholders migrated successfully.`);
  };
  
  // Toggle a category in the sidebar
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  // Select a category to display in main content
  const selectCategory = (categoryKey: string, subcategoryKey?: string) => {
    setSelectedCategory(categoryKey);
    setSelectedSubcategory(subcategoryKey || null);
  };

  // Upload button for a specific section
  const handleUploadToSection = (sectionKey: string, parentKey?: string) => {
    // Generate a placeholder ID for this section
    let placeholderId;
    if (parentKey) {
      placeholderId = `${parentKey}-${sectionKey}-new`;
    } else {
      placeholderId = `${sectionKey}-new`;
    }
    setSelectedPlaceholderId(placeholderId);
    setCloudinaryModalOpen(true);
  };

  // Sidebar component that looks like VS Code file explorer
  const Sidebar = ({ structure }: { structure: any }) => {
    // Filter structure based on search term
    const filteredStructure = React.useMemo(() => {
      if (!searchTerm) return structure;
      
      // Deep clone the structure to avoid modifying the original
      const filtered = JSON.parse(JSON.stringify(structure));
      
      // Function to filter items in a category and its children
      const filterCategory = (category: any): boolean => {
        // Filter items in this category
        if (category.items && category.items.length > 0) {
          category.items = category.items.filter((asset: MediaAsset) => 
            asset.placeholder_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.cloudinary_id && asset.cloudinary_id.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        // Filter children
        let hasMatchingChildren = false;
        if (category.children) {
          Object.entries(category.children).forEach(([key, childCategory]: [string, any]) => {
            // Recursively filter child category
            const childHasMatches = filterCategory(childCategory);
            if (!childHasMatches) {
              delete category.children[key];
            } else {
              hasMatchingChildren = true;
            }
          });
        }
        
        // Category should be kept if it has matching items or children
        return category.items.length > 0 || hasMatchingChildren;
      };
      
      // Filter each top-level category
      Object.entries(filtered).forEach(([key, category]: [string, any]) => {
        const keepCategory = filterCategory(category);
        if (!keepCategory) {
          delete filtered[key];
        }
      });
      
      return filtered;
    }, [structure, searchTerm]);

    return (
      <div className="w-64 h-full overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="p-3 font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Media Explorer
          {searchTerm && (
            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
              Filtered
            </span>
          )}
        </div>
        <div className="space-y-1">
          {Object.entries(filteredStructure).map(([key, category]: [string, any]) => (
            <DirectoryItem 
              key={key} 
              categoryKey={key}
              category={category}
              level={0}
              onSelect={selectCategory}
              onToggle={toggleCategory}
              isExpanded={expandedCategories[key] || false}
            />
          ))}
          {Object.keys(filteredStructure).length === 0 && (
            <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
              No matching assets found
            </div>
          )}
        </div>
      </div>
    );
  };

  // Directory item component for sidebar
  const DirectoryItem = ({ 
    categoryKey,
    category, 
    level = 0,
    onSelect,
    onToggle,
    isExpanded
  }: { 
    categoryKey: string,
    category: any, 
    level?: number,
    onSelect: (key: string, subKey?: string) => void,
    onToggle: (key: string) => void,
    isExpanded: boolean
  }) => {
    const hasChildren = category.children && Object.keys(category.children).length > 0;
    const hasItems = category.items && category.items.length > 0;
    const itemCount = hasItems ? category.items.length : 0;
    const paddingLeft = `${(level * 12) + 12}px`;
    const isActive = selectedCategory === categoryKey;
    
    return (
      <div>
        <div 
          className={`flex items-center group hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
          onClick={() => {
            onSelect(categoryKey);
            if (hasChildren) {
              onToggle(categoryKey);
            }
          }}
        >
          <div 
            className="flex items-center py-1 text-gray-700 dark:text-gray-300"
            style={{ paddingLeft }}
          >
            {hasChildren ? (
              <svg 
                className={`h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <span className="w-3.5 mr-1"></span>
            )}
            
            {hasChildren ? (
              <FolderIcon />
            ) : (
              <FileIcon />
            )}
            
            <span className="ml-1.5 text-sm">
              {category.label} {itemCount > 0 && <span className="text-xs text-gray-400 dark:text-gray-500">({itemCount})</span>}
            </span>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {Object.entries(category.children).map(([childKey, childCategory]: [string, any]) => (
              <DirectoryItem 
                key={childKey}
                categoryKey={`${categoryKey}-${childKey}`}
                category={childCategory}
                level={level + 1}
                onSelect={(key) => onSelect(categoryKey, childKey)}
                onToggle={onToggle}
                isExpanded={expandedCategories[`${categoryKey}-${childKey}`] || false}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Main content area component
  const MainContent = ({ structure }: { structure: any }) => {
    if (!selectedCategory) {
      return (
        <div className="flex-1 p-6 flex items-center justify-center text-gray-400 dark:text-gray-600">
          <div className="text-center">
            <svg className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">Select a category from the sidebar</p>
            <p className="mt-2 text-sm">Or use the search to find specific media assets</p>
          </div>
        </div>
      );
    }

    // Navigate structure to find selected category
    let currentCategory = structure[selectedCategory];
    
    // If there's a subcategory, navigate to it
    if (selectedSubcategory && currentCategory.children && currentCategory.children[selectedSubcategory]) {
      currentCategory = currentCategory.children[selectedSubcategory];
    }
    
    // If category doesn't exist or has no items
    if (!currentCategory || !currentCategory.items) {
      return (
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">
              {currentCategory?.label || 'Unknown Category'}
            </h2>
            <button
              onClick={() => handleUploadToSection(selectedCategory, selectedSubcategory || undefined)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center text-sm"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload
            </button>
          </div>
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-md">
            No media assets in this section
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold dark:text-white">
            {currentCategory.label}
          </h2>
          <button
            onClick={() => handleUploadToSection(selectedCategory, selectedSubcategory || undefined)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center text-sm"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload
          </button>
        </div>
        
        {currentCategory.items.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-md">
            No media assets in this section
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategory.items.map((asset: MediaAsset) => (
              <div 
                key={asset.placeholder_id} 
                className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden bg-white dark:bg-gray-800"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="truncate text-sm font-medium">
                    {asset.placeholder_id.split('-').pop() || asset.placeholder_id}
                  </div>
                  <button
                    onClick={() => openMediaLibraryForPlaceholder(asset.placeholder_id)}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {asset.cloudinary_id ? "Replace" : "Assign"}
                  </button>
                </div>
                <div className="p-3 h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  {asset.cloudinary_id ? (
                    <img 
                      src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${asset.cloudinary_id}`}
                      alt={asset.placeholder_id}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-400 dark:text-gray-600">
                      <svg className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No image assigned</p>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                  ID: {asset.placeholder_id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <h1 className="text-xl font-bold dark:text-white">Media Library</h1>
        <div className="flex items-center mt-2">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search media assets..."
              className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-800 rounded text-sm bg-white dark:bg-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="ml-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            New Placeholder
          </button>
        </div>
      </div>
      
      {showCreateForm && (
        <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Page *
              </label>
              <select
                value={newPlaceholder.page}
                onChange={(e) => setNewPlaceholder({...newPlaceholder, page: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-black"
              >
                <option value="global">Global</option>
                <option value="homepage">Homepage</option>
                <option value="about">About</option>
                <option value="services">Services</option>
                <option value="services-plastic-surgery">Plastic Surgery</option>
                <option value="services-dermatology">Dermatology</option>
                <option value="services-medical-spa">Medical Spa</option>
                <option value="services-functional-medicine">Functional Medicine</option>
                <option value="team">Team</option>
                <option value="gallery">Gallery</option>
                <option value="out-of-town">Out of Town</option>
                <option value="financing">Financing</option>
                <option value="contact">Contact</option>
                <option value="articles">Articles</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Section (optional)
              </label>
              <input
                type="text"
                value={newPlaceholder.section}
                onChange={(e) => setNewPlaceholder({...newPlaceholder, section: e.target.value})}
                placeholder="e.g. hero, mission, team"
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Element *
              </label>
              <input
                type="text"
                value={newPlaceholder.element}
                onChange={(e) => setNewPlaceholder({...newPlaceholder, element: e.target.value})}
                placeholder="e.g. background, logo, image-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-black"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Preview:</strong> {newPlaceholder.page}
              {newPlaceholder.section ? `-${newPlaceholder.section}` : ""}
              {newPlaceholder.element ? `-${newPlaceholder.element}` : ""}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={createNewPlaceholder}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-3 m-4 text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar structure={organizeMediaAssets(mediaAssets)} />
        <MainContent structure={organizeMediaAssets(mediaAssets)} />
      </div>
      
      {/* Cloudinary Media Library Modal */}
      <div id="cloudinaryLibraryContainer" className="hidden">
        {cloudinaryModalOpen && selectedPlaceholderId && (
          <CloudinaryUploader
            onSuccess={(result) => {
              // Extract the public_id from the result as cloudinaryId
              const cloudinaryId = typeof result === 'object' && 'publicId' in result 
                ? result.publicId 
                : Array.isArray(result) && result.length > 0 && 'publicId' in result[0]
                  ? result[0].publicId
                  : null;
              
              if (cloudinaryId) {
                handleMediaSelect(cloudinaryId);
              }
            }}
            onClose={() => {
              setCloudinaryModalOpen(false);
              setSelectedPlaceholderId(null);
            }}
            autoOpen={true}
            multiple={false}
            folder="site-assets"
            tags={["site-content"]}
            context={{ placeholder_id: selectedPlaceholderId }}
          />
        )}
      </div>
      
      {/* Cloudinary Widget Script */}
      <Script
        src="https://widget.cloudinary.com/v2.0/global/all.js"
        onLoad={() => console.log('Cloudinary widget loaded')}
      />
    </div>
  );
} 