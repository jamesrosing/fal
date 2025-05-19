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
  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
    />
  </svg>
);

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
      const existingAssetData = await existingAssetResponse.json();
      
      let mediaAssetId;
      
      // If media asset doesn't exist, create it
      if (!existingAssetData.mediaAssets || existingAssetData.mediaAssets.length === 0) {
        // Create new media asset
        const assetResponse = await fetch('/api/media/assets/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cloudinary_id: cloudinaryId,
            type: isVideoAsset(cloudinaryId) ? 'video' : 'image',
            title: cloudinaryId.split('/').pop() || cloudinaryId,
            alt_text: cloudinaryId.split('/').pop() || cloudinaryId,
          }),
        });
        
        if (!assetResponse.ok) {
          throw new Error(`HTTP error! status: ${assetResponse.status}`);
        }
        
        const assetData = await assetResponse.json();
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
      } else {
        // Create new section media entry
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
      }
      
      // Show success toast
      toast({
        title: "Media updated",
        description: "The media assignment has been updated successfully.",
        duration: 3000,
      });
      
      // Refresh the section media items list
      fetchSectionMediaItems();
      
    } catch (err) {
      setError(`Error updating media: ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: "Error",
        description: `Error updating media: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Fetch section media items
  async function fetchSectionMediaItems() {
    try {
      const response = await fetch('/api/media/section-media');
      const data = await response.json();
      
      if (data.sectionMedia) {
        setSectionMediaItems(data.sectionMedia);
      } else {
        setError('No section media items found');
      }
    } catch (error: any) {
      console.error('Error fetching section media items:', error);
      setError(`Error fetching section media items: ${error.message}`);
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

  // Add useEffect to fetch data on component mount
  useEffect(() => {
    fetchSectionMediaItems();
    fetchMediaAssets();
    fetchSiteStructure();
  }, []);
  
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
    if (typeof window === 'undefined' || !window.cloudinary) {
      setError('Cloudinary script not loaded');
      return;
    }
    
    try {
      // Get environment variables
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
      
      if (!cloudName || !apiKey) {
        setError('Missing Cloudinary credentials.');
        return;
      }
      
      // Configure and open the Media Library widget
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
        },
        {
          insertHandler: (data: any) => {
            if (!data || !data.assets || data.assets.length === 0) {
              return;
            }
            
            const asset = data.assets[0];
            handleMediaSelect(asset.public_id, sectionMediaId, pagePath, sectionName);
          },
        }
      );
      
      mediaLibrary.show();
      
    } catch (error: any) {
      console.error('Error opening Cloudinary Media Library:', error);
      setError(`Error opening Cloudinary Media Library: ${error.message}`);
    }
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
    const filteredStructure = filterSiteStructure(siteStructure);
    
    if (isLoadingSiteStructure) {
      return (
        <div className="w-1/3 pr-4">
          <div className={directoryStyles.container}>
            <div className={directoryStyles.header}>
              <div className="flex items-center">
                <FolderIcon />
                <span>MEDIA EXPLORER</span>
              </div>
            </div>
            <div className="p-4 text-center text-gray-400">
              <p>Loading site structure...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-1/3 pr-4 overflow-auto max-h-[calc(100vh-200px)]">
        <div className={directoryStyles.container}>
          <div className={directoryStyles.header}>
            <div className="flex items-center">
              <FolderIcon />
              <span>MEDIA EXPLORER</span>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md"
            >
              {showCreateForm ? 'Cancel' : 'New Section'}
            </button>
          </div>
          
          {showCreateForm && (
            <div className="p-4 border-b border-zinc-700 bg-zinc-900">
              <h3 className="font-medium mb-2 text-white">Create New Section</h3>
              <div className="mb-2">
                <label className="block text-sm text-gray-400 mb-1">Page Path</label>
                <input
                  type="text"
                  value={newSectionMedia.page_path}
                  onChange={(e) => setNewSectionMedia(prev => ({ ...prev, page_path: e.target.value }))}
                  placeholder="e.g., services/dermatology"
                  className="w-full p-2 bg-zinc-800 text-white border border-zinc-700 rounded-md"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-400 mb-1">Section Name</label>
                <input
                  type="text"
                  value={newSectionMedia.section_name}
                  onChange={(e) => setNewSectionMedia(prev => ({ ...prev, section_name: e.target.value }))}
                  placeholder="e.g., hero, gallery"
                  className="w-full p-2 bg-zinc-800 text-white border border-zinc-700 rounded-md"
                />
              </div>
              <button
                onClick={createNewSectionMedia}
                className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Create & Upload Media
              </button>
            </div>
          )}
          
          <div className={directoryStyles.content}>
            {Object.values(filteredStructure).map(node => (
              <CategoryNode 
                key={node.path}
                node={node}
                onSelect={selectCategory}
                onToggle={toggleCategory}
                isExpanded={!!expandedCategories[node.path]}
                level={0}
              />
            ))}
          </div>
        </div>
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
    // Get filtered section media items for the selected category/subcategory
    const filteredItems = getFilteredSectionMedia();
    
    // Sort by section name and display order
    filteredItems.sort((a, b) => {
      if (a.section_name !== b.section_name) {
        return a.section_name.localeCompare(b.section_name);
      }
      return a.display_order - b.display_order;
    });
    
    // If no category is selected, show a message
    if (!selectedCategory) {
      return (
        <div className="w-2/3 pl-4">
          <div className={directoryStyles.container}>
            <div className={directoryStyles.header}>
              <span>Select a page from the sidebar to view and manage media</span>
            </div>
            <div className="p-8 text-center text-gray-400">
              <p>No page selected. Click on a page in the Media Explorer to view its media.</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                onClick={openMediaLibrary}
              >
                Browse All Media
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Create a title based on selected category and subcategory
    let sectionTitle = selectedCategory;
    if (selectedSubcategory) {
      sectionTitle = `${selectedCategory} - ${selectedSubcategory}`;
    }
    
    return (
      <div className="w-2/3 pl-4">
        <div className={directoryStyles.container}>
          <div className={directoryStyles.header}>
            <span>{sectionTitle}</span>
            <button
              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-md"
              onClick={() => {
                if (selectedSubcategory) {
                  handleUploadToSection(selectedSubcategory, selectedCategory);
                } else {
                  openMediaLibraryForSection(selectedCategory, 'main');
                }
              }}
            >
              Add Media
            </button>
          </div>
          
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No media found for this section. Upload new media using the button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-zinc-900 rounded-md overflow-hidden border border-zinc-800">
                  <div className="aspect-video relative overflow-hidden bg-zinc-950 flex items-center justify-center">
                    {item.media_asset?.type === 'video' ? (
                      <CldVideo
                        publicId={item.media_asset.cloudinary_id}
                        width={300}
                        height={169}
                        autoPlay={false}
                        controls
                      />
                    ) : (
                      <CldImage
                        src={item.media_asset.cloudinary_id}
                        width={300}
                        height={169}
                        alt={item.media_asset.alt_text || item.media_asset.cloudinary_id}
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-medium truncate max-w-[200px]">
                          {item.section_name}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-[200px]">
                          {item.media_asset.cloudinary_id}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Order: {item.display_order}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 text-xs px-2 py-1 bg-zinc-800 text-white rounded-md border border-zinc-700 hover:bg-zinc-700"
                        onClick={() => openMediaLibraryForSection(item.page_path, item.section_name, item.id)}
                      >
                        Replace
                      </button>
                      <button
                        className="flex-1 text-xs px-2 py-1 bg-red-900 text-white rounded-md border border-red-800 hover:bg-red-800"
                        onClick={() => deleteSectionMedia(item.id, item.page_path)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

  // Get breadcrumb items for the selected path
  const getBreadcrumbItems = () => {
    if (!selectedCategory) return [];
    
    const parts = selectedCategory.split('/').filter(Boolean);
    const breadcrumbs = [];
    let currentPath = '';
    
    for (let i = 0; i < parts.length; i++) {
      currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
      breadcrumbs.push({
        name: parts[i],
        path: currentPath
      });
    }
    
    if (selectedSubcategory) {
      breadcrumbs.push({
        name: selectedSubcategory,
        path: `${currentPath}/${selectedSubcategory}`
      });
    }
    
    return breadcrumbs;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Script
        src="https://media-library.cloudinary.com/global/all.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setError('Failed to load Cloudinary script')}
      />
      
      <h1 className="text-3xl font-bold mb-6 text-white">Media Library</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search for pages, sections, or media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-zinc-900 text-white border border-zinc-700 rounded-lg"
            />
          </div>
          <button
            onClick={openMediaLibrary}
            disabled={!scriptLoaded}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload New Media
          </button>
        </div>
        
        {selectedCategory && (
          <div className="flex items-center space-x-2 text-gray-400 mb-4">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
              className="text-white hover:text-blue-400"
            >
              Media
            </button>
            {getBreadcrumbItems().map((item, index) => (
              <React.Fragment key={item.path}>
                <span>/</span>
                <button
                  onClick={() => {
                    if (index === getBreadcrumbItems().length - 1) return;
                    
                    setSelectedCategory(item.path);
                    setSelectedSubcategory(null);
                  }}
                  className={`hover:text-blue-400 ${
                    index === getBreadcrumbItems().length - 1 ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap -mx-4">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
} 