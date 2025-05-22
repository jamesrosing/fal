import { Metadata } from 'next';
import AdminLayout from '@/components/shared/layout/AdminLayout';
import { MediaBrowser } from '@/components/features/admin/SiteMediaManager/MediaBrowser';
import { MediaUploadWidget } from '@/components/features/admin/SiteMediaManager/MediaUploadWidget';
import { MediaOrganizationTools } from '@/components/features/admin/SiteMediaManager/MediaOrganizationTools';
import { MediaPageHeader } from '@/components/features/admin/SiteMediaManager/MediaPageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';

export const metadata: Metadata = {
  title: 'Media Management | Allure MD Admin',
  description: 'Manage your website media assets',
};

export default function AdminMediaPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <MediaPageHeader />
        
        <Tabs defaultValue="browser" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="browser">Media Browser</TabsTrigger>
            <TabsTrigger value="upload">Upload Media</TabsTrigger>
            <TabsTrigger value="organize">Organization Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browser" className="space-y-4">
            <MediaBrowser />
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <MediaUploadWidget />
          </TabsContent>
          
          <TabsContent value="organize" className="space-y-4">
            <MediaOrganizationTools />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 