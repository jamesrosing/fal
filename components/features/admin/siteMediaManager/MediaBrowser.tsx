"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/shared/ui/select';
import { 
  Grid2X2Icon, 
  ListIcon, 
  FolderIcon, 
  ImageIcon, 
  VideoIcon, 
  FileIcon, 
  FilterIcon, 
  ChevronRightIcon,
  SlidersHorizontal
} from 'lucide-react';

type MediaAsset = {
  id: string;
  cloudinary_id: string;
  type: string;
  title: string;
  alt_text: string;
  width?: number;
  height?: number;
  format?: string;
  url: string;
  created_at: string;
  updated_at: string;
};

type CloudinaryFolder = {
  name: string;
  path: string;
  subfolders?: CloudinaryFolder[];
};

export function MediaBrowser() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<CloudinaryFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Fetch assets and folders when component mounts
  useEffect(() => {
    Promise.all([
      fetchAssets(),
      fetchFolders()
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);
  
  // Refetch assets when folder, filter, or sort changes
  useEffect(() => {
    fetchAssets();
  }, [currentFolder, filterType, sortBy, searchQuery]);
  
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      if (currentFolder) params.append('folder', currentFolder);
      if (filterType !== 'all') params.append('type', filterType);
      if (sortBy) params.append('sort', sortBy);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/cloudinary/assets/list?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch assets');
      
      const data = await response.json();
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/cloudinary/folders');
      if (!response.ok) throw new Error('Failed to fetch folders');
      
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };
  
  // Navigate to a specific folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentFolder(folderPath);
  };
  
  // Go up one level in folder hierarchy
  const goUpFolder = () => {
    if (!currentFolder) return;
    
    // Remove the last segment of the path
    const segments = currentFolder.split('/');
    segments.pop();
    const parentFolder = segments.join('/');
    
    setCurrentFolder(parentFolder);
  };
  
  // Get breadcrumb segments for navigation
  const getBreadcrumbs = () => {
    if (!currentFolder) return [{ name: 'All Media', path: '' }];
    
    const segments = currentFolder.split('/');
    let path = '';
    
    return [
      { name: 'All Media', path: '' },
      ...segments.map(segment => {
        path = path ? `${path}/${segment}` : segment;
        return { name: segment, path };
      })
    ];
  };
  
  // Filter and sort assets
  const getFilteredAssets = () => {
    let filtered = [...assets];
    
    // Apply search filter if needed
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.title.toLowerCase().includes(query) || 
        asset.cloudinary_id.toLowerCase().includes(query) ||
        asset.alt_text.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(asset => asset.type === filterType);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    
    return filtered;
  };
  
  const renderMediaThumbnail = (asset: MediaAsset) => {
    if (asset.type === 'image') {
      return (
        <img 
          src={asset.url}
          alt={asset.alt_text || asset.title}
          className="h-full w-full object-cover"
        />
      );
    } else if (asset.type === 'video') {
      return (
        <div className="relative h-full w-full flex items-center justify-center bg-zinc-900">
          <VideoIcon className="h-10 w-10 text-zinc-500" />
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary">Video</Badge>
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-full w-full flex items-center justify-center bg-zinc-900">
          <FileIcon className="h-10 w-10 text-zinc-500" />
        </div>
      );
    }
  };
  
  // Render grid view
  const renderGridView = () => {
    const filteredAssets = getFilteredAssets();
    
    if (filteredAssets.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No media found</p>
          <p className="text-sm">Try changing your search or filters</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredAssets.map(asset => (
          <Card key={asset.id} className="overflow-hidden border-zinc-800 bg-zinc-950">
            <div className="aspect-square relative overflow-hidden">
              {renderMediaThumbnail(asset)}
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium text-sm truncate" title={asset.title}>
                {asset.title || asset.cloudinary_id.split('/').pop()}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline">
                  {asset.type}
                </Badge>
                {asset.width && asset.height && (
                  <span className="text-xs text-muted-foreground">
                    {asset.width} × {asset.height}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render list view
  const renderListView = () => {
    const filteredAssets = getFilteredAssets();
    
    if (filteredAssets.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No media found</p>
          <p className="text-sm">Try changing your search or filters</p>
        </div>
      );
    }
    
    return (
      <div className="border border-zinc-800 rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-900">
            <tr>
              <th className="text-left p-3 font-medium">Media</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Dimensions</th>
              <th className="text-left p-3 font-medium">Created</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredAssets.map(asset => (
              <tr key={asset.id} className="bg-zinc-950 hover:bg-zinc-900">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                      {renderMediaThumbnail(asset)}
                    </div>
                    <span className="truncate max-w-xs" title={asset.title}>
                      {asset.title || asset.cloudinary_id.split('/').pop()}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="outline">
                    {asset.type}
                  </Badge>
                </td>
                <td className="p-3 text-sm">
                  {asset.width && asset.height ? `${asset.width} × ${asset.height}` : '-'}
                </td>
                <td className="p-3 text-sm">
                  {new Date(asset.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Select</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {getBreadcrumbs().map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <ChevronRightIcon className="h-4 w-4 mx-1" />}
              <button
                onClick={() => navigateToFolder(crumb.path)}
                className={`hover:text-foreground ${
                  index === getBreadcrumbs().length - 1 ? 'text-foreground font-medium' : ''
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
        
        {/* Actions and view controls */}
        <div className="flex flex-wrap gap-3 items-center justify-end w-full md:w-auto">
          <div className="flex items-center">
            <Button
              variant="outline" 
              size="icon"
              className={viewMode === 'grid' ? 'bg-zinc-800' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Grid2X2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline" 
              size="icon"
              className={viewMode === 'list' ? 'bg-zinc-800' : ''}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="raw">Files</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Folder sidebar */}
        <Card className="md:col-span-1 border-zinc-800 bg-zinc-950">
          <div className="p-3 border-b border-zinc-800 flex items-center">
            <FolderIcon className="h-4 w-4 mr-2" />
            <h3 className="font-medium">Folders</h3>
          </div>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <ul className="divide-y divide-zinc-800">
                <li>
                  <button
                    className={`w-full px-3 py-2 text-left hover:bg-zinc-900 flex items-center ${
                      currentFolder === '' ? 'bg-zinc-800' : ''
                    }`}
                    onClick={() => navigateToFolder('')}
                  >
                    All Media
                  </button>
                </li>
                {folders.map(folder => (
                  <li key={folder.path}>
                    <button
                      className={`w-full px-3 py-2 text-left hover:bg-zinc-900 flex items-center ${
                        currentFolder === folder.path ? 'bg-zinc-800' : ''
                      }`}
                      onClick={() => navigateToFolder(folder.path)}
                    >
                      <FolderIcon className="h-4 w-4 mr-2" />
                      {folder.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        
        {/* Media display area */}
        <div className="md:col-span-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p>Loading media assets...</p>
            </div>
          ) : viewMode === 'grid' ? (
            renderGridView()
          ) : (
            renderListView()
          )}
        </div>
      </div>
    </div>
  );
} 