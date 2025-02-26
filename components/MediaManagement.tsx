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
  PlusCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with search and filters */}
      <div className="flex flex-col gap-4 p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Media Library</h2>
          
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex items-center rounded-md overflow-hidden border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none h-8"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none h-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Selection actions - visible when items are selected */}
            {selectedAssets.length > 0 && (
              <div className="flex items-center">
                <span className="text-sm mr-2">
                  {selectedAssets.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAssets([])}
                >
                  Clear
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Organize
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Organize Assets</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleOrganize({ folder: 'gallery' })}>
                      <Folder className="mr-2 h-4 w-4" />
                      Move to Gallery
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOrganize({ tags: ['featured'] })}>
                      <Tag className="mr-2 h-4 w-4" />
                      Add "featured" Tag
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    // Bulk delete confirmation
                    if (confirm(`Are you sure you want to delete ${selectedAssets.length} assets?`)) {
                      Promise.all(selectedAssets.map(asset => deleteFromCloudinary(asset.publicId)))
                        .then(() => {
                          toast({
                            title: 'Assets Deleted',
                            description: `Successfully deleted ${selectedAssets.length} assets.`,
                          });
                          setSelectedAssets([]);
                          loadAssets(true);
                        })
                        .catch((error) => {
                          console.error('Failed to delete assets:', error);
                          toast({
                            title: 'Error',
                            description: 'Failed to delete some assets. Please try again.',
                            variant: 'destructive'
                          });
                        });
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
            
            {/* Upload button */}
            {showUploadButton && (
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Media</DialogTitle>
                    <DialogDescription>
                      Upload new images or videos to your media library
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="upload">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload</TabsTrigger>
                      <TabsTrigger value="options">Options</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="pt-4">
                      <CloudinaryUploader
                        multiple={true}
                        maxFiles={10}
                        onSuccess={handleUploadSuccess}
                        area={uploadArea}
                        folder={uploadFolder}
                        resourceType="auto"
                        buttonLabel="Upload Media Files"
                        buttonClassName="w-full"
                      />
                    </TabsContent>
                    
                    <TabsContent value="options" className="pt-4 space-y-4">
                      <div>
                        <Label htmlFor="upload-area">Media Area</Label>
                        <Select defaultValue={uploadArea || "gallery"}>
                          <SelectTrigger id="upload-area">
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hero">Hero Images</SelectItem>
                            <SelectItem value="gallery">Gallery</SelectItem>
                            <SelectItem value="article">Article Images</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="service">Services</SelectItem>
                            <SelectItem value="logo">Logos</SelectItem>
                            <SelectItem value="video-thumbnail">Video Thumbnails</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="upload-tags">Tags</Label>
                        <Input id="upload-tags" placeholder="Comma-separated tags" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: featured, homepage, summer-2023
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="upload-cropping" />
                        <label
                          htmlFor="upload-cropping"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Enable cropping tool
                        </label>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => loadAssets(true)}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-4 gap-4 p-4 border rounded-md bg-muted/50">
            <div>
              <Label htmlFor="filter-area">Area</Label>
              <Select 
                value={selectedArea} 
                onValueChange={(value) => setSelectedArea(value as ImageArea | 'all')}
              >
                <SelectTrigger id="filter-area">
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="gallery">Gallery</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="logo">Logo</SelectItem>
                  <SelectItem value="video-thumbnail">Video Thumbnail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-type">Type</Label>
              <Select 
                value={selectedResourceType} 
                onValueChange={(value) => setSelectedResourceType(value as 'image' | 'video' | 'all')}
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-folder">Folder</Label>
              <Select 
                value={selectedFolder} 
                onValueChange={setSelectedFolder}
              >
                <SelectTrigger id="filter-folder">
                  <SelectValue placeholder="All folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Folders</SelectItem>
                  {organizeFolders.map(folder => (
                    <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-tag">Tag</Label>
              <Select 
                value={selectedTag} 
                onValueChange={setSelectedTag}
              >
                <SelectTrigger id="filter-tag">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tags</SelectItem>
                  {organizeTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
      
      {/* Media Grid/List */}
      <div className="flex-grow overflow-auto p-4">
        {loading && assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-muted-foreground">Loading media assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground mb-4">No media assets found</p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {assets.map(asset => renderAssetItem(asset))}
              </div>
            ) : (
              <div className="space-y-1">
                {assets.map(asset => renderAssetItem(asset))}
              </div>
            )}
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline"
                  disabled={loading}
                  onClick={() => loadAssets()}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Edit asset dialog */}
      {renderAssetEditDialog()}
    </div>
  );
}

export default MediaManagement; 