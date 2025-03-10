'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot, DropResult } from '@hello-pangea/dnd';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { handleMediaUpload } from './actions';
import { ChevronRight, ChevronDown, FolderIcon, ImageIcon, FileIcon } from 'lucide-react';

// Get the upload preset from environment variables
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'emsculpt';
console.log('Using Cloudinary upload preset:', UPLOAD_PRESET);

/**
 * Admin Media Management Page
 * 
 * This page provides an interface for managing media assets across the site.
 * It uses the SiteMediaManager component to display and manage media placeholders.
 * 
 * Features:
 * - View all media placeholders organized by section and area
 * - Upload new media assets for each placeholder
 * - Preview media assets with optimized delivery
 * 
 * @see https://next.cloudinary.dev/ for Next Cloudinary documentation
 */

// Types for site structure
interface MediaPlaceholder {
  id: string;
  name: string;
  description: string;
  path: string;
  area: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

interface PageSection {
  id: string;
  name: string;
  description?: string;
  mediaPlaceholders: MediaPlaceholder[];
}

interface SitePage {
  id: string;
  name: string;
  path: string;
  sections: PageSection[];
}

interface MediaAsset {
  id: string;
  publicId: string;
  name: string;
  uploadedAt: string;
  type: 'image' | 'video';
  preview: string;
}

// File tree node structure
interface TreeNode {
  id: string;
  name: string;
  type: 'directory' | 'page' | 'section' | 'placeholder';
  path: string;
  children: TreeNode[];
  data?: any; // Original data object
}

export default function AdminMediaPage() {
  const [mediaMap, setMediaMap] = useState<SitePage[]>([]);
  const [mediaAssets, setMediaAssets] = useState<Record<string, any>>({});
  const [availableAssets, setAvailableAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Fetch media map and assets
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch media map
        const mapResponse = await fetch('/api/site/media-map');
        if (!mapResponse.ok) {
          throw new Error(`Failed to fetch media map: ${mapResponse.status} ${mapResponse.statusText}`);
        }
        const mapData = await mapResponse.json();
        
        // Fetch media assets
        const assetsResponse = await fetch('/api/site/media-assets');
        if (!assetsResponse.ok) {
          throw new Error(`Failed to fetch media assets: ${assetsResponse.status} ${assetsResponse.statusText}`);
        }
        const assetsData = await assetsResponse.json();
        
        // Build file tree from media map
        const tree = buildFileTree(mapData);
        
        // Initialize expanded state for all nodes
        const initialExpandedNodes: Record<string, boolean> = {};
        // Expand root nodes by default
        tree.forEach(node => {
          initialExpandedNodes[node.id] = true;
        });
        
        setMediaMap(mapData);
        setMediaAssets(assetsData || {});
        setFileTree(tree);
        setExpandedNodes(initialExpandedNodes);
        
        // Fetch available assets from Cloudinary (mock for now)
        // In a real implementation, you would fetch this from Cloudinary or your database
        setAvailableAssets([
          {
            id: 'asset1',
            publicId: 'sample',
            name: 'Sample Image',
            uploadedAt: new Date().toISOString(),
            type: 'image',
            preview: 'https://res.cloudinary.com/demo/image/upload/sample'
          },
          {
            id: 'asset2',
            publicId: 'sample2',
            name: 'Sample Image 2',
            uploadedAt: new Date().toISOString(),
            type: 'image',
            preview: 'https://res.cloudinary.com/demo/image/upload/sample'
          }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({
          text: 'Failed to load media data. Please try refreshing the page.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Build file tree from media map
  const buildFileTree = (mediaMap: SitePage[]): TreeNode[] => {
    // Create root node for app directory
    const appNode: TreeNode = {
      id: 'app',
      name: 'app',
      type: 'directory',
      path: '/app',
      children: []
    };
    
    // Create root node for components directory
    const componentsNode: TreeNode = {
      id: 'components',
      name: 'components',
      type: 'directory',
      path: '/components',
      children: []
    };
    
    // Process each page in the media map
    mediaMap.forEach(page => {
      // Determine which root node to add to
      const parentNode = page.id === 'app' ? appNode : componentsNode;
      
      // Create page node
      const pageNode: TreeNode = {
        id: page.id,
        name: page.name,
        type: 'page',
        path: page.path,
        children: [],
        data: page
      };
      
      // Process sections for this page
      page.sections.forEach(section => {
        // Create section node
        const sectionNode: TreeNode = {
          id: `${page.id}-${section.id}`,
          name: section.name,
          type: 'section',
          path: `${page.path}/${section.id}`,
          children: [],
          data: section
        };
        
        // Process media placeholders for this section
        section.mediaPlaceholders.forEach(placeholder => {
          // Create placeholder node
          const placeholderNode: TreeNode = {
            id: placeholder.id,
            name: placeholder.name,
            type: 'placeholder',
            path: placeholder.path,
            children: [],
            data: placeholder
          };
          
          // Add placeholder to section
          sectionNode.children.push(placeholderNode);
        });
        
        // Add section to page if it has placeholders or we're not filtering
        if (sectionNode.children.length > 0) {
          pageNode.children.push(sectionNode);
        }
      });
      
      // Add page to parent node if it has sections
      if (pageNode.children.length > 0) {
        parentNode.children.push(pageNode);
      }
    });
    
    // Return root nodes that have children
    return [appNode, componentsNode].filter(node => node.children.length > 0);
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Handle dropping an asset onto a placeholder
    if (source.droppableId === 'available-assets' && destination.droppableId.startsWith('placeholder-')) {
      const placeholderId = destination.droppableId.replace('placeholder-', '');
      const assetPublicId = draggableId;
      
      try {
        // Update the media asset in the database
        await handleMediaUpload(placeholderId, assetPublicId);
        
        // Update local state
        setMediaAssets(prev => ({
          ...prev,
          [placeholderId]: {
            placeholderId,
            cloudinaryPublicId: assetPublicId,
            uploadedAt: new Date().toISOString()
          }
        }));
        
        setMessage({
          text: `Successfully assigned image to ${placeholderId}`,
          type: 'success'
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error('Error assigning media asset:', error);
        setMessage({
          text: 'Failed to assign media asset. Please try again.',
          type: 'error'
        });
      }
    }
  };

  // Handle successful upload
  const handleUploadSuccess = async (placeholderId: string, result: any) => {
    console.log('Handling upload success for placeholder:', placeholderId);
    console.log('Upload result info:', result.info);
    
    try {
      // Get the public ID from the result
      const publicId = result.info.public_id;
      console.log('Public ID:', publicId);
      
      // Update the media asset in the database
      console.log('Updating media asset in database...');
      await handleMediaUpload(placeholderId, publicId);
      console.log('Database update successful');
      
      // Update local state
      setMediaAssets(prev => ({
        ...prev,
        [placeholderId]: {
          placeholderId,
          cloudinaryPublicId: publicId,
          uploadedAt: new Date().toISOString()
        }
      }));
      console.log('Local state updated');
      
      // Add to available assets
      setAvailableAssets(prev => [
        ...prev,
        {
          id: publicId,
          publicId,
          name: result.info.original_filename,
          uploadedAt: new Date().toISOString(),
          type: 'image',
          preview: result.info.secure_url
        }
      ]);
      console.log('Added to available assets');
      
      setMessage({
        text: `Successfully uploaded image for ${placeholderId}`,
        type: 'success'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error handling upload:', error);
      setMessage({
        text: 'Failed to save media asset. Please try again.',
        type: 'error'
      });
    }
  };

  // Toggle expanded state for a node
  const toggleNodeExpanded = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Select a node
  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node);
  };

  // Filter nodes by search query
  const filterNodes = (node: TreeNode): boolean => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const nameMatch = node.name.toLowerCase().includes(query);
    const pathMatch = node.path.toLowerCase().includes(query);
    
    // For placeholder nodes, also check description
    const descriptionMatch = node.type === 'placeholder' && 
      node.data?.description?.toLowerCase().includes(query);
    
    // If this node matches, return true
    if (nameMatch || pathMatch || descriptionMatch) return true;
    
    // If any children match, return true
    if (node.children.length > 0) {
      const hasMatchingChild = node.children.some(child => filterNodes(child));
      return hasMatchingChild;
    }
    
    return false;
  };

  // Render a tree node
  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    // Skip nodes that don't match the search query
    if (searchQuery && !filterNodes(node)) return null;
    
    const isExpanded = expandedNodes[node.id] || false;
    const hasChildren = node.children.length > 0;
    const isPlaceholder = node.type === 'placeholder';
    const asset = isPlaceholder ? mediaAssets[node.id] : null;
    const hasAsset = asset && asset.cloudinaryPublicId;
    
    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
            selectedNode?.id === node.id ? 'bg-blue-50 dark:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNodeExpanded(node.id);
            }
            handleNodeSelect(node);
          }}
        >
          {/* Expand/collapse icon or placeholder */}
          <span className="w-5 h-5 flex items-center justify-center mr-1">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <span className="w-4"></span>
            )}
          </span>
          
          {/* Node icon */}
          <span className="mr-2">
            {node.type === 'directory' ? (
              <FolderIcon className="w-4 h-4 text-yellow-500" />
            ) : node.type === 'page' ? (
              <FileIcon className="w-4 h-4 text-blue-500" />
            ) : node.type === 'section' ? (
              <FolderIcon className="w-4 h-4 text-green-500" />
            ) : (
              <ImageIcon className="w-4 h-4 text-purple-500" />
            )}
          </span>
          
          {/* Node name */}
          <span className="flex-grow truncate">{node.name}</span>
          
          {/* Status indicator for placeholders */}
          {isPlaceholder && (
            <span className={`w-3 h-3 rounded-full ${hasAsset ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          )}
        </div>
        
        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render placeholder details
  const renderPlaceholderDetails = (placeholder: MediaPlaceholder) => {
    const asset = mediaAssets[placeholder.id];
    const hasAsset = asset && asset.cloudinaryPublicId;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold">{placeholder.name}</h3>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {placeholder.description}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            <p>ID: {placeholder.id}</p>
            <p>Path: {placeholder.path}</p>
            <p>Dimensions: {placeholder.dimensions.width}×{placeholder.dimensions.height}</p>
          </div>
        </div>
        
        {/* Droppable area for placeholder */}
        <Droppable droppableId={`placeholder-${placeholder.id}`}>
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-4 border-2 border-dashed rounded-lg mb-4 transition-colors ${
                snapshot.isDraggingOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {/* Current image preview */}
              {hasAsset ? (
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                  <Image
                    src={getCloudinaryUrl(asset.cloudinaryPublicId)}
                    alt={placeholder.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-400">Drop an image here or upload a new one</span>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        {/* Upload widget */}
        <div>
          <p className="text-sm font-medium mb-2">
            {hasAsset ? 'Replace Image:' : 'Upload Image:'}
          </p>
          <CldUploadWidget
            uploadPreset={UPLOAD_PRESET}
            options={{
              maxFiles: 1,
              resourceType: "image",
              folder: `site/${placeholder.path}`,
              clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
              sources: ["local", "url", "camera", "unsplash"],
            }}
            onSuccess={(result: any) => {
              console.log('Upload result:', result);
              if (result.event === "success") {
                handleUploadSuccess(placeholder.id, result);
              }
            }}
            onError={(error: any) => {
              console.error('Upload error:', error);
              setMessage({
                text: `Upload failed: ${error.message || 'Unknown error'}`,
                type: 'error'
              });
            }}
          >
            {({ open }) => (
              <button
                onClick={() => open()}
                className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {hasAsset ? 'Replace Image' : 'Upload Image'}
              </button>
            )}
          </CldUploadWidget>
          
          <div className="mt-2 text-xs text-gray-500">
            Recommended size: {placeholder.dimensions.width}×{placeholder.dimensions.height}px
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Site Media Manager</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Site Media Manager</h1>
        
        {message && (
          <div className={`p-4 mb-4 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 
            message.type === 'error' ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left panel: File tree */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search media placeholders..."
                  className="w-full p-2 border rounded"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="overflow-auto max-h-[calc(100vh-240px)]">
                {fileTree.map(node => renderTreeNode(node))}
              </div>
            </div>
          </div>
          
          {/* Middle panel: Selected placeholder details */}
          <div className="w-full md:w-1/3">
            {selectedNode?.type === 'placeholder' ? (
              renderPlaceholderDetails(selectedNode.data)
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center h-64">
                <p className="text-gray-500">Select a media placeholder from the file tree</p>
              </div>
            )}
          </div>
          
          {/* Right panel: Available assets */}
          <div className="w-full md:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Available Assets</h2>
              
              {/* Upload new asset */}
              <div className="mb-4">
                <CldUploadWidget
                  uploadPreset={UPLOAD_PRESET}
                  options={{
                    maxFiles: 1,
                    resourceType: "image",
                    folder: "site/assets",
                    clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
                    sources: ["local", "url", "camera", "unsplash"],
                  }}
                  onSuccess={(result: any) => {
                    console.log('Upload result:', result);
                    if (result.event === "success") {
                      // Add to available assets
                      setAvailableAssets(prev => [
                        ...prev,
                        {
                          id: result.info.public_id,
                          publicId: result.info.public_id,
                          name: result.info.original_filename,
                          uploadedAt: new Date().toISOString(),
                          type: 'image',
                          preview: result.info.secure_url
                        }
                      ]);
                      
                      setMessage({
                        text: 'Successfully uploaded new asset',
                        type: 'success'
                      });
                      
                      // Clear message after 3 seconds
                      setTimeout(() => setMessage(null), 3000);
                    }
                  }}
                  onError={(error: any) => {
                    console.error('Upload error:', error);
                    setMessage({
                      text: `Upload failed: ${error.message || 'Unknown error'}`,
                      type: 'error'
                    });
                  }}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Upload New Asset
                    </button>
                  )}
                </CldUploadWidget>
              </div>
              
              {/* Draggable assets */}
              <Droppable droppableId="available-assets">
                {(provided: DroppableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3 overflow-auto max-h-[calc(100vh-320px)]"
                  >
                    {availableAssets.map((asset, index) => (
                      <Draggable
                        key={asset.id}
                        draggableId={asset.publicId}
                        index={index}
                      >
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-2 border rounded-lg ${
                              snapshot.isDragging ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                                <Image
                                  src={asset.preview}
                                  alt={asset.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <h5 className="font-medium text-sm">{asset.name}</h5>
                                <p className="text-xs text-gray-500">
                                  {new Date(asset.uploadedAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {asset.publicId}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              
              {availableAssets.length === 0 && (
                <div className="text-center p-4 text-gray-500">
                  No assets available. Upload some assets to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
} 