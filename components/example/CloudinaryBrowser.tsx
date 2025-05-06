'use client';

import { useState, useEffect } from 'react';
import { CldImageWrapper } from '@/components/media/CldImageWrapper';
import { CldVideoWrapper } from '@/components/media/CldVideoWrapper';
import { Button } from '@/components/ui/button';
import { Folder, Image, Video, RefreshCw } from 'lucide-react';

type MediaAsset = {
  public_id: string;
  resource_type: 'image' | 'video' | 'raw';
  format: string;
  version: number;
  url: string;
  secure_url: string;
  width?: number;
  height?: number;
};

type MediaFolder = {
  name: string;
  path: string;
};

export default function CloudinaryBrowser() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  const fetchResources = async (folder = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/cloudinary/assets?folder=${folder}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch resources');
      }
      
      setAssets(data.resources || []);
      setFolders(data.folders || []);
      setCurrentFolder(folder);
    } catch (err: any) {
      console.error('Error fetching Cloudinary resources:', err);
      setError(err.message || 'Failed to load resources from Cloudinary. Check your environment variables.');
      setAssets([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleFolderClick = (path: string) => {
    fetchResources(path);
  };

  const handleBackClick = () => {
    const parentFolder = currentFolder.split('/').slice(0, -1).join('/');
    fetchResources(parentFolder);
  };

  const handleAssetClick = (asset: MediaAsset) => {
    setSelectedAsset(asset);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Cloudinary Browser</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchResources(currentFolder)}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Path navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => fetchResources('')}
          className="hover:text-blue-600"
        >
          Root
        </Button>
        
        {currentFolder && (
          <>
            <span>/</span>
            {currentFolder.split('/').map((segment, index, array) => (
              <div key={index} className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => 
                    handleFolderClick(array.slice(0, index + 1).join('/'))
                  }
                  className="hover:text-blue-600"
                >
                  {segment}
                </Button>
                {index < array.length - 1 && <span>/</span>}
              </div>
            ))}
          </>
        )}
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md space-y-3">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <div>
            <p className="font-medium text-sm">Troubleshooting:</p>
            <ul className="list-disc list-inside ml-2 mt-1 text-sm">
              <li>Check that your environment variables are set in <code>.env</code> file</li>
              <li>Make sure there are no typos or extra spaces in your values</li>
              <li>Verify that your Cloudinary credentials are correct</li>
              <li>You may need to restart the server after changing environment variables</li>
            </ul>
          </div>
          <div className="flex justify-between items-center border-t border-red-200 pt-3">
            <a 
              href="/api/cloudinary/diagnostic" 
              target="_blank" 
              className="text-sm bg-white hover:bg-red-50 text-red-700 py-1 px-3 rounded border border-red-300"
            >
              Run Cloudinary Diagnostic
            </a>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchResources(currentFolder)}
              className="text-sm"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Folders</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.path}
                    onClick={() => handleFolderClick(folder.path)}
                    className="p-3 border rounded-md flex items-center cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <Folder className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assets */}
          {assets.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-2">Assets</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.public_id}
                    onClick={() => handleAssetClick(asset)}
                    className={`border rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                      selectedAsset?.public_id === asset.public_id
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                  >
                    {asset.resource_type === 'image' ? (
                      <>
                        <div className="h-32 bg-gray-100 relative">
                          <CldImageWrapper
                            publicId={asset.public_id}
                            alt={asset.public_id.split('/').pop() || ''}
                            width={150}
                            height={100}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-2 truncate text-sm">
                          <Image className="w-4 h-4 inline mr-1" />
                          {asset.public_id.split('/').pop()}
                        </div>
                      </>
                    ) : asset.resource_type === 'video' ? (
                      <>
                        <div className="h-32 bg-gray-100 relative flex items-center justify-center">
                          <Video className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="p-2 truncate text-sm">
                          <Video className="w-4 h-4 inline mr-1" />
                          {asset.public_id.split('/').pop()}
                        </div>
                      </>
                    ) : (
                      <div className="h-full p-4 flex flex-col items-center justify-center">
                        <div className="text-gray-400 mb-2">
                          {asset.format.toUpperCase()}
                        </div>
                        <div className="truncate text-sm">
                          {asset.public_id.split('/').pop()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              {currentFolder
                ? `No assets found in ${currentFolder}`
                : 'No assets found in the root folder'}
            </div>
          )}
        </>
      )}

      {/* Selected Asset Preview */}
      {selectedAsset && (
        <div className="mt-8 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Selected Asset</h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              {selectedAsset.resource_type === 'image' ? (
                <CldImageWrapper
                  publicId={selectedAsset.public_id}
                  alt={selectedAsset.public_id.split('/').pop() || ''}
                  width={400}
                  height={300}
                  className="rounded-md max-w-full object-contain"
                />
              ) : selectedAsset.resource_type === 'video' ? (
                <CldVideoWrapper
                  publicId={selectedAsset.public_id}
                  width="100%"
                  height="auto"
                  controls
                  className="rounded-md"
                />
              ) : (
                <div className="h-40 flex items-center justify-center bg-gray-100 rounded-md">
                  <p>Preview not available</p>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-2">Asset Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Public ID:</span>{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded">
                    {selectedAsset.public_id}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Type:</span>{' '}
                  {selectedAsset.resource_type}
                </div>
                <div>
                  <span className="font-medium">Format:</span>{' '}
                  {selectedAsset.format}
                </div>
                {selectedAsset.width && selectedAsset.height && (
                  <div>
                    <span className="font-medium">Dimensions:</span>{' '}
                    {selectedAsset.width} × {selectedAsset.height}
                  </div>
                )}
                <div className="pt-4">
                  <h5 className="font-medium mb-2">Component Usage Example:</h5>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {selectedAsset.resource_type === 'image'
                      ? `<CldImageWrapper\n  publicId="${selectedAsset.public_id}"\n  alt="Description"\n  width={400}\n  height={300}\n/>`
                      : selectedAsset.resource_type === 'video'
                      ? `<CldVideoWrapper\n  publicId="${selectedAsset.public_id}"\n  width="100%"\n  height="auto"\n  controls\n/>`
                      : '// Cannot generate component example for this resource type'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 