"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Edit, Trash } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

// Mock data for cases
const mockCases = [
  {
    id: "1",
    title: "Case 1",
    album: "Face",
    collection: "Plastic Surgery",
    imageUrl: "/placeholder.svg?height=400&width=300&text=Case1",
  },
  {
    id: "2",
    title: "Case 2",
    album: "Eyelids",
    collection: "Plastic Surgery",
    imageUrl: "/placeholder.svg?height=400&width=300&text=Case2",
  },
  {
    id: "3",
    title: "Case 3",
    album: "Abdomen",
    collection: "Emsculpt",
    imageUrl: "/placeholder.svg?height=400&width=300&text=Case3",
  },
  {
    id: "4",
    title: "Case 4",
    album: "Buttocks",
    collection: "Emsculpt",
    imageUrl: "/placeholder.svg?height=400&width=300&text=Case4",
  },
]

export default function CasesPage() {
  const [cases, setCases] = useState(mockCases)

  const handleDelete = (id: string) => {
    setCases(cases.filter((caseItem) => caseItem.id !== id))
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar isAdminPage={true} />
        <SidebarInset className="flex-grow">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-2xl font-semibold">Cases</h1>
              <Button asChild>
                <Link href="/admin/cases/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Case
                </Link>
              </Button>
            </div>
          </header>
          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseItem) => (
              <Card key={caseItem.id} className="overflow-hidden bg-card">
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl text-foreground">{caseItem.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {caseItem.album} - {caseItem.collection}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={caseItem.imageUrl || "/placeholder.svg"}
                      alt={caseItem.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 p-6">
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/admin/cases/${caseItem.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {caseItem.title} and all its
                            associated images.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(caseItem.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

