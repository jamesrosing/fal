"use client";

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { 
  CloudinaryAsset, 
  IMAGE_PLACEMENTS
} from '@/lib/cloudinary';
import { toast } from '@/components/ui/use-toast';
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';

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
  <svg className="h-5 w-5 text-b-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">   <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
    />
  </svg>
);

// Cloudinary script setup
const CLOUDINARY_SCRIPT_URL = "https://media-library.cloudinary.com/global/all.js";

// Define interfaces
interface SectionMedia {
  id: string;
  page_path: string;
  section_name: string;
  display_order: number;
  metadata: Record<string, any>;
  media_asset: MediaAsset;
  media_asset_id: string;
  created_at: string;
  updated_at: string;
}

interface MediaAsset {
  id: string;
  cloudinary_id: string;
  type: string;
  title: string;
  alt_text: string;
  width: number;
  height: number;
  format: string;
  url: string;
  created_at: string;
  updated_at: string;
}

interface SiteStructureNode {
  name: string;
  path: string;
  sections: string[];
  children: Record<string, SiteStructureNode>;
}

export default function MediaLibraryAdmin() {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectionMediaItems, setSectionMediaItems] = useState<SectionMedia[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  
  // Add site structure state
  const [siteStructure, setSiteStructure] = useState<Record<string, SiteStructureNode>>({});
  const [isLoadingSiteStructure, setIsLoadingSiteStructure] = useState(true);
  
  // Add section media form state
  const [newSectionMedia, setNewSectionMedia] = useState({
    page_path: "",
    section_name: ""
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Add search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add state for sidebar and content view
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Handle script loading
  const handleScriptLoad = () => {
    setScriptLoaded(true);
    console.log('Cloudinary Media Library script loaded successfully');
  };

  const handleScriptError = () => {
    setError('Failed to load Cloudinary Media Library script');
    console.error('Failed to load Cloudinary Media Library script');
  };

  // Add useEffect to load data on initial render
  useEffect(() => {
    // Load initial data
    fetchSiteStructure();
    fetchSectionMediaItems();
    fetchMediaAssets();
  }, []);

  // Add effect to update data when selection changes
  useEffect(() => {
    if (selectedCategory) {
      fetchSectionMediaItems();
    }
  }, [selectedCategory, selectedSubcategory]);

  // Function to fetch the site structure
  async function fetchSiteStructure() {
    try {
      setIsLoadingSiteStructure(true);
      const response = await fetch('/api/media/site-structure');
      const data = await response.json();
      
      if (data.structure) {
        setSiteStructure(data.structure);
      } else {
        setError('No site structure found');
      }
    } catch (error: any) {
      console.error('Error fetching site structure:', error);
      setError(`Error fetching site structure: ${error.message}`);
    } finally {
      setIsLoadingSiteStructure(false);
    }
  }

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchTerm && Object.keys(siteStructure).length > 0) {
      // Get all category keys from the structure
      const allCategories: Record<string, boolean> = {};
      
      const addCategories = (obj: Record<string, SiteStructureNode>, prefix = '') => {
        Object.keys(obj).forEach(key => {
          const path = obj[key].path;
          allCategories[path] = true;
          
          if (obj[key].children && Object.keys(obj[key].children).length > 0) {
            addCategories(obj[key].children, path);
          }
        });
      };
      
      addCategories(siteStructure);
      setExpandedCategories(allCategories);
    }
  }, [searchTerm, siteStructure]);

  // Function to handle media selection from Cloudinary
  const handleMediaSelect = async (cloudinaryId: string, sectionMediaId: string, pagePath: string, sectionName: string) => {
    try {
      // First check if media asset already exists
      const existingAssetResponse = await fetch(`/api/media/assets?cloudinary_id=${cloudinaryId}`);
      if (!existingAssetResponse.ok) {
        throw new Error(`HTTP error! status: ${existingAssetResponse.status}`);
      }
      
      const existingAssetData = await existingAssetResponse.json();
      
      let mediaAssetId;
      
      // If media asset doesn't exist, create it
      if (!existingAssetData.mediaAssets || existingAssetData.mediaAssets.length === 0) {
        // Get asset type based on extension or path
        const assetType = isVideoAsset(cloudinaryId) ? 'video' : 'image';
        const assetTitle = cloudinaryId.split('/').pop() || cloudinaryId;
        
        // Create new media asset
        const assetResponse = await fetch('/api/media/assets/create', {
          method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cloudinary_id: cloudinaryId,
            type: assetType,
            title: assetTitle,
            alt_text: assetTitle,
          }),
        });
        
        if (!assetResponse.ok) {
          const errorData = await assetResponse.json();
          console.error('Error creating media asset:', errorData);
          throw new Error(`HTTP error! status: ${assetResponse.status} - ${errorData.error || 'Unknown error'}`);
        }
        
        const assetData = await assetResponse.json();
        
        if (!assetData.mediaAsset || !assetData.mediaAsset.id) {
          throw new Error('Media asset creation did not return expected data');
        }
        
        mediaAssetId = assetData.mediaAsset.id;
      } else {
        mediaAssetId = existingAssetData.mediaAssets[0].id;
      }
      
      // If we have a section media ID, update it
      if (sectionMediaId) {
        const response = await fetch('/api/media/section-media', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: sectionMediaId,
            media_asset_id: mediaAssetId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
        toast({
          title: "Media Updated",
          description: `Successfully updated media for ${pagePath}/${sectionName}`,
        });
      } else {
        // Otherwise create a new section media entry
        const response = await fetch('/api/media/section-media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page_path: pagePath,
            section_name: sectionName,
            media_asset_id: mediaAssetId,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        toast({
          title: "Media Added",
          description: `Successfully added media to ${pagePath}/${sectionName}`,
        });
      }
      
      // Refresh section media items
      fetchSectionMediaItems();
    } catch (error: any) {
      console.error('Error handling media selection:', error);
      setError(`Error adding media: ${error.message}`);
      toast({
        title: "Error",
        description: `Failed to add media: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Fetch section media items
  async function fetchSectionMediaItems() {
    try {
      setError(null);
      
      // Determine query parameters based on selected category/subcategory
      let url = '/api/media/section-media';
      
      if (selectedCategory) {
        url += `?page_path=${selectedCategory}`;
        
        if (selectedSubcategory) {
          url += `&section_name=${selectedSubcategory}`;
        }
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.sectionMedia) {
        setSectionMediaItems(data.sectionMedia);
      } else {
        setSectionMediaItems([]);
        console.warn('No section media data returned from API');
      }
    } catch (error: any) {
      console.error('Error fetching section media items:', error);
      setError(`Error updating media: ${error.message}`);
      toast({
        title: "Error",
        description: `Failed to load media items: ${error.message}`,
        variant: "destructive",
      });
    }
  }

  // Fetch media assets
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

  // Handle Media Library selection
  const handleMediaLibrarySelection = async (data: any) => {
    if (!data || !data.assets || data.assets.length === 0) {
      console.error('No assets selected from Media Library');
      return;
    }

    try {
      // Get the first selected asset
      const asset = data.assets[0];
      console.log('Selected asset from Media Library:', asset);

      // If we have a selected category and subcategory, use that
      if (selectedCategory) {
        const pagePath = selectedCategory;
        const sectionName = selectedSubcategory || 'main';
        
        // Create a new section media entry
        await handleMediaSelect(
          asset.public_id,
          '', // No sectionMediaId for a new entry
          pagePath,
          sectionName
        );
        
        toast({
          title: "Media added",
          description: `Successfully added "${asset.public_id}" to ${pagePath}/${sectionName}`,
          duration: 3000,
        });
        
        return;
      }

      // If no category is selected, show a dialog
      const pagePath = prompt(
        "Enter the page path for this media (e.g., 'services/dermatology'):",
        ""
      );

      if (!pagePath) {
        console.log('Assignment canceled');
        return;
      }

      const sectionName = prompt(
        "Enter the section name (e.g., 'hero', 'gallery'):",
        "main"
      );

      if (!sectionName) {
        console.log('Assignment canceled');
        return;
      }

      // Create a new section media entry
      await handleMediaSelect(
        asset.public_id,
        '', // No sectionMediaId for a new entry
        pagePath,
        sectionName
      );
      
      toast({
        title: "Media added",
        description: `Successfully added "${asset.public_id}" to ${pagePath}/${sectionName}`,
        duration: 3000,
      });
      
      // Refresh data
      fetchSectionMediaItems();
      
    } catch (error: any) {
      console.error('Error adding media:', error);
      toast({
        title: "Error",
        description: `Error adding media: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
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
        },
        {
          insertHandler: handleMediaLibrarySelection,
        }
      );
      
      mediaLibrary.show();
      
    } catch (error: any) {
      console.error('Error opening Cloudinary Media Library:', error);
      setError(`Error opening Cloudinary Media Library: ${error.message}`);
    }
  };
  
  // Function to open Media Library for a specific section
  const openMediaLibraryForSection = (pagePath: string, sectionName: string, sectionMediaId: string = '') => {
    if (!scriptLoaded) {
      toast({
        title: 'Cloudinary widget not ready',
        description: 'Please wait for the Cloudinary widget to load completely.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create folder path for the media based on page path and section
    const folderPath = `${pagePath.replace(/\//g, '-')}/${sectionName}`.replace(/^-/, '');
    
    // Set up Cloudinary widget configuration
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'fal_media';
    
    const options = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dyrzyfg3w',
      uploadPreset: uploadPreset,
      folder: folderPath,
          multiple: false,
      resourceType: 'auto',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm'],
      maxFileSize: 20000000, // 20MB
      sources: ['local', 'url', 'camera', 'google_drive', 'dropbox', 'instagram', 'shutterstock'],
      googleApiKey: process.env.NEXT_PUBLIC_CLOUDINARY_GOOGLE_API_KEY,
      dropboxAppKey: process.env.NEXT_PUBLIC_CLOUDINARY_DROPBOX_APP_KEY,
      searchByRights: true,
      buttonClass: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
      buttonCaption: 'Select Media',
          styles: {
            palette: {
          window: '#000000',
          sourceBg: '#222222',
          windowBorder: '#555555',
          tabIcon: '#FFFFFF',
          inactiveTabIcon: '#999999',
          menuIcons: '#CCCCCC',
              link: '#0078FF',
          action: '#339933',
              inProgress: '#0078FF',
          complete: '#339933',
          error: '#CC0000',
          textDark: '#000000',
          textLight: '#FFFFFF'
        }
      }
    };
    
    // Open the Cloudinary widget and handle asset selection
    const widget = (window as any).cloudinary.createMediaLibrary(
      options,
        {
          insertHandler: (data: any) => {
          if (data.assets && data.assets.length > 0) {
              const asset = data.assets[0];
            // Extract the Cloudinary ID (public_id) from the asset
            const cloudinaryId = asset.public_id;
            
            // Call handler to process the selected media
            handleMediaSelect(cloudinaryId, sectionMediaId, pagePath, sectionName);
          }
        }
      }
    );
    
    widget.show();
  };

  // Filter section media items for the currently selected category/subcategory
  const getFilteredSectionMedia = () => {
    if (!selectedCategory) return [];
    
    return sectionMediaItems.filter(item => {
      // Match by page path
      const pathMatches = item.page_path === selectedCategory;
      
      // If a subcategory (section) is selected, match by that too
      if (selectedSubcategory) {
        return pathMatches && item.section_name === selectedSubcategory;
      }
      
      return pathMatches;
    });
  };
  
  // Create a new section media entry
  const createNewSectionMedia = async () => {
    try {
      // Validate fields
      if (!newSectionMedia.page_path || !newSectionMedia.section_name) {
        setError('Page path and section name are required');
        return;
      }
      
      // Open the media library to select a file
      openMediaLibraryForSection(
        newSectionMedia.page_path,
        newSectionMedia.section_name
      );
      
      // Reset form
      setNewSectionMedia({
        page_path: "",
        section_name: ""
      });
      setShowCreateForm(false);
      
    } catch (error: any) {
      console.error('Error creating section media:', error);
      setError(`Error creating section media: ${error.message}`);
    }
  };

  // Toggle a category's expanded state
  const toggleCategory = (path: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Select a category and optionally a subcategory
  const selectCategory = (path: string, section?: string) => {
    setSelectedCategory(path);
    setSelectedSubcategory(section || null);
  };

  // Handle upload to a specific section
  const handleUploadToSection = (sectionName: string, pagePath: string) => {
    openMediaLibraryForSection(pagePath, sectionName);
  };

  // Check if a cloudinary ID is for a video
  function isVideoAsset(publicId: string): boolean {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
    const extension = publicId.split('.').pop()?.toLowerCase();
    
    if (!extension) return false;
    return videoExtensions.includes(extension);
  }

  // Filter site structure based on search term
  const filterSiteStructure = (structure: Record<string, SiteStructureNode>): Record<string, SiteStructureNode> => {
    if (!searchTerm) return structure;
    
    const searchLower = searchTerm.toLowerCase();
    const result: Record<string, SiteStructureNode> = {};
    
    // Helper function to check if this node or any of its children match the search
    const nodeMatchesSearch = (node: SiteStructureNode): boolean => {
      // Check if node name or path matches
      if (node.name.toLowerCase().includes(searchLower) || node.path.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Check if any section matches
      if (node.sections.some(section => section.toLowerCase().includes(searchLower))) {
        return true;
      }
      
      // Check if any children match
      return Object.values(node.children).some(child => nodeMatchesSearch(child));
    };
    
    // Filter top-level nodes
    Object.entries(structure).forEach(([key, node]) => {
      if (nodeMatchesSearch(node)) {
        result[key] = node;
      }
    });
    
    return result;
  };

  // Sidebar component to display the hierarchical tree
  const Sidebar = () => {
    // Filter the site structure based on search term if needed
    const filteredStructure = searchTerm 
      ? filterSiteStructure(siteStructure)
      : siteStructure;
    
    if (isLoadingSiteStructure) {
      return <div className="py-4 text-gray-400">Loading site structure...</div>;
    }
    
    if (Object.keys(filteredStructure).length === 0) {
      return <div className="py-4 text-gray-400">No pages found. Try adjusting your search.</div>;
    }

    return (
      <div className={directoryStyles.content}>
        {Object.entries(filteredStructure).map(([key, node]) => (
          <CategoryNode 
              key={key} 
            node={node}
              onSelect={selectCategory}
              onToggle={toggleCategory}
            isExpanded={expandedCategories[node.path] || false}
            level={0}
            />
          ))}
      </div>
    );
  };

  // CategoryNode component to recursively render the tree
  const CategoryNode = ({ 
    node, 
    onSelect,
    onToggle,
    isExpanded,
    level = 0
  }: { 
    node: SiteStructureNode, 
    onSelect: (path: string, section?: string) => void,
    onToggle: (path: string) => void,
    isExpanded: boolean,
    level: number
  }) => {
    const hasChildren = Object.keys(node.children).length > 0 || node.sections.length > 0;
    const indentStyle = { paddingLeft: `${level * 12 + 16}px` };
    
    return (
      <div>
        <div 
          className={`${directoryStyles.item} ${directoryStyles.folderItem}`}
          style={indentStyle}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.path);
            onSelect(node.path);
          }}
        >
          <div className="flex items-center flex-grow cursor-pointer">
              <FolderIcon />
            <span className="ml-2">{node.name}</span>
          </div>
          {hasChildren && (
            <button className="ml-auto text-gray-400 hover:text-white">
              {isExpanded ? '▼' : '►'}
            </button>
          )}
        </div>
        
        {isExpanded && (
          <div>
            {/* Show sections */}
            {node.sections.map(section => (
              <div 
                key={`${node.path}-${section}`}
                className={`${directoryStyles.item} ${directoryStyles.folderItem}`}
                style={{ paddingLeft: `${(level + 1) * 12 + 16}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(node.path, section);
                }}
              >
                <div className="flex items-center">
                  <FileIcon />
                  <span className="ml-2">{section}</span>
          </div>
                <button
                  className="ml-auto text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadToSection(section, node.path);
                  }}
                >
                  Upload
                </button>
        </div>
            ))}
            
            {/* Show child nodes recursively */}
            {Object.values(node.children).map(childNode => (
              <CategoryNode 
                key={childNode.path}
                node={childNode}
                onSelect={onSelect}
                onToggle={onToggle}
                isExpanded={!!expandedCategories[childNode.path]}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Main content component
  const MainContent = () => {
    if (!selectedCategory || !selectedSubcategory) {
      return (
        <div className="p-6 text-center text-gray-400">
          <p>Select a page and section from the Media Explorer to view or manage media.</p>
        </div>
      );
    }

    const pagePath = selectedCategory;
    const sectionName = selectedSubcategory;
    
    // Filter section media items for the selected page and section
    const sectionItems = sectionMediaItems.filter(
      item => item.page_path === pagePath && item.section_name === sectionName
    );
    
    // Create breadcrumb path
    const breadcrumbs = getBreadcrumbItems();
    
      return (
      <div className="p-4">
        {/* Breadcrumb navigation */}
        {breadcrumbs.length > 0 && (
          <div className="mb-4 text-sm flex items-center text-gray-400">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">→</span>}
                <span className={index === breadcrumbs.length - 1 ? "text-white" : ""}>{item}</span>
          </div>
            ))}
          </div>
        )}
        
        {/* Section header with path and upload button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-white">
            {pagePath} - {sectionName}
          </h2>
          <AddMediaButton pagePath={pagePath} sectionName={sectionName} />
        </div>
        
        {/* Section media content */}
        {sectionItems.length === 0 ? (
          <div className="border border-zinc-800 rounded-md p-8 text-center bg-zinc-900 text-gray-400">
            <p>No media found for this section. Upload new media using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sectionItems.map((item) => (
              <div key={item.id} className="border border-zinc-800 rounded-md overflow-hidden bg-zinc-900">
                {/* Media display */}
                <div className="aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden">
                  {item.media_asset ? (
                    item.media_asset.type === 'video' ? (
                      <CldVideo
                        publicId={item.media_asset.cloudinary_id}
                        width={640}
                        height={360}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <CldImage
                        src={item.media_asset.cloudinary_id}
                        width={640}
                        height={360}
                        className="max-w-full max-h-full object-contain"
                        alt={item.media_asset.alt_text || 'Media asset'}
                      />
                    )
                  ) : (
                    <div className="text-gray-500">Media not found</div>
                  )}
                  </div>
                
                {/* Media info and controls */}
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      {item.media_asset && (
                        <h3 className="font-medium text-white">
                          {item.media_asset.title || item.media_asset.cloudinary_id.split('/').pop()}
                        </h3>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {item.media_asset && (
                          <>
                            {item.media_asset.type} • 
                            {item.media_asset.width && item.media_asset.height && 
                              ` ${item.media_asset.width}×${item.media_asset.height}`
                            }
                            {item.media_asset.format && ` • ${item.media_asset.format}`}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex">
                    <button
                        className="px-2 py-1 text-xs bg-blue-900 text-white rounded-md hover:bg-blue-800 mr-1"
                        onClick={() => openMediaLibraryForSection(pagePath, sectionName, item.id)}
                    >
                      Replace
                    </button>
                    <button
                        className="px-2 py-1 text-xs bg-red-900 text-white rounded-md hover:bg-red-800"
                        onClick={() => deleteSectionMedia(item.id, pagePath)}
                    >
                        Remove
                    </button>
                  </div>
                </div>
                  
                  {item.media_asset && (
                    <div className="text-xs font-mono text-gray-500 break-all mt-2">
                      {item.media_asset.cloudinary_id}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Delete section media item
  const deleteSectionMedia = async (id: string, pagePath: string) => {
    if (!confirm('Are you sure you want to delete this media assignment? This will not delete the actual media asset from Cloudinary.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/media/section-media?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Show success toast
      toast({
        title: "Deleted",
        description: "The media assignment has been deleted.",
        duration: 3000,
      });
      
      // Refresh the section media items list
      fetchSectionMediaItems();
      
    } catch (error: any) {
      console.error('Error deleting section media:', error);
      setError(`Error deleting section media: ${error.message}`);
      
      toast({
        title: "Error",
        description: `Error deleting section media: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Function to get breadcrumb items
  const getBreadcrumbItems = (): string[] => {
    const breadcrumbs: string[] = ['Media'];
    
    if (selectedCategory) {
      breadcrumbs.push(selectedCategory);
      
      if (selectedSubcategory) {
        breadcrumbs.push(selectedSubcategory);
      }
    }
    
    return breadcrumbs;
  };

  // Button component for adding media to a section
  const AddMediaButton = ({ pagePath, sectionName }: { pagePath: string, sectionName: string }) => {
  return (
          <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm flex items-center"
        onClick={() => openMediaLibraryForSection(pagePath, sectionName)}
          >
        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Media
          </button>
    );
  };

  // Component for uploading media to a section
  const UploadButton = ({ pagePath, sectionName }: { pagePath: string, sectionName: string }) => {
    return (
          <button
        className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs px-2 py-1 rounded"
        onClick={() => openMediaLibraryForSection(pagePath, sectionName)}
          >
        Upload
          </button>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Script
        src={CLOUDINARY_SCRIPT_URL}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="beforeInteractive"
      />
      
      {/* Main header with title and search */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <h1 className="text-2xl font-bold mb-4">Media Library</h1>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-200 text-red-800 p-4 rounded-md mb-4">
            <p>Error updating media: {error}</p>
            </div>
        )}
        
        {/* Search and upload */}
        <div className="flex gap-3">
              <input
                type="text"
            placeholder="Search for pages, sections, or media..."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
              <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onClick={() => openMediaLibraryForSection(
              selectedCategory || 'home',
              selectedSubcategory || 'main'
            )}
          >
            Upload New Media
              </button>
            </div>
          </div>
      
      {/* Main content with sidebar and details */}
      <div className="flex">
        {/* Sidebar with directory tree */}
        <div className="w-1/3 border-r border-zinc-800 p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <FolderIcon />
            <span className="ml-2">MEDIA EXPLORER</span>
          </h2>
          <Sidebar />
        </div>
        
        {/* Main content area */}
        <div className="w-2/3 max-h-[calc(100vh-140px)] overflow-y-auto">
          <MainContent />
      </div>
      </div>
    </div>
  );
} 