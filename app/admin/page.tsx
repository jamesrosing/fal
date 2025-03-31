"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NavAdmin } from "@/components/nav-admin"
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
import { Button } from "@/components/ui/button"
import { Plus, ChevronLeft, Trash2, Upload } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useDropzone } from 'react-dropzone'
import { uploadToCloudinary, deleteFromCloudinary, getCloudinaryUrl } from "@/lib/cloudinary"
import { resizeImage } from "@/lib/utils"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FileRejection, DropEvent } from 'react-dropzone'
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface CloudinaryImage {
  id: string
  url: string
  public_id: string
  metadata: {
    width: number
    height: number
    format: string
  }
}

interface Case {
  id: string
  title: string
  images: CloudinaryImage[]
}

interface Album {
  title: string
  cases: Case[]
}

interface Collection {
  title: string
  albums: { [key: string]: Album }
}

interface Collections {
  [key: string]: Collection
}

// Helper function to generate placeholder cases
const generatePlaceholderCases = (albumName: string) => {
  return Array.from({ length: 4 }, (_, i) => ({
    id: String(i + 1),
    title: String(i + 1),
    images: Array.from({ length: 5 }, (_, j) => ({
      id: String(j + 1),
      url: "/placeholder.jpg",
      public_id: `placeholder/${albumName}/${i + 1}/${j + 1}`,
      metadata: {
        width: 800,
        height: 600,
        format: "jpg"
      }
    }))
  }))
}

// Define the collections structure with cases
const collections: Collections = {
  "plastic-surgery": {
    title: "Plastic Surgery",
    albums: {
      "face": {
        title: "Face",
        cases: generatePlaceholderCases("Face")
      },
      "eyelids": {
        title: "Eyelids",
        cases: generatePlaceholderCases("Eyelids")
      },
      "ears": {
        title: "Ears",
        cases: generatePlaceholderCases("Ears")
      },
      "nose": {
        title: "Nose",
        cases: generatePlaceholderCases("Nose")
      },
      "neck": {
        title: "Neck",
        cases: generatePlaceholderCases("Neck")
      },
      "breast-augmentation": {
        title: "Breast Augmentation",
        cases: generatePlaceholderCases("Breast Augmentation")
      },
      "breast-lift": {
        title: "Breast Lift",
        cases: generatePlaceholderCases("Breast Lift")
      },
      "breast-reduction": {
        title: "Breast Reduction",
        cases: generatePlaceholderCases("Breast Reduction")
      },
      "breast-revision": {
        title: "Breast Revision",
        cases: generatePlaceholderCases("Breast Revision")
      },
      "breast-nipple-areolar-complex": {
        title: "Breast Nipple Areolar Complex",
        cases: generatePlaceholderCases("Breast Nipple Areolar Complex")
      },
      "abdominoplasty": {
        title: "Abdominoplasty",
        cases: generatePlaceholderCases("Abdominoplasty")
      },
      "mini-abdominoplasty": {
        title: "Mini Abdominoplasty",
        cases: generatePlaceholderCases("Mini Abdominoplasty")
      },
      "liposuction": {
        title: "Liposuction",
        cases: generatePlaceholderCases("Liposuction")
      },
      "arm-lift": {
        title: "Arm Lift",
        cases: generatePlaceholderCases("Arm Lift")
      },
      "thigh-lift": {
        title: "Thigh Lift",
        cases: generatePlaceholderCases("Thigh Lift")
      }
    }
  },
  "emsculpt": {
    title: "Emsculpt",
    albums: {
      "abdomen": {
        title: "Abdomen",
        cases: generatePlaceholderCases("Abdomen")
      },
      "buttocks": {
        title: "Buttocks",
        cases: generatePlaceholderCases("Buttocks")
      },
      "arms": {
        title: "Arms",
        cases: generatePlaceholderCases("Arms")
      },
      "calves": {
        title: "Calves",
        cases: generatePlaceholderCases("Calves")
      }
    }
  },
  "sylfirmx": {
    title: "Sylfirm X",
    albums: {
      "face": {
        title: "Face",
        cases: generatePlaceholderCases("Sylfirm X Face")
      }
    }
  },
  "facials": {
    title: "Facials",
    albums: {
      "hydrafacial": {
        title: "HydraFacial",
        cases: generatePlaceholderCases("HydraFacial")
      }
    }
  }
}

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-zinc-500">Welcome to your admin dashboard.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
            <p className="text-sm text-zinc-500">Published articles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-zinc-500">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-zinc-500">Total uploaded images</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              <p className="text-sm">New article published: "EMSculpt Neo: The Future of Body Contouring"</p>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <p className="text-sm">Team member profile updated</p>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
              <p className="text-sm">New images uploaded to gallery</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}