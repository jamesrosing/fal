"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageAssetUpload } from "@/components/image-asset-upload"
import { ImageArea } from "@/lib/cloudinary"
import { IMAGE_ASSETS, type ImageAsset, getImageUrl } from "@/lib/image-config"
import Image from "next/image"
import { Edit2, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteFromCloudinary } from "@/lib/cloudinary-upload"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { updateImageConfig, deleteImageAsset } from "@/app/actions/image-config"

export default function ImagesPage() {
  const [assets, setAssets] = useState<Record<string, ImageAsset>>(IMAGE_ASSETS)
  const [selectedArea, setSelectedArea] = useState<ImageArea | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingAsset, setEditingAsset] = useState<string | null>(null)

  // Filter assets based on area and search term
  const filteredAssets = Object.entries(assets).filter(([id, asset]) => {
    const matchesArea = selectedArea === "all" || asset.area === selectedArea
    const matchesSearch = id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesArea && matchesSearch
  })

  const handleUploadComplete = async (result: { url: string; public_id: string; metadata: any }) => {
    try {
      if (editingAsset) {
        // Handling update of existing asset
        const newAssets = {
          ...assets,
          [editingAsset]: {
            ...assets[editingAsset],
            publicId: result.public_id
          }
        }
        
        const updateResult = await updateImageConfig(newAssets)
        if (updateResult.success) {
          setAssets(newAssets)
          setEditingAsset(null)
          toast({
            title: "Image updated",
            description: "The image has been successfully updated.",
          })
        } else {
          toast({
            title: "Error",
            description: updateResult.error || "Failed to update image configuration.",
            variant: "destructive",
          })
        }
      } else {
        // Handling new asset upload
        const assetId = result.metadata.context?.asset_id || result.public_id.split('/').pop() || ''
        
        // Extract area from context or fallback to folder structure
        let area: ImageArea
        if (result.metadata.context?.area) {
          area = result.metadata.context.area as ImageArea
        } else {
          // Fallback: try to determine area from the folder structure
          const folder = result.public_id.split('/')[0]
          area = folder as ImageArea
        }
        
        // Create the new asset with appropriate defaults based on area
        const newAsset: ImageAsset = {
          id: assetId,
          area,
          description: result.metadata.context?.description || `${area} image - ${assetId}`,
          publicId: result.public_id,
          dimensions: area === 'team' ? {
            width: 600,
            height: 800,
            aspectRatio: 0.75
          } : area === 'hero' ? {
            width: 1920,
            height: 1080,
            aspectRatio: 1.7777777777777777
          } : {
            width: result.metadata.width,
            height: result.metadata.height,
            aspectRatio: result.metadata.width / result.metadata.height
          },
          defaultOptions: area === 'team' ? {
            width: 600,
            quality: 90
          } : area === 'hero' ? {
            width: 1920,
            quality: 85
          } : {
            width: 800,
            quality: 90
          }
        }

        console.log('Creating new asset:', { assetId, area, newAsset })

        const newAssets = {
          ...assets,
          [assetId]: newAsset
        }

        const updateResult = await updateImageConfig(newAssets)
        if (updateResult.success) {
          setAssets(newAssets)
          toast({
            title: "Image added",
            description: "The new image asset has been successfully added.",
          })
        } else {
          toast({
            title: "Error",
            description: updateResult.error || "Failed to update image configuration.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error('Failed to handle upload completion:', error)
      toast({
        title: "Error",
        description: "Failed to process the uploaded image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const asset = assets[assetId]
      await deleteFromCloudinary(asset.publicId)
      
      const deleteResult = await deleteImageAsset(assetId)
      if (deleteResult.success) {
        const newAssets = { ...assets }
        delete newAssets[assetId]
        setAssets(newAssets)
        
        toast({
          title: "Asset deleted",
          description: "The image asset has been successfully deleted.",
        })
      } else {
        toast({
          title: "Error",
          description: deleteResult.error || "Failed to delete image configuration.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to delete asset:', error)
      toast({
        title: "Error",
        description: "Failed to delete the image asset. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <SidebarInset className="flex-grow overflow-auto">
          <div className="p-6">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Image Assets</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add New Image
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload New Image</DialogTitle>
                          <DialogDescription>
                            Upload a new image asset to the system.
                          </DialogDescription>
                        </DialogHeader>
                        <ImageAssetUpload onUploadComplete={handleUploadComplete} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <div className="w-48">
                      <Label htmlFor="area-filter">Filter by Area</Label>
                      <Select
                        value={selectedArea}
                        onValueChange={(value) => setSelectedArea(value as ImageArea | "all")}
                      >
                        <SelectTrigger id="area-filter">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Areas</SelectItem>
                          <SelectItem value="hero">Hero Images</SelectItem>
                          <SelectItem value="gallery">Gallery Images</SelectItem>
                          <SelectItem value="service">Service Images</SelectItem>
                          <SelectItem value="team">Team Member Images</SelectItem>
                          <SelectItem value="logo">Logo & Branding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="search">Search</Label>
                      <Input
                        id="search"
                        placeholder="Search by ID or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssets.map(([id, asset]) => (
                      <Card key={id} className="overflow-hidden">
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={getImageUrl(id)}
                            alt={asset.description}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{id}</h3>
                              <p className="text-sm text-muted-foreground">{asset.description}</p>
                              <p className="text-sm text-muted-foreground mt-1">Area: {asset.area}</p>
                            </div>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon" onClick={() => setEditingAsset(id)}>
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Image</DialogTitle>
                                    <DialogDescription>
                                      Upload a new image to replace the current one.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <ImageAssetUpload
                                    assetId={id}
                                    defaultArea={asset.area}
                                    onUploadComplete={handleUploadComplete}
                                  />
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Image Asset</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this image asset? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAsset(id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  )
} 