'use client';

import { useState, useEffect, useCallback } from 'react';
import { CloudinaryImage } from '@/components/CloudinaryImage';
import { CloudinaryVideo } from '@/components/CloudinaryVideo';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';
import { 
  CloudinaryAsset, 
  ImageArea,
  deleteFromCloudinary,
} from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit, 
  Copy, 
  Tag, 
  Folder, 
  Grid, 
  List, 
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Video,
  LayoutGrid,
  PlusCircle,
  FolderTree,
  CheckSquare2,
  FileSymlink,
  FolderInput,
  SlidersHorizontal,
  AlertCircle,
  Camera
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
import CldImage from '@/components/media/CldImage';
import CldVideo from '@/components/media/CldVideo';

  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MediaQueryParams {
  area?: ImageArea | 'all';
  folder?: string;
  tag?: string;
  resourceType?: 'image' | 'video' | 'all';
  searchTerm?: string;
  pageSize?: number;
  nextCursor?: string;
}

interface MediaManagementProps {
  onSelect?: (asset: CloudinaryAsset) => void;
  selectionMode?: 'single' | 'multiple' | 'none';
  initialArea?: ImageArea | 'all';
  showUploadButton?: boolean;
  uploadArea?: ImageArea;
  uploadFolder?: string;
  viewMode?: 'grid' | 'list';
  allowedResourceTypes?: ('image' | 'video')[];
}

interface FolderStructure {
  name: string;
  path: string;
  children: FolderStructure[];
}

interface AssetUsage {
  page: string;
  component: string;
  usage: string;
}

interface DuplicateGroup {
  publicIds: string[];
  similarity: number;
  assets?: Array<{
    publicId: string;
    url?: string;
    width?: number;
    height?: number;
    format?: string;
    created?: string;
  }>;
  criteria?: string;
}

/**
 * Comprehensive Media Management interface for admin users
 * This component provides a complete solution for browsing, organizing,
 * and managing Cloudinary assets.
 */
