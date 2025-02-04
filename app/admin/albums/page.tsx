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

// Mock data for albums
const mockAlbums = [
  {
    id: "face",
    title: "Face",
    collection: "Plastic Surgery",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Face",
  },
  {
    id: "eyelids",
    title: "Eyelids",
    collection: "Plastic Surgery",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Eyelids",
  },
  {
    id: "abdomen",
    title: "Abdomen",
    collection: "Emsculpt",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Abdomen",
  },
  {
    id: "buttocks",
    title: "Buttocks",
    collection: "Emsculpt",
    imageUrl: "/placeholder.svg?height=200&width=300&text=Buttocks",
  },
]

export default function AlbumsPage() {
  const [albums, setAlbums] = useState(mockAlbums)

  const handleDelete = (id: string) => {
    setAlbums(albums.filter((album) => album.id !== id))
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1 w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Albums</h1>
              <Button asChild>
                <Link href="/admin/albums/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Album
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <Card key={album.id} className="bg-card">
                  <CardHeader>
                    <CardTitle>{album.title}</CardTitle>
                    <CardDescription>{album.collection}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={album.imageUrl || "/placeholder.svg"}
                      alt={album.title}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href={`/admin/albums/${album.id}/edit`}>
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
                            {album.title} album and all its associated cases.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(album.id)}>Delete</AlertDialogAction>
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

