"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderPlusIcon, FolderIcon, TagIcon, ArrowRightIcon, Trash2Icon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function MediaOrganizationTools() {
  // State for folder creation
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParent, setNewFolderParent] = useState('');
  const [folderLoading, setFolderLoading] = useState(false);
  
  // State for folder selection
  const [selectedFolder, setSelectedFolder] = useState<string[]>([]);
  const [availableFolders, setAvailableFolders] = useState<{name: string, path: string}[]>([
    { name: 'site-media', path: 'site-media' },
    { name: 'hero-images', path: 'site-media/hero-images' },
    { name: 'team', path: 'site-media/team' },
    { name: 'gallery', path: 'site-media/gallery' },
    { name: 'services', path: 'site-media/services' }
  ]);
  
  // State for tag management
  const [newTag, setNewTag] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  
  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName) {
      toast({
        title: "Validation Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }
    
    setFolderLoading(true);
    
    try {
      // Construct full path
      const folderPath = newFolderParent 
        ? `${newFolderParent}/${newFolderName}`
        : newFolderName;
      
      const response = await fetch('/api/cloudinary/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: folderPath }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create folder');
      }
      
      // Add to available folders
      setAvailableFolders(prev => [
        ...prev,
        { name: newFolderName, path: folderPath }
      ]);
      
      // Reset form
      setNewFolderName('');
      
      toast({
        title: "Folder Created",
        description: `Successfully created folder: ${folderPath}`,
      });
      
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFolderLoading(false);
    }
  };
  
  // Handle moving assets to folder
  const handleMoveToFolder = async () => {
    if (selectedAssets.length === 0 || !selectedFolder) {
      toast({
        title: "Selection Required",
        description: "Please select both assets and a destination folder",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch('/api/cloudinary/organize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assets: selectedAssets,
          folder: selectedFolder[0],
          action: 'move'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to move assets');
      }
      
      toast({
        title: "Assets Moved",
        description: `Successfully moved ${selectedAssets.length} assets to ${selectedFolder[0]}`,
      });
      
      // Reset selections
      setSelectedAssets([]);
      
    } catch (error) {
      console.error('Error moving assets:', error);
      toast({
        title: "Error",
        description: "Failed to move assets. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle adding tags
  const handleAddTag = async () => {
    if (selectedAssets.length === 0 || !newTag) {
      toast({
        title: "Input Required",
        description: "Please select assets and enter a tag",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch('/api/cloudinary/organize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assets: selectedAssets,
          tag: newTag,
          action: 'tag'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add tag');
      }
      
      toast({
        title: "Tag Added",
        description: `Successfully added tag "${newTag}" to ${selectedAssets.length} assets`,
      });
      
      // Reset tag input
      setNewTag('');
      
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select assets to delete",
        variant: "destructive",
      });
      return;
    }
    
    // Confirmation
    if (!confirm(`Are you sure you want to delete ${selectedAssets.length} assets? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/cloudinary/organize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assets: selectedAssets,
          action: 'delete'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete assets');
      }
      
      toast({
        title: "Assets Deleted",
        description: `Successfully deleted ${selectedAssets.length} assets`,
      });
      
      // Reset selections
      setSelectedAssets([]);
      
    } catch (error) {
      console.error('Error deleting assets:', error);
      toast({
        title: "Error",
        description: "Failed to delete assets. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Mock selected asset list (in real app, this would come from a selection mechanism in the MediaBrowser)
  const mockSelectedAssets = [
    { id: 'asset1', name: 'hero-image-1.jpg', type: 'image' },
    { id: 'asset2', name: 'team-photo-2.jpg', type: 'image' },
    { id: 'asset3', name: 'treatment-video.mp4', type: 'video' }
  ];
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="folders">
        <TabsList>
          <TabsTrigger value="folders">Folder Management</TabsTrigger>
          <TabsTrigger value="tags">Tag Management</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>
        
        {/* Folder Management */}
        <TabsContent value="folders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Folder</CardTitle>
              <CardDescription>
                Create a new folder to organize your media assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    placeholder="e.g., services-dermatology"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parentFolder">Parent Folder (Optional)</Label>
                  <select
                    id="parentFolder"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newFolderParent}
                    onChange={(e) => setNewFolderParent(e.target.value)}
                  >
                    <option value="">-- Root Level --</option>
                    {availableFolders.map((folder) => (
                      <option key={folder.path} value={folder.path}>
                        {folder.path}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCreateFolder} 
                disabled={folderLoading || !newFolderName}
              >
                {folderLoading ? 'Creating...' : 'Create Folder'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Move Assets to Folder</CardTitle>
              <CardDescription>
                Move selected assets to a different folder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Selected Assets ({mockSelectedAssets.length})</Label>
                  {mockSelectedAssets.length > 0 ? (
                    <ul className="mt-2 border rounded-md divide-y">
                      {mockSelectedAssets.map((asset) => (
                        <li key={asset.id} className="px-3 py-2 flex items-center justify-between">
                          <span>{asset.name}</span>
                          <span className="text-xs text-muted-foreground">{asset.type}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      No assets selected. Select assets from the Media Browser.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="destinationFolder">Destination Folder</Label>
                  <select
                    id="destinationFolder"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder([e.target.value])}
                  >
                    <option value="">-- Select Destination --</option>
                    {availableFolders.map((folder) => (
                      <option key={folder.path} value={folder.path}>
                        {folder.path}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleMoveToFolder}
                disabled={mockSelectedAssets.length === 0 || !selectedFolder.length}
              >
                <ArrowRightIcon className="h-4 w-4 mr-2" />
                Move to Folder
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tag Management */}
        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Tags to Media</CardTitle>
              <CardDescription>
                Add searchable tags to your selected media assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Selected Assets ({mockSelectedAssets.length})</Label>
                  {mockSelectedAssets.length > 0 ? (
                    <ul className="mt-2 border rounded-md divide-y">
                      {mockSelectedAssets.map((asset) => (
                        <li key={asset.id} className="px-3 py-2 flex items-center justify-between">
                          <span>{asset.name}</span>
                          <span className="text-xs text-muted-foreground">{asset.type}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      No assets selected. Select assets from the Media Browser.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tagName">Tag</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="tagName"
                      placeholder="e.g., hero, team, services"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                    />
                    <Button 
                      onClick={handleAddTag}
                      disabled={!newTag || mockSelectedAssets.length === 0}
                    >
                      <TagIcon className="h-4 w-4 mr-2" />
                      Add Tag
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use comma-separated values to add multiple tags at once
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Common Tags</CardTitle>
              <CardDescription>
                Quickly add common tags to your selected assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['hero', 'team', 'services', 'gallery', 'testimonial', 'background', 'icon', 'logo', 'mobile', 'desktop'].map((tag) => (
                  <Button 
                    key={tag} 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNewTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bulk Operations */}
        <TabsContent value="bulk" className="space-y-4">
          <Card className="border-red-800">
            <CardHeader>
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
              <CardDescription>
                These operations affect multiple assets at once and cannot be easily undone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selected Assets ({mockSelectedAssets.length})</Label>
                {mockSelectedAssets.length > 0 ? (
                  <ul className="mt-2 border rounded-md divide-y">
                    {mockSelectedAssets.map((asset) => (
                      <li key={asset.id} className="px-3 py-2 flex items-center justify-between">
                        <span>{asset.name}</span>
                        <span className="text-xs text-muted-foreground">{asset.type}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    No assets selected. Select assets from the Media Browser.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setSelectedAssets([])}
                disabled={mockSelectedAssets.length === 0}
              >
                Clear Selection
              </Button>
              <Button 
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={mockSelectedAssets.length === 0}
              >
                <Trash2Icon className="h-4 w-4 mr-2" />
                Delete Assets
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Asset Statistics</CardTitle>
              <CardDescription>
                Overview of your media assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-900 p-4 rounded-md">
                  <h3 className="text-lg font-medium">Total Assets</h3>
                  <p className="text-3xl font-bold mt-2">248</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-md">
                  <h3 className="text-lg font-medium">Images</h3>
                  <p className="text-3xl font-bold mt-2">186</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-md">
                  <h3 className="text-lg font-medium">Videos</h3>
                  <p className="text-3xl font-bold mt-2">42</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-md">
                  <h3 className="text-lg font-medium">Storage Used</h3>
                  <p className="text-3xl font-bold mt-2">2.4 GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 