export function MediaManagement({
  onSelect,
  selectionMode = 'none',
  initialArea = 'all',
  showUploadButton = true,
  uploadArea,
  uploadFolder,
  viewMode: initialViewMode = 'grid',
  allowedResourceTypes = ['image', 'video']
}: MediaManagementProps) {
  // State for media assets and filtering
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
  const [selectedAssets, setSelectedAssets] = useState<CloudinaryAsset[]>([]);
  
  // Query parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<ImageArea | 'all'>(initialArea);
  const [selectedResourceType, setSelectedResourceType] = useState<'image' | 'video' | 'all'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [editAsset, setEditAsset] = useState<CloudinaryAsset | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [organizeFolders, setOrganizeFolders] = useState<string[]>([]);
  const [organizeTags, setOrganizeTags] = useState<string[]>([]);
  
  // Add these states to your component
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<{name: string, path: string}[]>([]);
  const [showUsage, setShowUsage] = useState<boolean>(false);
  const [assetUsage, setAssetUsage] = useState<Record<string, AssetUsage[]>>({});
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [showDuplicates, setShowDuplicates] = useState<boolean>(false);
  const [loadingDuplicates, setLoadingDuplicates] = useState<boolean>(false);
  
  // Add immediately after the other states in the component
  const [queryParams, setQueryParams] = useState<{
    area?: ImageArea | 'all';
    folder?: string;
    tag?: string;
    resourceType?: 'image' | 'video' | 'all';
    searchTerm?: string;
  }>({
    area: initialArea,
    resourceType: 'all',
    folder: '',
    tag: '',
    searchTerm: ''
  });
  
  // Add immediately after the organizeTags state declaration
  // Define area options for filtering
  const areaOptions = [
    { label: 'Hero Images', value: 'hero' },
    { label: 'Gallery', value: 'gallery' },
    { label: 'Team', value: 'team' },
    { label: 'Article', value: 'article' },
    { label: 'Service', value: 'service' },
    { label: 'Logo', value: 'logo' },
    { label: 'Video Thumbnail', value: 'video-thumbnail' }
  ];
  
  // Load available folders and tags for organization
  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const response = await fetch('/api/cloudinary/organizers');
        if (response.ok) {
          const data = await response.json();
          setOrganizeFolders(data.folders || []);
          setOrganizeTags(data.tags || []);
        }
      } catch (error) {
        console.error('Failed to load folders and tags', error);
      }
    };
    
    fetchOrganizers();
  }, []);
  
  // Load media assets based on current filters
  const loadAssets = useCallback(async (refresh = false) => {
    setLoading(true);
    
    const params: MediaQueryParams = {
      area: selectedArea !== 'all' ? selectedArea : undefined,
      resourceType: selectedResourceType !== 'all' ? selectedResourceType : undefined,
      folder: selectedFolder || undefined,
      tag: selectedTag || undefined,
      searchTerm: searchTerm || undefined,
      pageSize: 20,
      // Only include cursor when not refreshing
      ...(nextCursor && !refresh ? { nextCursor } : {})
    };
    
    try {
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      const response = await fetch(`/api/cloudinary/assets?${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      
      const data = await response.json();
      
      // If refreshing, replace all assets, otherwise append
      setAssets(prevAssets => refresh ? data.assets : [...prevAssets, ...data.assets]);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor || '');
    } catch (error) {
      console.error('Error loading assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load media assets. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedArea, selectedResourceType, selectedFolder, selectedTag, searchTerm, nextCursor]);
  
  // Initial load and refresh when filters change
  useEffect(() => {
    loadAssets(true);
  }, [selectedArea, selectedResourceType, selectedFolder, selectedTag, searchTerm]);
  
  // Handle asset selection
  const handleAssetSelect = (asset: CloudinaryAsset) => {
    if (selectionMode === 'none') return;
    
    if (selectionMode === 'single') {
      setSelectedAssets([asset]);
      if (onSelect) onSelect(asset);
    } else {
      // Multiple selection mode
      const isSelected = selectedAssets.some(a => a.publicId === asset.publicId);
      
      if (isSelected) {
        setSelectedAssets(prev => prev.filter(a => a.publicId !== asset.publicId));
      } else {
        setSelectedAssets(prev => [...prev, asset]);
      }
    }
  };
  
  // Handle asset deletion
  const handleDelete = async (asset: CloudinaryAsset) => {
    try {
      setLoading(true);
      await deleteFromCloudinary(asset.publicId);
      
      toast({
        title: 'Asset Deleted',
        description: 'The asset was successfully deleted.',
      });
      
      // Refresh the assets list
      loadAssets(true);
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the asset. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle organizing selected assets
  const handleOrganize = async (options: { folder?: string, tags?: string[] }) => {
    if (selectedAssets.length === 0) return;
    
    try {
      setLoading(true);
      
      await fetch('/api/cloudinary/organize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicIds: selectedAssets.map(asset => asset.publicId),
          folder: options.folder,
          tags: options.tags,
          addTags: true
        }),
      });
      
      toast({
        title: 'Assets Organized',
        description: `Successfully organized ${selectedAssets.length} assets.`,
      });
      
      // Refresh the assets list
      loadAssets(true);
      
      // Clear selection
      setSelectedAssets([]);
    } catch (error) {
      console.error('Failed to organize assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to organize assets. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle successful upload
  const handleUploadSuccess = (result: CloudinaryAsset | CloudinaryAsset[]) => {
    setUploadDialogOpen(false);
    
    const assetCount = Array.isArray(result) ? result.length : 1;
    
    toast({
      title: 'Upload Successful',
      description: `Successfully uploaded ${assetCount} ${assetCount === 1 ? 'asset' : 'assets'}.`,
    });
    
    // Refresh the assets list
    loadAssets(true);
  };
  
  // Render asset item based on view mode
  const renderAssetItem = (asset: CloudinaryAsset) => {
    const isSelected = selectedAssets.some(a => a.publicId === asset.publicId);
    const isImage = asset.resourceType === 'image';
    
    const usage = showUsage ? getAssetUsageInfo(asset.publicId) : [];
    const hasUsage = usage.length > 0;
    
    if (viewMode === 'grid') {
      return (
        <Card 
          key={asset.publicId} 
          className={`overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''} ${selectionMode !== 'none' ? 'cursor-pointer' : ''}`}
          onClick={() => selectionMode !== 'none' && handleAssetSelect(asset)}
        >
          <div className="relative aspect-square">
            {isImage ? (
              <CloudinaryImage
                publicId={asset.publicId}
                alt={asset.context?.alt || 'Media asset'}
                className="object-cover w-full h-full"
              />
            ) : (
              <CloudinaryVideo
                publicId={asset.publicId}
                className="object-cover w-full h-full"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            <div className="absolute top-2 right-2">
              {isSelected && (
                <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center">
                  ✓
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 flex justify-between items-center">
              <div className="flex items-center">
                {isImage ? (
                  <ImageIcon className="w-4 h-4 mr-1 text-white" />
                ) : (
                  <Video className="w-4 h-4 mr-1 text-white" />
                )}
                <span className="text-xs text-white truncate">
                  {asset.publicId.split('/').pop()}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(asset.publicId)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Public ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setEditAsset(asset)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(asset);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {asset.tags && asset.tags.length > 0 && (
            <CardFooter className="p-2 flex-wrap gap-1">
              {asset.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {asset.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{asset.tags.length - 3} more
                </Badge>
              )}
            </CardFooter>
          )}
          {showUsage && (
            <div className="absolute top-2 right-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        hasUsage ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    >
                      <FileSymlink className="w-3 h-3 text-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasUsage 
                      ? `Used in ${usage.length} place${usage.length > 1 ? 's' : ''}`
                      : 'Not used in any tracked components'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </Card>
      );
    } else {
      // List view
      return (
        <div 
          key={asset.publicId}
          className={`flex items-center py-2 px-4 hover:bg-muted/50 rounded-md ${isSelected ? 'bg-muted' : ''}`}
          onClick={() => selectionMode !== 'none' && handleAssetSelect(asset)}
        >
          <div className="flex-shrink-0 mr-4 w-12 h-12 overflow-hidden rounded">
            {isImage ? (
              <CloudinaryImage
                publicId={asset.publicId}
                alt={asset.context?.alt || 'Media asset'}
                className="object-cover w-full h-full"
              />
            ) : (
              <CloudinaryVideo
                publicId={asset.publicId}
                className="object-cover w-full h-full"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
          </div>
          
          <div className="flex-grow">
            <div className="text-sm font-medium truncate">
              {asset.publicId.split('/').pop()}
            </div>
            <div className="text-xs text-muted-foreground">
              {asset.width}×{asset.height} • {asset.format || 'unknown'} • {getAssetInfo(asset)}
            </div>
            {asset.tags && asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {asset.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {asset.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{asset.tags.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(asset.publicId)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Public ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditAsset(asset)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(asset);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      );
    }
  };
  
  // Helper to get asset info
  const getAssetInfo = (asset: CloudinaryAsset) => {
    if (asset.resourceType === 'image') {
      return `Image • ${formatFileSize(getApproximateSize(asset))}`;
    } else if (asset.resourceType === 'video') {
      return `Video • ${formatFileSize(getApproximateSize(asset))}`;
    }
    return 'Unknown';
  };
  
  // Helper to estimate file size (very rough approximation)
  const getApproximateSize = (asset: CloudinaryAsset) => {
    if (asset.resourceType === 'image') {
      // Rough approximation based on resolution and format
      const pixels = asset.width * asset.height;
      let bytesPerPixel = 0.1; // Default compression
      
      if (asset.format === 'png') bytesPerPixel = 0.25;
      else if (asset.format === 'jpeg' || asset.format === 'jpg') bytesPerPixel = 0.1;
      else if (asset.format === 'webp') bytesPerPixel = 0.05;
      
      return pixels * bytesPerPixel;
    } else if (asset.resourceType === 'video') {
      // Very rough approximation
      return asset.width * asset.height * 0.5 * 30; // Assuming 30 second video
    }
    return 100000; // Default 100KB
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  // Render asset edit dialog
  const renderAssetEditDialog = () => {
    if (!editAsset) return null;
    
    return (
      <Dialog open={!!editAsset} onOpenChange={(open) => !open && setEditAsset(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Asset Details</DialogTitle>
            <DialogDescription>
              Update information and organization for this asset
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="aspect-square overflow-hidden rounded-md">
                {editAsset.resourceType === 'image' ? (
                  <CloudinaryImage
                    publicId={editAsset.publicId}
                    alt={editAsset.context?.alt || 'Media asset'}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <CloudinaryVideo
                    publicId={editAsset.publicId}
                    className="object-cover w-full h-full"
                    controls
                  />
                )}
              </div>
              <div className="mt-2">
                <h4 className="text-sm font-medium">Public ID</h4>
                <p className="text-xs text-muted-foreground break-all">{editAsset.publicId}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={editAsset.context?.alt || ''}
                  onChange={(e) => {
                    setEditAsset({
                      ...editAsset,
                      context: {
                        ...editAsset.context,
                        alt: e.target.value
                      }
                    });
                  }}
                />
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editAsset.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => {
                          setEditAsset({
                            ...editAsset,
                            tags: editAsset.tags?.filter(t => t !== tag)
                          });
                        }}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7">
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />
                        Add Tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Tags</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="new-tag">New Tag</Label>
                          <div className="flex gap-2">
                            <Input id="new-tag" placeholder="Enter tag name" />
                            <Button>Add</Button>
                          </div>
                        </div>
                        <div>
                          <Label>Common Tags</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {organizeTags.slice(0, 10).map(tag => (
                              <Badge 
                                key={tag} 
                                variant="outline" 
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => {
                                  setEditAsset({
                                    ...editAsset,
                                    tags: [...(editAsset.tags || []), tag]
                                  });
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAsset(null)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Save changes to asset
              toast({
                title: 'Changes Saved',
                description: 'Asset details have been updated.'
              });
              setEditAsset(null);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Add these functions to your component
  const fetchFolderStructure = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cloudinary/folders');
      const data = await response.json();
      
      if (data.success && data.folderStructure) {
        setFolderStructure(data.folderStructure);
      } else {
        console.error('Failed to fetch folder structure:', data.error);
      }
    } catch (error) {
      console.error('Error fetching folder structure:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const navigateToFolder = (path: string) => {
    setCurrentFolder(path);
    
    // Update breadcrumbs
    if (!path) {
      setBreadcrumbs([]);
    } else {
      const parts = path.split('/');
      const crumbs = [];
      let currentPath = '';
      
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        crumbs.push({
          name: part,
          path: currentPath
        });
      }
      
      setBreadcrumbs(crumbs);
    }
    
    // Update query parameters and fetch assets for this folder
    setQueryParams(prevParams => ({
      ...prevParams,
      folder: path || undefined
    }));
  };

  const fetchAssetUsage = useCallback(async () => {
    try {
      const response = await fetch('/api/cloudinary/asset-usage');
      const data = await response.json();
      
      if (data.success && data.usage) {
        setAssetUsage(data.usage);
      } else {
        console.error('Failed to fetch asset usage:', data.error);
      }
    } catch (error) {
      console.error('Error fetching asset usage:', error);
    }
  }, []);

  const findDuplicates = useCallback(async () => {
    try {
      setLoadingDuplicates(true);
      const response = await fetch('/api/cloudinary/duplicates', {
        method: 'GET', // Using the basic duplicate detection
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.potentialDuplicates) {
        setDuplicateGroups(data.potentialDuplicates);
        setShowDuplicates(true);
      } else {
        alert('No duplicate assets found.');
        setShowDuplicates(false);
      }
    } catch (error) {
      console.error('Error finding duplicates:', error);
      alert('Failed to find duplicates. See console for details.');
    } finally {
      setLoadingDuplicates(false);
    }
  }, []);

  const getAssetUsageInfo = (publicId: string) => {
    return assetUsage[publicId] || [];
  };

  // Add these useEffects to your component initialization
  useEffect(() => {
    fetchFolderStructure();
  }, [fetchFolderStructure]);

  useEffect(() => {
    if (showUsage) {
      fetchAssetUsage();
    }
  }, [showUsage, fetchAssetUsage]);
  
  // Render folder tree structure recursively
  const renderFolderTree = (folders: FolderStructure[], level = 0) => {
    return (
      <div className={`pl-${level > 0 ? 4 : 0}`}>
        {folders.map((folder) => (
          <div key={folder.path} className="my-1">
            <button
              onClick={() => navigateToFolder(folder.path)}
              className={`flex items-center px-2 py-1 text-sm rounded hover:bg-primary/10 w-full text-left ${
                currentFolder === folder.path ? 'bg-primary/20 font-medium' : ''
              }`}
            >
              <FolderInput className="w-4 h-4 mr-2" />
              <span>{folder.name}</span>
            </button>
            
            {folder.children.length > 0 && (
              <div className="pl-4 mt-1">
                {renderFolderTree(folder.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex h-full">
      {/* Sidebar with folders */}
      <div className="w-64 border-r h-full flex flex-col bg-card">
        <div className="p-4 border-b">
          <h3 className="font-medium text-sm">Media Organization</h3>
        </div>
        
        <ScrollArea className="flex-grow">
          <div className="p-4">
            <Accordion type="single" collapsible defaultValue="folders">
              <AccordionItem value="folders">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center">
                    <FolderTree className="w-4 h-4 mr-2" />
                    Folders
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-2">
                    <button
                      onClick={() => navigateToFolder('')}
                      className={`flex items-center px-2 py-1 text-sm rounded hover:bg-primary/10 w-full text-left ${
                        !currentFolder ? 'bg-primary/20 font-medium' : ''
                      }`}
                    >
                      <FolderInput className="w-4 h-4 mr-2" />
                      <span>All Assets</span>
                    </button>
                    
                    {renderFolderTree(folderStructure)}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="areas">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Areas
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 mt-2">
                    <button
                      onClick={() => setQueryParams(prevParams => ({ ...prevParams, area: 'all' }))}
                      className={`flex items-center px-2 py-1 text-sm rounded hover:bg-primary/10 w-full text-left ${
                        queryParams.area === 'all' ? 'bg-primary/20 font-medium' : ''
                      }`}
                    >
                      All Areas
                    </button>
                    
                    {areaOptions.map(area => (
                      <button
                        key={area.value}
                        onClick={() => setQueryParams(prevParams => ({ ...prevParams, area: area.value as any }))}
                        className={`flex items-center px-2 py-1 text-sm rounded hover:bg-primary/10 w-full text-left ${
                          queryParams.area === area.value ? 'bg-primary/20 font-medium' : ''
                        }`}
                      >
                        {area.label}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="tools">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Tools
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    <button
                      onClick={() => setShowUsage(!showUsage)}
                      className={`flex items-center px-2 py-1 text-sm rounded hover:bg-primary/10 w-full text-left ${
                        showUsage ? 'bg-primary/20 font-medium' : ''
                      }`}
                    >
                      <FileSymlink className="w-4 h-4 mr-2" />
                      {showUsage ? 'Hide Usage Info' : 'Show Usage Info'}
                    </button>
                    
                    <button
                      onClick={findDuplicates}
                      disabled={loadingDuplicates}
                      className="flex items-center px-2 py-1 text-sm rounded hover:bg-primary/10 w-full text-left"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {loadingDuplicates ? 'Scanning...' : 'Find Duplicates'}
                    </button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex items-center justify-between">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm">
            <button
              onClick={() => navigateToFolder('')}
              className="hover:underline"
            >
              Root
            </button>
            
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="flex items-center">
                <span className="mx-2 text-gray-500">/</span>
                <button
                  onClick={() => navigateToFolder(crumb.path)}
                  className={`hover:underline ${
                    index === breadcrumbs.length - 1 ? 'font-medium' : ''
                  }`}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>
          
          {/* View options and upload button (your existing code) */}
        </div>
        
        {/* Duplicate warning banner */}
        {showDuplicates && duplicateGroups.length > 0 && (
          <div className="bg-amber-50 border-amber-200 border-y p-3 text-amber-800 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <span className="font-medium">Found {duplicateGroups.length} potential duplicate groups.</span> 
              <span className="ml-2">Review and delete unnecessary duplicates to free up storage space.</span>
            </div>
            <button 
              onClick={() => setShowDuplicates(false)}
              className="ml-auto text-amber-600 hover:text-amber-900"
            >
              Hide
            </button>
          </div>
        )}
        
        {/* Main content area (your existing code for asset grid or list) */}
        
        {/* Duplicate assets modal */}
        {showDuplicates && (
          <Dialog open={showDuplicates} onOpenChange={setShowDuplicates}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Potential Duplicate Assets</DialogTitle>
                <DialogDescription>
                  Review these assets that appear to be duplicates. Keep the one you want to use and delete the others.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="flex-grow">
                <div className="space-y-8 p-4">
                  {duplicateGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-3 flex justify-between items-center">
                        <h3 className="font-medium">Duplicate Group #{groupIndex + 1}</h3>
                        <span className="text-sm text-muted-foreground">
                          {group.publicIds?.length || group.assets?.length} similar items
                        </span>
                      </div>
                      
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(group.assets || group.publicIds.map(id => ({ 
                          publicId: id 
                        }))).map((asset, assetIndex) => (
                          <div key={assetIndex} className="border rounded-md overflow-hidden">
                            <div className="aspect-square relative">
                              <CloudinaryImage
                                publicId={asset.publicId}
                                alt={`Duplicate ${assetIndex + 1}`}
                                options={{ width: 300, height: 300, crop: 'fill' }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="p-2 bg-card">
                              <p className="text-xs truncate">{asset.publicId}</p>
                              {typeof asset !== 'string' && 
                               'created' in asset && 
                               typeof asset.created === 'string' && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(asset.created).toLocaleDateString()}
                                </p>
                              )}
                              
                              <div className="flex mt-2">
                                <button
                                  onClick={() => handleDelete({ publicId: asset.publicId } as CloudinaryAsset)}
                                  className="flex items-center text-xs text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </button>
                                
                                <button
                                  onClick={() => {
                                    // Keep this asset, view it in the main library
                                    setShowDuplicates(false);
                                    setQueryParams({
                                      searchTerm: asset.publicId.split('/').pop() || '',
                                      area: 'all',
                                      resourceType: 'all'
                                    });
                                  }}
                                  className="flex items-center text-xs ml-auto"
                                >
                                  <CheckSquare2 className="w-3 h-3 mr-1" />
                                  Keep
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <DialogFooter>
                <Button onClick={() => setShowDuplicates(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

export default MediaManagement; 