"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ImageUploadField from "@/components/image-upload-field"
import BackgroundRemover from "@/components/background-remover"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { type ImageArea } from "@/lib/image-utils"

export default function AdminPage() {
  const handleImageUploaded = (area: ImageArea) => (url: string) => {
    console.log(`Image uploaded for ${area}:`, url)
    // Here you would typically update your content management system
    // or database with the new image URL
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar isAdminPage={true} />
        <SidebarInset className="flex-grow">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <div className="flex flex-1 items-center">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">Admin Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Overview</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              <Tabs defaultValue="gallery" className="w-full">
                <TabsList>
                  <TabsTrigger value="gallery">Gallery Management</TabsTrigger>
                  <TabsTrigger value="uploads">Image Uploads</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                </TabsList>

                <TabsContent value="gallery" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Collections</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Manage your gallery collections and categories
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Albums</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Organize your images into albums
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Cases</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Manage before & after cases
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="uploads" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Background Remover */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Background Removal Tool</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BackgroundRemover />
                      </CardContent>
                    </Card>

                    {/* Hero Images */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Hero Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ImageUploadField
                          area="hero"
                          label="Upload Hero Image"
                          onImageUploaded={handleImageUploaded("hero")}
                        />
                      </CardContent>
                    </Card>

                    {/* Article Images */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Article Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ImageUploadField
                          area="article"
                          label="Upload Article Image"
                          onImageUploaded={handleImageUploaded("article")}
                        />
                      </CardContent>
                    </Card>

                    {/* Service Images */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Service Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ImageUploadField
                          area="service"
                          label="Upload Service Image"
                          onImageUploaded={handleImageUploaded("service")}
                        />
                      </CardContent>
                    </Card>

                    {/* Team Member Photos */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Team Photos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ImageUploadField
                          area="team"
                          label="Upload Team Photo"
                          onImageUploaded={handleImageUploaded("team")}
                        />
                      </CardContent>
                    </Card>

                    {/* Gallery Images */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Gallery Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ImageUploadField
                          area="gallery"
                          label="Upload Gallery Image"
                          onImageUploaded={handleImageUploaded("gallery")}
                        />
                      </CardContent>
                    </Card>

                    {/* Logo Upload */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Logo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ImageUploadField
                          area="logo"
                          label="Upload Logo"
                          onImageUploaded={handleImageUploaded("logo")}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="tools" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Image Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <BackgroundRemover />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}