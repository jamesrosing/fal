"use client";

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderIcon, ImageIcon, VideoIcon, FileIcon, UploadCloudIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Type for Cloudinary upload widget success result
type CloudinaryResult = {
  event: string;
  info: {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    width?: number;
    height?: number;
    bytes: number;
    created_at: string;
    tags?: string[];
    folder?: string;
  };
};

export function MediaUploadWidget() {
  const [uploadedAssets, setUploadedAssets] = useState<CloudinaryResult['info'][]>([]);

  const handleUploadSuccess = (result: CloudinaryResult) => {
    console.log("Upload success:", result);
    setUploadedAssets(prev => [...prev, result.info]);
    
    // Register the asset in the database
    registerAssetInDatabase(result.info);
    
    toast({
      title: "Upload successful",
      description: `${result.info.public_id} uploaded successfully.`,
    });
  };
  
  const registerAssetInDatabase = async (assetInfo: CloudinaryResult['info']) => {
    try {
      const response = await fetch('/api/cloudinary/assets/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cloudinary_id: assetInfo.public_id,
          type: assetInfo.resource_type,
          format: assetInfo.format,
          width: assetInfo.width,
          height: assetInfo.height,
          url: assetInfo.secure_url,
          size: assetInfo.bytes,
          title: assetInfo.public_id.split('/').pop() || assetInfo.public_id,
          alt_text: assetInfo.public_id.split('/').pop() || assetInfo.public_id,
          tags: assetInfo.tags,
          folder: assetInfo.folder
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to register asset in database');
      }
      
      console.log('Asset registered in database');
    } catch (error) {
      console.error('Error registering asset in database:', error);
      toast({
        title: "Registration error",
        description: "Asset uploaded to Cloudinary but failed to register in database.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="recent">Recently Uploaded</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Media</CardTitle>
              <CardDescription>
                Upload images and videos to use throughout the site. Supported formats: JPG, PNG, GIF, WEBP, MP4, WEBM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800">
                  <h3 className="text-lg font-medium mb-2">Upload Details</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4" />
                      <span>Assets will be stored in the <strong>site-media</strong> folder</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>Images: JPG, PNG, WEBP, GIF (up to 20MB)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <VideoIcon className="h-4 w-4" />
                      <span>Videos: MP4, WEBM, MOV (up to 20MB)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FileIcon className="h-4 w-4" />
                      <span>Documents: PDF (up to 20MB)</span>
                    </li>
                  </ul>
                </div>
                
                <CldUploadWidget
                  uploadPreset="fal_media"
                  onSuccess={(result) => {
                    // Type checking and handling
                    if (
                      result.event === 'success' && 
                      result.info && 
                      typeof result.info !== 'string' && 
                      'public_id' in result.info &&
                      'secure_url' in result.info
                    ) {
                      handleUploadSuccess(result as CloudinaryResult);
                    }
                  }}
                  options={{
                    sources: ['local', 'url', 'camera', 'google_drive', 'dropbox', 'unsplash'],
                    multiple: false,
                    resourceType: 'auto',
                    clientAllowedFormats: ['image', 'video', 'pdf'],
                    maxFiles: 10,
                    maxFileSize: 20000000, // 20MB
                    folder: 'site-media',
                    tags: ['site-asset'],
                    styles: {
                      palette: {
                        window: "#000000",
                        windowBorder: "#555555",
                        tabIcon: "#FFFFFF",
                        menuIcons: "#CCCCCC",
                        textDark: "#000000",
                        textLight: "#FFFFFF",
                        link: "#0078FF",
                        action: "#FF620C",
                        inactiveTabIcon: "#999999",
                        error: "#FF0000",
                        inProgress: "#0078FF",
                        complete: "#20B832",
                        sourceBg: "#222222"
                      },
                      fonts: {
                        default: null,
                        "'Poppins', sans-serif": {
                          url: "https://fonts.googleapis.com/css?family=Poppins",
                          active: true
                        }
                      }
                    }
                  }}
                >
                  {({ open }) => (
                    <div 
                      className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-zinc-700 rounded-lg bg-zinc-950 cursor-pointer hover:bg-zinc-900 transition-colors"
                      onClick={() => open()}
                    >
                      <UploadCloudIcon className="h-12 w-12 text-zinc-500 mb-4" />
                      <p className="text-lg font-medium">Click to upload</p>
                      <p className="text-sm text-muted-foreground">
                        Or drag and drop files
                      </p>
                    </div>
                  )}
                </CldUploadWidget>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset</Button>
              <Button variant="default">View Media Library</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recently Uploaded Media</CardTitle>
              <CardDescription>
                Your most recently uploaded assets will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedAssets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedAssets.map((asset, index) => (
                    <div key={index} className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
                      {asset.resource_type === 'image' ? (
                        <img 
                          src={asset.secure_url} 
                          alt={asset.public_id}
                          className="w-full h-40 object-cover"
                        />
                      ) : asset.resource_type === 'video' ? (
                        <video 
                          src={asset.secure_url}
                          className="w-full h-40 object-cover"
                          controls
                        />
                      ) : (
                        <div className="w-full h-40 flex items-center justify-center bg-zinc-900">
                          <FileIcon className="h-16 w-16 text-zinc-500" />
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-medium truncate">{asset.public_id.split('/').pop()}</h4>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge variant="outline">{asset.resource_type}</Badge>
                          {asset.width && asset.height && (
                            <Badge variant="outline">{asset.width}×{asset.height}</Badge>
                          )}
                          <Badge variant="outline">{(asset.bytes / 1024).toFixed(1)} KB</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recently uploaded assets</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 