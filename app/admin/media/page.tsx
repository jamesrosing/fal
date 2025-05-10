"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { 
  CloudinaryAsset 
} from '@/lib/cloudinary';
import { toast } from '@/components/ui/use-toast';
import { CldImage } from '../components/media/CldImage';
import { CldVideo } from '../components/media/CldVideo';
import { mediaId, mediaUrl, getMediaUrl } from "@/lib/media";



// Style for the directory structure
const directoryStyles = {
  container: "border border-zinc-700 rounded-md overflow-hidden mb-4 bg-zinc-950",
  header: "bg-zinc-900 px-4 py-3 font-medium flex items-center justify-between text-white border-b border-zinc-700",
  folderIcon: "mr-2 text-yellow-500",
  content: "pl-0 bg-zinc-950 text-white",
  item: "border-t border-zinc-800 px-4 py-2 flex items-center",
  folderItem: "text-white hover:bg-zinc-800 cursor-pointer",
  placeholder: "flex items-center justify-between w-full py-1.5",
  indentedContent: "pl-6",
  fileIcon: "mr-2 text-gray-400",
  fileText: "text-sm font-mono text-white",
  cloudinaryId: "ml-2 text-xs text-gray-400",
  replaceButton: "ml-auto px-3 py-1 text-xs bg-zinc-800 text-white rounded-md border border-zinc-700 hover:bg-zinc-700",
  deleteButton: "ml-2 px-3 py-1 text-xs bg-red-900 text-white rounded-md border border-red-800 hover:bg-red-800",
  actionButtons: "flex ml-auto"
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
  const handleMediaSelect = async (cloudinaryId: string, placeholderId: string) => {
    if (!placeholderId) return;
    
    try {
      const response = await fetch('/api/site/media-assets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeholder_id: placeholderId,
          cloudinary_id: cloudinaryId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh the media assets list
      fetchMediaAssets();
      
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
          },
          // Enhanced Getty Images integration based on documentation
          integration: {
            getty: {
              onAuthenticated: (data: any) => {
                console.log('Getty authentication successful', data);
                // Force refresh the widget state
                setTimeout(() => {
                  // This timeout helps ensure the widget UI is properly updated
                  console.log('Refreshing widget after Getty authentication');
                }, 100);
                return true;
              },
              onAuthenticationFailed: (error: Error) => {
                console.error('Getty authentication failed', error);
                alert('Getty Images authentication failed. Please try again.');
                return false;
              },
              // Add session management for Getty
              session: {
                // Keep the session alive longer
                maxAge: 3600, // 1 hour in seconds
                // Handle session expiration
                onExpire: () => {
                  console.log('Getty session expired');
                  return false; // Will trigger re-authentication
                }
              }
            }
          },
          callbacks: {
            // Enhanced provider authentication handling
            onProviderAuthenticated: (provider: string, data: any) => {
              console.log(`${provider} authenticated successfully`, data);
              if (provider === 'getty') {
                // Use a more reliable approach to handle the post-authentication state
                setTimeout(() => {
                  // Force the widget to refresh its state
                  console.log('Forcing widget refresh after Getty authentication');
                  // Return to the main view
                  return true;
                }, 800); // Longer timeout to ensure Getty's authentication completes
              }
              return true;
            },
            // Add specific provider event handling
            onProviderEvent: (provider: string, event: string, data: any) => {
              console.log(`Provider event: ${provider} - ${event}`, data);
              // Handle specific Getty events
              if (provider === 'getty' && event === 'session_error') {
                console.error('Getty session error', data);
                alert('There was an issue with your Getty Images session. Please try again.');
              }
              return true;
            },
            onError: (error: Error) => {
              console.error('Media Library Widget error:', error);
              if (error.message && error.message.includes('authentication')) {
                alert('There was an authentication issue. Please try again.');
              }
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
      
      // Add event listener for Getty authentication events
      window.addEventListener('message', (event) => {
        // Check if the message is from Getty
        if (event.data && event.data.source === 'getty') {
          console.log('Received Getty message:', event.data);
          // If authentication completed, force refresh the widget
          if (event.data.type === 'authentication_complete') {
            console.log('Getty authentication completed, refreshing widget');
            // Force the widget to return to main view
            setTimeout(() => {
              // This timeout helps ensure the widget UI is properly updated
              console.log('Refreshing widget after Getty authentication message');
            }, 500);
          }
        }
      }, false);
      
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
          },
          // Enhanced Getty Images integration based on documentation
          integration: {
            getty: {
              onAuthenticated: (data: any) => {
                console.log('Getty authentication successful', data);
                // Force refresh the widget state
                setTimeout(() => {
                  // This timeout helps ensure the widget UI is properly updated
                  console.log('Refreshing widget after Getty authentication');
                }, 100);
                return true;
              },
              onAuthenticationFailed: (error: Error) => {
                console.error('Getty authentication failed', error);
                alert('Getty Images authentication failed. Please try again.');
                return false;
              },
              // Add session management for Getty
              session: {
                // Keep the session alive longer
                maxAge: 3600, // 1 hour in seconds
                // Handle session expiration
                onExpire: () => {
                  console.log('Getty session expired');
                  return false; // Will trigger re-authentication
                }
              }
            }
          },
          callbacks: {
            // Enhanced provider authentication handling
            onProviderAuthenticated: (provider: string, data: any) => {
              console.log(`${provider} authenticated successfully`, data);
              if (provider === 'getty') {
                // Use a more reliable approach to handle the post-authentication state
                setTimeout(() => {
                  // Force the widget to refresh its state
                  console.log('Forcing widget refresh after Getty authentication');
                  // Return to the main view
                  return true;
                }, 800); // Longer timeout to ensure Getty's authentication completes
              }
              return true;
            },
            // Add specific provider event handling
            onProviderEvent: (provider: string, event: string, data: any) => {
              console.log(`Provider event: ${provider} - ${event}`, data);
              // Handle specific Getty events
              if (provider === 'getty' && event === 'session_error') {
                console.error('Getty session error', data);
                alert('There was an issue with your Getty Images session. Please try again.');
              }
              return true;
            },
            onError: (error: Error) => {
              console.error('Media Library Widget error:', error);
              if (error.message && error.message.includes('authentication')) {
                alert('There was an authentication issue. Please try again.');
              }
            }
          }
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
              
              // Use the updated handleMediaSelect function with placeholderId
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
    // Create a hierarchical structure based on front-end pages
    const structure = {
      // Root pages
      "homepage": {
        label: "Homepage",
        items: [] as MediaAsset[],
        children: {
          "hero": {
            label: "Hero Section",
            items: [] as MediaAsset[]
          },
          "mission-section": {
            label: "Mission Section",
            items: [] as MediaAsset[]
          },
          "plastic-surgery-section": {
            label: "Plastic Surgery Section",
            items: [] as MediaAsset[]
          },
          "dermatology-section": {
            label: "Dermatology Section",
            items: [] as MediaAsset[]
          },
          "medical-spa-section": {
            label: "Medical Spa Section",
            items: [] as MediaAsset[]
          },
          "functional-medicine-section": {
            label: "Functional Medicine Section",
            items: [] as MediaAsset[]
          },
          "team-section": {
            label: "Team Section",
            items: [] as MediaAsset[]
          },
          "about-section": {
            label: "About Section",
            items: [] as MediaAsset[]
          },
          "articles-section": {
            label: "Articles Section",
            items: [] as MediaAsset[]
          }
        }
      },
      "about": {
        label: "About Page",
        items: [] as MediaAsset[],
        children: {
          "hero": {
            label: "Hero Section",
            items: [] as MediaAsset[]
          },
          "mission": {
            label: "Mission Section",
            items: [] as MediaAsset[]
          },
          "team": {
            label: "Team Section",
            items: [] as MediaAsset[]
          },
          "values": {
            label: "Values Section",
            items: [] as MediaAsset[]
          }
        }
      },
      "services": {
        label: "Services Pages",
        items: [] as MediaAsset[],
        children: {
          "plastic-surgery": {
            label: "Plastic Surgery",
            items: [] as MediaAsset[],
            children: {
              "hero": {
                label: "Hero Section",
                items: [] as MediaAsset[]
              },
              "procedures": {
                label: "Procedures Section",
                items: [] as MediaAsset[]
              }
            }
          },
          "dermatology": {
            label: "Dermatology",
            items: [] as MediaAsset[],
            children: {
              "hero": {
                label: "Hero Section",
                items: [] as MediaAsset[]
              },
              "treatments": {
                label: "Treatments Section",
                items: [] as MediaAsset[]
              }
            }
          },
          "medical-spa": {
            label: "Medical Spa",
            items: [] as MediaAsset[],
            children: {
              "hero": {
                label: "Hero Section",
                items: [] as MediaAsset[]
              },
              "services": {
                label: "Services Section",
                items: [] as MediaAsset[]
              }
            }
          },
          "functional-medicine": {
            label: "Functional Medicine",
            items: [] as MediaAsset[],
            children: {
              "hero": {
                label: "Hero Section",
                items: [] as MediaAsset[]
              },
              "therapies": {
                label: "Therapies Section",
                items: [] as MediaAsset[]
              }
            }
          }
        }
      },
      "team": {
        label: "Team Page",
        items: [] as MediaAsset[],
        children: {
          "hero": {
            label: "Hero Section",
            items: [] as MediaAsset[]
          },
          "doctors": {
            label: "Doctors Section",
            items: [] as MediaAsset[]
          },
          "staff": {
            label: "Staff Section",
            items: [] as MediaAsset[]
          }
        }
      },
      "gallery": {
        label: "Gallery Page",
        items: [] as MediaAsset[],
        children: {
          "plastic-surgery": {
            label: "Plastic Surgery",
            items: [] as MediaAsset[]
          },
          "dermatology": {
            label: "Dermatology",
            items: [] as MediaAsset[]
          },
          "medical-spa": {
            label: "Medical Spa",
            items: [] as MediaAsset[]
          }
        }
      },
      "out-of-town": {
        label: "Out of Town Page",
        items: [] as MediaAsset[],
        children: {
          "hero": {
            label: "Hero Section",
            items: [] as MediaAsset[]
          },
          "accommodations": {
            label: "Accommodations Section",
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
      "articles": {
        label: "Articles Pages",
        items: [] as MediaAsset[]
      },
      "contact": {
        label: "Contact Page",
        items: [] as MediaAsset[]
      },
      "financing": {
        label: "Financing Page",
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
          },
          "ui": {
            label: "UI Elements",
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
      
      // Homepage sections
      if (id.startsWith('homepage-hero') || id.startsWith('home-hero')) {
        structure.homepage.children.hero.items.push(asset);
      }
      else if (id.includes('homepage-mission') || id.includes('home-mission')) {
        structure.homepage.children["mission-section"].items.push(asset);
      }
      else if (id.includes('homepage-plastic-surgery') || id.includes('home-plastic-surgery')) {
        structure.homepage.children["plastic-surgery-section"].items.push(asset);
      }
      else if (id.includes('homepage-dermatology') || id.includes('home-dermatology')) {
        structure.homepage.children["dermatology-section"].items.push(asset);
      }
      else if (id.includes('homepage-medical-spa') || id.includes('home-medical-spa')) {
        structure.homepage.children["medical-spa-section"].items.push(asset);
      }
      else if (id.includes('homepage-functional-medicine') || id.includes('home-functional-medicine')) {
        structure.homepage.children["functional-medicine-section"].items.push(asset);
      }
      else if (id.includes('homepage-team') || id.includes('home-team')) {
        structure.homepage.children["team-section"].items.push(asset);
      }
      else if (id.includes('homepage-about') || id.includes('home-about')) {
        structure.homepage.children["about-section"].items.push(asset);
      }
      else if (id.includes('homepage-articles') || id.includes('home-articles')) {
        structure.homepage.children["articles-section"].items.push(asset);
      }
      else if (id.startsWith('homepage-') || id.startsWith('home-')) {
        structure.homepage.items.push(asset);
      }
      
      // About page
      else if (id.startsWith('about-hero')) {
        structure.about.children.hero.items.push(asset);
      }
      else if (id.includes('about-mission')) {
        structure.about.children.mission.items.push(asset);
      }
      else if (id.includes('about-team')) {
        structure.about.children.team.items.push(asset);
      }
      else if (id.includes('about-values')) {
        structure.about.children.values.items.push(asset);
      }
      else if (id.startsWith('about-')) {
        structure.about.items.push(asset);
      }
      
      // Services pages (including sub-pages)
      else if (id.startsWith('services-plastic-surgery-hero')) {
        structure.services.children["plastic-surgery"].children.hero.items.push(asset);
      }
      else if (id.includes('services-plastic-surgery-procedures')) {
        structure.services.children["plastic-surgery"].children.procedures.items.push(asset);
      }
      else if (id.startsWith('services-plastic-surgery')) {
        structure.services.children["plastic-surgery"].items.push(asset);
      }
      else if (id.startsWith('services-dermatology-hero')) {
        structure.services.children.dermatology.children.hero.items.push(asset);
      }
      else if (id.includes('services-dermatology-treatments')) {
        structure.services.children.dermatology.children.treatments.items.push(asset);
      }
      else if (id.startsWith('services-dermatology')) {
        structure.services.children.dermatology.items.push(asset);
      }
      else if (id.startsWith('services-medical-spa-hero')) {
        structure.services.children["medical-spa"].children.hero.items.push(asset);
      }
      else if (id.includes('services-medical-spa-services')) {
        structure.services.children["medical-spa"].children.services.items.push(asset);
      }
      else if (id.startsWith('services-medical-spa')) {
        structure.services.children["medical-spa"].items.push(asset);
      }
      else if (id.startsWith('services-functional-medicine-hero')) {
        structure.services.children["functional-medicine"].children.hero.items.push(asset);
      }
      else if (id.includes('services-functional-medicine-therapies')) {
        structure.services.children["functional-medicine"].children.therapies.items.push(asset);
      }
      else if (id.startsWith('services-functional-medicine')) {
        structure.services.children["functional-medicine"].items.push(asset);
      }
      else if (id.startsWith('services-')) {
        structure.services.items.push(asset);
      }
      
      // Team page
      else if (id.startsWith('team-hero')) {
        structure.team.children.hero.items.push(asset);
      }
      else if (id.includes('team-doctors')) {
        structure.team.children.doctors.items.push(asset);
      }
      else if (id.includes('team-staff')) {
        structure.team.children.staff.items.push(asset);
      }
      else if (id.startsWith('team-')) {
        structure.team.items.push(asset);
      }
      
      // Gallery
      else if (id.startsWith('gallery-plastic-surgery')) {
        structure.gallery.children["plastic-surgery"].items.push(asset);
      }
      else if (id.startsWith('gallery-dermatology')) {
        structure.gallery.children.dermatology.items.push(asset);
      }
      else if (id.startsWith('gallery-medical-spa')) {
        structure.gallery.children["medical-spa"].items.push(asset);
      }
      else if (id.startsWith('gallery-')) {
        structure.gallery.items.push(asset);
      }
      
      // Out of town
      else if (id.startsWith('out-of-town-hero')) {
        structure["out-of-town"].children.hero.items.push(asset);
      }
      else if (id.startsWith('out-of-town-accommodations-pendry')) {
        structure["out-of-town"].children.accommodations.children.pendry.items.push(asset);
      }
      else if (id.startsWith('out-of-town-accommodations-pelican')) {
        structure["out-of-town"].children.accommodations.children["pelican-hill"].items.push(asset);
      }
      else if (id.startsWith('out-of-town-accommodations-lido')) {
        structure["out-of-town"].children.accommodations.children["lido-house"].items.push(asset);
      }
      else if (id.startsWith('out-of-town-accommodations')) {
        structure["out-of-town"].children.accommodations.items.push(asset);
      }
      else if (id.startsWith('out-of-town')) {
        structure["out-of-town"].items.push(asset);
      }
      
      // Other simple pages
      else if (id.startsWith('articles')) {
        structure.articles.items.push(asset);
      }
      else if (id.startsWith('contact')) {
        structure.contact.items.push(asset);
      }
      else if (id.startsWith('financing')) {
        structure.financing.items.push(asset);
      }
      
      // Global elements
      else if (id.startsWith('global-logo') || id.startsWith('logo')) {
        structure.global.children.logo.items.push(asset);
      }
      else if (id.startsWith('global-icon') || id.startsWith('icon')) {
        structure.global.children.icons.items.push(asset);
      }
      else if (id.startsWith('global-background') || id.startsWith('background')) {
        structure.global.children.backgrounds.items.push(asset);
      }
      else if (id.startsWith('global-ui') || id.includes('button') || id.includes('form') || id.includes('input')) {
        structure.global.children.ui.items.push(asset);
      }
      else if (id.startsWith('global')) {
        structure.global.items.push(asset);
      }
      
      // Handle any specific section components that might be mixed in
      else if (id.includes('mission-section')) {
        structure.homepage.children["mission-section"].items.push(asset);
      }
      else if (id.includes('plastic-surgery-section')) {
        structure.homepage.children["plastic-surgery-section"].items.push(asset);
      }
      else if (id.includes('dermatology-section')) {
        structure.homepage.children["dermatology-section"].items.push(asset);
      }
      else if (id.includes('medical-spa-section')) {
        structure.homepage.children["medical-spa-section"].items.push(asset);
      }
      else if (id.includes('functional-medicine-section')) {
        structure.homepage.children["functional-medicine-section"].items.push(asset);
      }
      
      // Fallback for any other assets
      else {
        structure.misc.items.push(asset);
      }
    };

    // Place all assets in the structure
    assets.forEach(placeAsset);

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
    // Instead of opening the CloudinaryUploader component, use the Media Library widget
    openMediaLibraryForPlaceholder(placeholderId);
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
      <div className="w-64 h-full overflow-y-auto border-r border-zinc-800 bg-zinc-950">
        <div className="p-3 font-medium text-sm text-zinc-400 uppercase tracking-wider">
          Media Explorer
          {searchTerm && (
            <span className="ml-2 text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">
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
        <div className="flex-1 p-6 flex items-center justify-center text-zinc-600 bg-zinc-950">
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
        <div className="flex-1 p-6 bg-zinc-950">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
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
          <div className="p-4 text-center text-zinc-400 bg-zinc-900 rounded-md">
            No media assets in this section
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex-1 p-6 overflow-auto bg-zinc-950">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
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
          <div className="p-4 text-center text-zinc-400 bg-zinc-900 rounded-md">
            No media assets in this section
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategory.items.map((asset: MediaAsset) => (
              <div 
                key={asset.placeholder_id} 
                className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-800"
              >
                <div className="p-3 border-b border-zinc-700 flex items-center justify-between">
                  <div className="truncate text-sm font-medium text-white">
                    {asset.placeholder_id.split('-').pop() || asset.placeholder_id}
                  </div>
                  <div className={directoryStyles.actionButtons}>
                    <button
                      className={directoryStyles.replaceButton}
                      onClick={() => openMediaLibraryForPlaceholder(asset.placeholder_id)}
                    >
                      Replace
                    </button>
                    <button
                      className={directoryStyles.deleteButton}
                      onClick={() => deleteMediaAsset(asset.placeholder_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-3 h-48 flex items-center justify-center bg-zinc-900">
                  {asset.cloudinary_id ? (
                    isVideoAsset(asset.cloudinary_id) ? (
                      <video 
                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${asset.cloudinary_id}`}
                        className="max-h-full max-w-full object-contain"
                        controls
                        muted
                        playsInline
                        onError={(e) => {
                          const target = e.target as HTMLVideoElement;
                          target.style.display = 'none';
                          const fallback = document.createElement('div');
                          fallback.textContent = 'Video Not Found';
                          fallback.className = 'text-zinc-400';
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <img 
                        src={mediaUrl(asset.cloudinary_id)}
                        alt={asset.placeholder_id}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                        }}
                      />
                    )
                  ) : (
                    <div className="text-center text-zinc-400">
                      <svg className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>No media assigned</p>
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

  // Add this function to handle media asset deletion
  const deleteMediaAsset = async (placeholderId: string) => {
    if (!confirm(`Are you sure you want to delete the image assigned to ${placeholderId}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/media/${encodeURIComponent(placeholderId)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete media asset: ${response.statusText}`);
      }
      
      toast({
        title: 'Success',
        description: `Media asset for ${placeholderId} was deleted successfully.`,
      });
      
      // Refresh the media assets list
      fetchMediaAssets();
    } catch (error) {
      console.error('Error deleting media asset:', error);
      toast({
        title: 'Error',
        description: `Failed to delete media asset: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Add the isVideoAsset helper function at the top of the file
  function isVideoAsset(publicId: string): boolean {
    // Check for common video formats in the public ID or metadata
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
    const hasVideoExtension = videoExtensions.some(ext => publicId.toLowerCase().includes(ext));
    
    // Check for Cloudinary resource_type indicators
    const isVideoResource = publicId.includes('/video/') || publicId.includes('resource_type=video');
    
    return hasVideoExtension || isVideoResource;
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-white">Media Library</h1>
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
              className="w-full pl-10 pr-3 py-2 border border-zinc-800 rounded text-sm text-white bg-zinc-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="ml-2 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded text-white hover:bg-zinc-700"
          >
            New Placeholder
          </button>
          <button
            onClick={openMediaLibrary}
            className="ml-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Browse All Media
          </button>
        </div>
      </div>
      
      {showCreateForm && (
        <div className="border-b border-zinc-800 p-4 bg-zinc-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Page *
              </label>
              <select
                value={newPlaceholder.page}
                onChange={(e) => setNewPlaceholder({...newPlaceholder, page: e.target.value})}
                className="w-full px-3 py-2 border border-zinc-700 rounded-md text-white bg-zinc-800"
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
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Section (optional)
              </label>
              <input
                type="text"
                value={newPlaceholder.section}
                onChange={(e) => setNewPlaceholder({...newPlaceholder, section: e.target.value})}
                placeholder="e.g. hero, mission, team"
                className="w-full px-3 py-2 border border-zinc-700 rounded-md text-white bg-zinc-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Element *
              </label>
              <input
                type="text"
                value={newPlaceholder.element}
                onChange={(e) => setNewPlaceholder({...newPlaceholder, element: e.target.value})}
                placeholder="e.g. background, logo, image-1"
                className="w-full px-3 py-2 border border-zinc-700 rounded-md text-white bg-zinc-800"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-zinc-300">
              <strong>Preview:</strong> {newPlaceholder.page}
              {newPlaceholder.section ? `-${newPlaceholder.section}` : ""}
              {newPlaceholder.element ? `-${newPlaceholder.element}` : ""}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1.5 text-sm border border-zinc-700 rounded-md text-zinc-300 bg-zinc-800 hover:bg-zinc-700"
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
        {/* Remove the CloudinaryUploader component as we're using the Media Library widget directly */}
      </div>
      
      {/* Cloudinary Widget Script */}
      <Script
        src="https://widget.cloudinary.com/v2.0/global/all.js"
        onLoad={() => {
          console.log('Cloudinary widget loaded');
          setScriptLoaded(true);
        }}
      />
      {/* Cloudinary Media Library Script */}
      <Script
        src="https://media-library.cloudinary.com/global/all.js"
        onLoad={() => {
          console.log('Cloudinary media library loaded');
          setScriptLoaded(true);
        }}
      />
    </div>
  );
} 