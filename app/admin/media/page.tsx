"use client";

import { useState, useEffect } from 'react';
import Script from 'next/script';

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
  <svg className={directoryStyles.folderIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FileIcon = () => (
  <svg className={directoryStyles.fileIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  
  // Add a function to organize media assets by page structure
  const organizeMediaAssets = (assets: MediaAsset[]) => {
    // Define the main categories based on site structure
    const categories = {
      "global": {
        label: "Global Elements",
        items: [] as MediaAsset[]
      },
      "home": {
        label: "Homepage",
        items: [] as MediaAsset[]
      },
      "about": {
        label: "About Pages",
        items: [] as MediaAsset[]
      },
      "services": {
        label: "Services",
        items: [] as MediaAsset[]
      },
      "services-plastic-surgery": {
        label: "Plastic Surgery",
        items: [] as MediaAsset[]
      },
      "services-dermatology": {
        label: "Dermatology",
        items: [] as MediaAsset[]
      },
      "services-medical-spa": {
        label: "Medical Spa",
        items: [] as MediaAsset[]
      },
      "services-functional-medicine": {
        label: "Functional Medicine",
        items: [] as MediaAsset[]
      },
      "team": {
        label: "Team",
        items: [] as MediaAsset[]
      },
      "gallery": {
        label: "Gallery",
        items: [] as MediaAsset[]
      },
      "reviews": {
        label: "Reviews",
        items: [] as MediaAsset[]
      },
      "out-of-town": {
        label: "Out of Town",
        items: [] as MediaAsset[]
      },
      "financing": {
        label: "Financing",
        items: [] as MediaAsset[]
      },
      "contact": {
        label: "Contact",
        items: [] as MediaAsset[]
      },
      "articles": {
        label: "Articles",
        items: [] as MediaAsset[]
      },
      "appointment": {
        label: "Appointment",
        items: [] as MediaAsset[]
      },
      "misc": {
        label: "Miscellaneous",
        items: [] as MediaAsset[]
      }
    };

    // Place each asset in the appropriate category
    assets.forEach(asset => {
      const id = asset.placeholder_id.toLowerCase();
      
      if (id.includes('global') || id.includes('general') || id.includes('logo') || id.includes('background')) {
        categories.global.items.push(asset);
      } else if (id.includes('home') || id === 'hero-home' || id === 'featured-image') {
        categories.home.items.push(asset);
      } else if (id.includes('about')) {
        categories.about.items.push(asset);
      } else if (id.includes('plastic-surgery')) {
        categories["services-plastic-surgery"].items.push(asset);
      } else if (id.includes('dermatology')) {
        categories["services-dermatology"].items.push(asset);
      } else if (id.includes('medical-spa') || id.includes('injectables') || id.includes('facial') || id.includes('skin')) {
        categories["services-medical-spa"].items.push(asset);
      } else if (id.includes('functional-medicine')) {
        categories["services-functional-medicine"].items.push(asset);
      } else if (id.includes('services')) {
        categories.services.items.push(asset);
      } else if (id.includes('team')) {
        categories.team.items.push(asset);
      } else if (id.includes('gallery')) {
        categories.gallery.items.push(asset);
      } else if (id.includes('reviews')) {
        categories.reviews.items.push(asset);
      } else if (id.includes('out-of-town')) {
        categories["out-of-town"].items.push(asset);
      } else if (id.includes('financing')) {
        categories.financing.items.push(asset);
      } else if (id.includes('contact')) {
        categories.contact.items.push(asset);
      } else if (id.includes('article')) {
        categories.articles.items.push(asset);
      } else if (id.includes('appointment')) {
        categories.appointment.items.push(asset);
      } else {
        categories.misc.items.push(asset);
      }
    });

    return categories;
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
  
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-950 text-white min-h-screen">
      <Script 
        src="https://media-library.cloudinary.com/global/all.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="afterInteractive"
      />
      
      <h1 className="text-3xl font-bold mb-6 text-white">Cloudinary Media Library</h1>
      
      <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded">
        <h2 className="text-lg font-semibold text-white mb-2">About This Page</h2>
        <p className="text-gray-300 mb-4">
          This page provides access to your Cloudinary Media Library, where you can browse, search, and manage all of your 
          media assets. Use the button below to open the Media Library.
        </p>
        <p className="text-sm text-gray-400">
          <strong>Note:</strong> Make sure you have configured your Cloudinary credentials in the .env.local file.
          You need to set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <button
        onClick={openMediaLibrary}
        className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 border border-gray-600"
        disabled={!scriptLoaded}
      >
        Open Cloudinary Media Library
      </button>
      
      {!scriptLoaded && (
        <p className="mt-2 text-gray-500">
          Loading Cloudinary script...
        </p>
      )}
      
      <div id="cloudinary-media-library-container" className="mt-8"></div>
      
      <div className="mt-8 mb-6 p-4 bg-gray-900 border border-gray-700 rounded">
        <h2 className="text-lg font-semibold text-white mb-2">How to Assign Media to Locations</h2>
        <ol className="list-decimal list-inside text-gray-300 space-y-2">
          <li>Click the <strong>Browse Cloudinary Media Library</strong> button above</li>
          <li>Browse and select an image or video from your Cloudinary library</li>
          <li>You'll be prompted to specify which placeholder to assign it to</li>
          <li>Enter one of the available placeholder IDs listed below</li>
          <li>The assignment will be saved and the page will refresh</li>
        </ol>
      </div>
      
      <div className="mt-8 bg-gray-950 rounded-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Media Assets by Page</h2>
        <p className="mb-4 text-gray-400">Media assets are organized by page structure for easier management.</p>
        
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">
            Search Media Placeholders
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              type="text"
              className="focus:ring-gray-500 focus:border-gray-500 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white placeholder-gray-400"
              placeholder="Search by placeholder ID or Cloudinary ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {Object.entries(organizeMediaAssets(mediaAssets.filter(asset => 
          asset.placeholder_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (asset.cloudinary_id && asset.cloudinary_id.toLowerCase().includes(searchTerm.toLowerCase()))
        ))).map(([key, category]) => (
          category.items.length > 0 ? (
            <div key={key} className={directoryStyles.container}>
              <div 
                className={directoryStyles.header}
                onClick={() => {
                  const content = document.getElementById(`content-${key}`);
                  if (content) {
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                  }
                }}
              >
                <div className="flex items-center">
                  <FolderIcon />
                  <span className="text-lg font-medium">{category.label} ({category.items.length})</span>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              <div id={`content-${key}`} className={directoryStyles.content} style={{display: 'none'}}>
                {category.items.map((asset) => {
                  // Split the placeholder_id into parts
                  const parts = asset.placeholder_id.split('/').length > 1 
                    ? asset.placeholder_id.split('/') 
                    : asset.placeholder_id.split('-');
                  
                  return (
                    <div key={asset.placeholder_id} className={directoryStyles.item}>
                      <div className={directoryStyles.placeholder}>
                        <div className="flex items-center">
                          <FileIcon />
                          <span className={directoryStyles.fileText}>
                            {parts.join('/')}
                          </span>
                          {asset.cloudinary_id && 
                            <span className={directoryStyles.cloudinaryId}>
                              ({asset.cloudinary_id.split('/').pop()})
                            </span>
                          }
                        </div>
                        <button
                          onClick={() => openMediaLibraryForPlaceholder(asset.placeholder_id)}
                          className={directoryStyles.replaceButton}
                        >
                          {asset.cloudinary_id ? 'Replace' : 'Assign'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null
        ))}
        
        <div className="mt-8 p-4 bg-gray-900 border border-gray-700 rounded">
          <h3 className="text-lg font-semibold text-white mb-2">About Page Structure Organization</h3>
          <p className="text-gray-300 mb-2">
            Media assets are now organized based on your site's page structure, making it easier to identify and manage media for specific sections of your website.
          </p>
          <p className="text-gray-300 mb-2">
            To maintain consistency, consider adopting a naming convention for new placeholders that follows this pattern:
          </p>
          <code className="block bg-gray-800 p-2 rounded text-gray-300">
            [page]-[section]-[element]
          </code>
          
          <div className="mt-2 text-gray-300">
            <span className="block">Examples:</span>
            <ul className="list-disc ml-6 mt-1">
              <li>home-hero</li>
              <li>about-team-section</li>
              <li>services-plastic-surgery-banner</li>
              <li>global-logo</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-6 py-3 flex items-center justify-between cursor-pointer"
             onClick={() => setShowCreateForm(!showCreateForm)}>
          <h3 className="font-medium text-lg text-white">Create New Placeholder</h3>
          <span className="text-gray-400">{showCreateForm ? '▲' : '▼'}</span>
        </div>
        
        {showCreateForm && (
          <div className="p-6 bg-gray-800">
            <p className="mb-4 text-gray-300">
              Create a new media placeholder using our structured naming convention. This will help maintain organization 
              and ensure that media assets are properly categorized.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Page</label>
                <select
                  value={newPlaceholder.page}
                  onChange={(e) => setNewPlaceholder({...newPlaceholder, page: e.target.value})}
                  className="w-full p-2 border border-gray-600 rounded focus:ring-gray-500 focus:border-gray-500 bg-gray-800 text-white"
                >
                  <option value="global">Global</option>
                  <option value="home">Homepage</option>
                  <option value="about">About</option>
                  <option value="services">Services</option>
                  <option value="services-plastic-surgery">Plastic Surgery</option>
                  <option value="services-dermatology">Dermatology</option>
                  <option value="services-medical-spa">Medical Spa</option>
                  <option value="services-functional-medicine">Functional Medicine</option>
                  <option value="team">Team</option>
                  <option value="gallery">Gallery</option>
                  <option value="reviews">Reviews</option>
                  <option value="out-of-town">Out of Town</option>
                  <option value="financing">Financing</option>
                  <option value="contact">Contact</option>
                  <option value="articles">Articles</option>
                  <option value="appointment">Appointment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Section (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., hero, banner, testimonials"
                  value={newPlaceholder.section}
                  onChange={(e) => setNewPlaceholder({...newPlaceholder, section: e.target.value})}
                  className="w-full p-2 border border-gray-600 rounded focus:ring-gray-500 focus:border-gray-500 bg-gray-800 text-white placeholder-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Element <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., background, image, video"
                  value={newPlaceholder.element}
                  onChange={(e) => setNewPlaceholder({...newPlaceholder, element: e.target.value})}
                  className="w-full p-2 border border-gray-600 rounded focus:ring-gray-500 focus:border-gray-500 bg-gray-800 text-white placeholder-gray-400"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-300 mb-2">
                Preview: <span className="font-mono bg-gray-700 px-2 py-1 rounded">
                  {newPlaceholder.section 
                    ? `${newPlaceholder.page}-${newPlaceholder.section}-${newPlaceholder.element}` 
                    : `${newPlaceholder.page}-${newPlaceholder.element}`}
                </span>
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-gray-700 rounded">
              <h4 className="font-medium mb-2">Naming Convention Guidelines:</h4>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li><strong>Page:</strong> Corresponds to site pages (about, services, etc)</li>
                <li><strong>Section:</strong> A specific area within a page (hero, testimonials, etc)</li>
                <li><strong>Element:</strong> The specific media item (background, profile, logo, etc)</li>
              </ul>
              <p className="mt-2 text-sm text-gray-300">
                Example: <code className="bg-gray-800 px-1">services-medical-spa-banner</code> for a banner on the Medical Spa services page.
              </p>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={createNewPlaceholder}
                className="py-2 px-4 bg-gray-800 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Create Placeholder
              </button>
              
              <button
                onClick={() => setShowCreateForm(false)}
                className="py-2 px-4 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={analyzePlaceholders}
          className="text-white bg-gray-800 border border-gray-600 px-3 py-1 rounded hover:bg-gray-700"
        >
          Analyze naming conventions
        </button>
      </div>
      
      {showMigrationTool && (
        <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Placeholder Migration Tool</h3>
            <button 
              onClick={() => setShowMigrationTool(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          {migrationPlan.length > 0 ? (
            <>
              <p className="mb-4 text-gray-300">
                Found {migrationPlan.length} placeholders that don't follow the recommended naming convention.
                Review the proposed changes below:
              </p>
              
              <div className="max-h-60 overflow-y-auto mb-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="text-left p-2 text-gray-200">Original ID</th>
                      <th className="text-left p-2 text-gray-200">Proposed ID</th>
                      <th className="text-left p-2 text-gray-200">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {migrationPlan.map((item, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="p-2 font-mono text-gray-300">{item.original}</td>
                        <td className="p-2 font-mono text-gray-300">{item.proposed}</td>
                        <td className="p-2 text-gray-300">{item.cloudinary_id ? 'Has media' : 'Empty'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={executeMigration}
                  disabled={migrationInProgress}
                  className="py-2 px-4 bg-gray-800 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 border border-gray-600 disabled:bg-gray-600 disabled:text-gray-400"
                >
                  {migrationInProgress ? 'Migrating...' : 'Execute Migration'}
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-300">
              All placeholders appear to follow the recommended naming convention. Great job!
            </p>
          )}
        </div>
      )}
    </div>
  );
} 