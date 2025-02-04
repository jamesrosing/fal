"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Edit, Trash } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

// Mock data for collections
const mockCollections = [
  {
    id: "plastic-surgery",
    title: "Plastic Surgery",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Plastic+Surgery",
  },
  { id: "emsculpt", title: "Emsculpt", imageUrl: "/placeholder.svg?height=200&width=300&text=Emsculpt" },
  { id: "sylfirmx", title: "SylfirmX", imageUrl: "/placeholder.svg?height=200&width=300&text=SylfirmX" },
  { id: "facials", title: "Facials", imageUrl: "/placeholder.svg?height=200&width=300&text=Facials" },
]

export default function CollectionsPage() {
  const [collections, setCollections] = useState(mockCollections)

  const handleDelete = (id: string) => {
    setCollections(collections.filter((collection) => collection.id !== id))
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <SidebarInset className="flex-grow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Collections</h1>
              <Button asChild>
                <Link href="/admin/collections/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Collection
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id}>
                  <CardHeader>
                    <CardTitle>{collection.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={collection.imageUrl || "/placeholder.svg"}
                      alt={collection.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/admin/collections/${collection.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            {collection.title} collection and all its associated albums and cases.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(collection.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

