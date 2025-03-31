'use client';

import { useState, useEffect, useCallback } from 'react';
import { CloudinaryImage } from '@/components/CloudinaryImage';
import { CloudinaryUploader } from '@/components/CloudinaryUploader';
import { CloudinaryAsset, ImageArea } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';

  ChevronRight,
  FileImage,
  Folder,
  Home,
  Info,
  LayoutGrid,
  List,
  Loader2,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react';

// Types for site structure
export interface MediaPlaceholder {
  id: string;
  name: string;
  description: string;
  area: ImageArea;
  publicId?: string;
  path: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

export interface PageSection {
  id: string;
  name: string;
  description?: string;
  mediaPlaceholders: MediaPlaceholder[];
}

export interface SitePage {
  id: string;
  name: string;
  path: string;
  sections: PageSection[];
}

// Main component props
interface SiteMediaManagerProps {
  initialActivePageId?: string;
}

export function SiteMediaManager({ initialActivePageId }: SiteMediaManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sitePages, setSitePages] = useState<SitePage[]>([]);
  const [activePageId, setActivePageId] = useState<string>(initialActivePageId || '');
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingPlaceholderId, setUploadingPlaceholderId] = useState<string | null>(null);

  // Fetch site structure with media placeholders
  useEffect(() => {
    const fetchSiteStructure = async () => {
      try {
        setLoading(true);
        console.log('Fetching site media structure from API...');
        // Fetch actual site structure from API
        const response = await fetch('/api/site/media-map');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}):`, errorText);
          throw new Error(`Failed to fetch site media structure: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Site structure data received:', data);
        setSitePages(data);
        
        if (!activePageId && data.length > 0) {
          setActivePageId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching site structure:', error);
        // Fallback to mock data if API fails
        console.log('Falling back to mock data');
        const mockSiteStructure = getMockSiteStructure();
        setSitePages(mockSiteStructure);
        
        if (!activePageId && mockSiteStructure.length > 0) {
          setActivePageId(mockSiteStructure[0].id);
        }
        
        toast({
          title: 'Error',
          description: 'Failed to load dynamic site media structure. Using fallback data.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSiteStructure();
  }, [activePageId, toast]);

  // Handle upload success
  const handleUploadSuccess = (placeholderId: string) => (result: CloudinaryAsset | CloudinaryAsset[]) => {
    const asset = Array.isArray(result) ? result[0] : result;
    
    // Update the placeholder with the new public ID
    setSitePages(prevPages => 
      prevPages.map(page => ({
        ...page,
        sections: page.sections.map(section => ({
          ...section,
          mediaPlaceholders: section.mediaPlaceholders.map(placeholder => 
            placeholder.id === placeholderId
              ? { ...placeholder, publicId: asset.publicId }
              : placeholder
          )
        }))
      }))
    );

    setUploadingPlaceholderId(null);
    
    toast({
      title: 'Media uploaded',
      description: 'The media has been successfully uploaded',
    });
  };

  // Filter pages and sections based on search
  const filteredPages = searchQuery 
    ? sitePages.map(page => ({
        ...page,
        sections: page.sections.filter(section => 
          section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.mediaPlaceholders.some(placeholder => 
            placeholder.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
      })).filter(page => 
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        page.sections.length > 0
      )
    : sitePages;

  // Get the active page
  const activePage = sitePages.find(page => page.id === activePageId);

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/40 h-full flex flex-col">
        <div className="p-4 border-b">
          <Input
            placeholder="Search pages or media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="mb-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              ))
            ) : (
              <Accordion type="multiple" defaultValue={['pages']}>
                <AccordionItem value="pages">
                  <AccordionTrigger className="py-2">
                    <span className="flex items-center">
                      <Home className="w-4 h-4 mr-2" />
                      <span>Pages</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    {filteredPages.map(page => (
                      <div key={page.id} className="pl-2">
                        <Button
                          variant={activePageId === page.id ? "secondary" : "ghost"}
                          className="w-full justify-start text-sm py-1 h-auto mb-1"
                          onClick={() => {
                            setActivePageId(page.id);
                            setActiveSectionId('');
                          }}
                        >
                          <Folder className="w-4 h-4 mr-2" />
                          <span className="truncate">{page.name}</span>
                        </Button>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Page header */}
        {activePage && (
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-1">{activePage.name}</h2>
            <p className="text-sm text-muted-foreground">
              {activePage.path}
            </p>
          </div>
        )}

        {/* Page content */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading media placeholders...</p>
            </div>
          ) : activePage ? (
            <div className="p-4">
              {activePage.sections.map(section => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                    {section.name}
                  </h3>
                  {section.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {section.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.mediaPlaceholders.map(placeholder => (
                      <div key={placeholder.id} className="border rounded-lg overflow-hidden">
                        <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{placeholder.name}</h4>
                            <p className="text-xs text-muted-foreground">{placeholder.area}</p>
                          </div>
                          <Badge variant="outline">
                            {placeholder.dimensions.width} × {placeholder.dimensions.height}
                          </Badge>
                        </div>
                        
                        <div className="p-4">
                          {placeholder.publicId ? (
                            <div className="relative">
                              <CloudinaryImage
                                publicId={placeholder.publicId}
                                alt={placeholder.name}
                                options={{
                                  width: placeholder.dimensions.width,
                                  height: placeholder.dimensions.height,
                                  crop: 'fill'
                                }}
                                className="w-full rounded-md"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/60 rounded-md">
                                <CloudinaryUploader
                                  area={placeholder.area}
                                  folder={`${placeholder.path}`}
                                  onSuccess={handleUploadSuccess(placeholder.id)}
                                  buttonLabel="Replace"
                                  buttonClassName="bg-white text-black hover:bg-white/90"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-[4/3] bg-muted flex flex-col items-center justify-center rounded-md">
                              <FileImage className="w-12 h-12 text-muted-foreground mb-2" />
                              {uploadingPlaceholderId === placeholder.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <CloudinaryUploader
                                  area={placeholder.area}
                                  folder={`${placeholder.path}`}
                                  onSuccess={handleUploadSuccess(placeholder.id)}
                                  buttonLabel="Upload Media"
                                  buttonClassName="mt-2"
                                  tags={[placeholder.area, placeholder.name.toLowerCase().replace(/\s+/g, '-')]}
                                />
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="px-4 pb-4">
                          <p className="text-xs text-muted-foreground">
                            {placeholder.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center">
              <AlertTriangle className="w-8 h-8 mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No page selected. Please select a page from the sidebar.</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

// Mock data function - in a real app, this would come from an API
function getMockSiteStructure(): SitePage[] {
  return [
    {
      id: 'home',
      name: 'Homepage',
      path: '/',
      sections: [
        {
          id: 'hero',
          name: 'Hero Section',
          description: 'The main hero banner at the top of the homepage',
          mediaPlaceholders: [
            {
              id: 'home-hero-background',
              name: 'Hero Background',
              description: 'Large background image for the homepage hero section',
              area: 'hero',
              path: 'home/hero',
              dimensions: {
                width: 1920,
                height: 1080,
                aspectRatio: 16/9
              }
            },
            {
              id: 'home-hero-mobile',
              name: 'Hero Mobile Background',
              description: 'Mobile version of the hero background (portrait orientation)',
              area: 'hero',
              path: 'home/hero',
              dimensions: {
                width: 828,
                height: 1792,
                aspectRatio: 828/1792
              }
            }
          ]
        },
        {
          id: 'services',
          name: 'Services Showcase',
          description: 'The services highlight section on the homepage',
          mediaPlaceholders: [
            {
              id: 'service-plastic-surgery',
              name: 'Plastic Surgery Thumbnail',
              description: 'Image representing the plastic surgery service',
              area: 'service',
              path: 'home/services',
              dimensions: {
                width: 600,
                height: 400,
                aspectRatio: 3/2
              }
            },
            {
              id: 'service-dermatology',
              name: 'Dermatology Thumbnail',
              description: 'Image representing the dermatology service',
              area: 'service',
              path: 'home/services',
              dimensions: {
                width: 600,
                height: 400,
                aspectRatio: 3/2
              }
            },
            {
              id: 'service-medical-spa',
              name: 'Medical Spa Thumbnail',
              description: 'Image representing the medical spa services',
              area: 'service',
              path: 'home/services',
              dimensions: {
                width: 600,
                height: 400,
                aspectRatio: 3/2
              }
            }
          ]
        }
      ]
    },
    {
      id: 'about',
      name: 'About Us',
      path: '/about',
      sections: [
        {
          id: 'hero',
          name: 'Hero Section',
          mediaPlaceholders: [
            {
              id: 'about-hero-background',
              name: 'About Hero Background',
              description: 'Background image for the about page hero section',
              area: 'hero',
              path: 'about/hero',
              dimensions: {
                width: 1920,
                height: 1080,
                aspectRatio: 16/9
              }
            }
          ]
        },
        {
          id: 'team',
          name: 'Team Section',
          description: 'Team member showcase',
          mediaPlaceholders: [
            {
              id: 'team-group',
              name: 'Team Group Photo',
              description: 'Group photo of the entire team',
              area: 'team',
              path: 'about/team',
              dimensions: {
                width: 1200,
                height: 800,
                aspectRatio: 3/2
              }
            }
          ]
        }
      ]
    },
    {
      id: 'services',
      name: 'Services',
      path: '/services',
      sections: [
        {
          id: 'hero',
          name: 'Hero Section',
          mediaPlaceholders: [
            {
              id: 'services-hero-background',
              name: 'Services Hero Background',
              description: 'Background image for the services page hero section',
              area: 'hero',
              path: 'services/hero',
              dimensions: {
                width: 1920,
                height: 1080,
                aspectRatio: 16/9
              }
            }
          ]
        },
        {
          id: 'categories',
          name: 'Service Categories',
          description: 'Main service category visuals',
          mediaPlaceholders: [
            {
              id: 'category-plastic-surgery',
              name: 'Plastic Surgery Image',
              description: 'Featured image for plastic surgery category',
              area: 'service',
              path: 'services/categories',
              dimensions: {
                width: 800,
                height: 600,
                aspectRatio: 4/3
              }
            },
            {
              id: 'category-dermatology',
              name: 'Dermatology Image',
              description: 'Featured image for dermatology category',
              area: 'service',
              path: 'services/categories',
              dimensions: {
                width: 800,
                height: 600,
                aspectRatio: 4/3
              }
            },
            {
              id: 'category-medical-spa',
              name: 'Medical Spa Image',
              description: 'Featured image for medical spa category',
              area: 'service',
              path: 'services/categories',
              dimensions: {
                width: 800,
                height: 600,
                aspectRatio: 4/3
              }
            },
            {
              id: 'category-functional-medicine',
              name: 'Functional Medicine Image',
              description: 'Featured image for functional medicine category',
              area: 'service',
              path: 'services/categories',
              dimensions: {
                width: 800,
                height: 600,
                aspectRatio: 4/3
              }
            }
          ]
        }
      ]
    }
  ];
} 