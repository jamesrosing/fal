"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { CldUploadWidgetWrapper } from "@/components/media/CldUploadWidget"
import { TeamMember } from "@/lib/supabase"
import { Plus, Edit, Trash } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import CldImage from '@/components/media/CldImage'
import CldVideo from '@/components/media/CldVideo'


export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    title: '',
    role: '',
    description: '',
    image_url: '',
    order: 0,
    is_provider: false
  })

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/team')
      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }
      const data = await response.json()
      
      // Transform API data to ensure correct types
      const transformedData = data.map((member: any) => ({
        ...member,
        order: typeof member.order === 'string' ? parseInt(member.order, 10) : member.order,
        is_provider: member.is_provider === 'true' || member.is_provider === true
      }))
      
      setTeamMembers(transformedData)
    } catch (error) {
      console.error('Error fetching team members:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMember = async () => {
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      })

      if (!response.ok) throw new Error('Failed to create team member')
      
      await fetchTeamMembers()
      setNewMember({
        name: "",
        title: "",
        role: "",
        description: "",
        image_url: "",
        order: 0,
        is_provider: false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team member')
    }
  }

  const handleUpdateMember = async (member: TeamMember) => {
    try {
      const response = await fetch('/api/team', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      })

      if (!response.ok) throw new Error('Failed to update team member')
      
      await fetchTeamMembers()
      setEditingMember(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team member')
    }
  }

  const handleDeleteMember = async (id: string) => {
    try {
      const response = await fetch(`/api/team?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete team member')
      
      await fetchTeamMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team member')
    }
  }

  const handleImageUploaded = (member: TeamMember) => {
    setTeamMembers(prev => 
      prev.map(m => m.id === member.id ? member : m)
    )
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <SidebarInset className="flex-grow">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Team Members</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Create a new team member profile. You can add their photo after creating the profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newMember.title}
                        onChange={(e) => setNewMember(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={newMember.role}
                        onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newMember.description}
                        onChange={(e) => setNewMember(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="order">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        value={newMember.order}
                        onChange={(e) => setNewMember(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_provider"
                        checked={newMember.is_provider}
                        onCheckedChange={(checked) => setNewMember(prev => ({ ...prev, is_provider: checked }))}
                      />
                      <Label htmlFor="is_provider">Is Provider</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateMember}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </header>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardHeader>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role || ''}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {member.image_url ? (
                      <div className="relative aspect-[3/4] mb-4">
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="object-cover w-full h-full rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] mb-4 bg-muted flex items-center justify-center rounded-lg">
                        <p className="text-muted-foreground">No image</p>
                      </div>
                    )}
                    <CldUploadWidgetWrapper
                      onUpload={(result) => {
                        const updatedMember = {
                          ...member,
                          image_url: result.secure_url
                        };
                        handleUpdateMember(updatedMember);
                        handleImageUploaded(updatedMember);
                      }}
                      buttonText="Upload Image"
                      variant="outline"
                      className="w-full"
                      options={{
                        folder: `team/headshots/`,
                        tags: [`team`, `headshot`, member.name.toLowerCase().replace(/\s+/g, '-')]
                      }}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                              id="edit-name"
                              value={editingMember?.name || member.name}
                              onChange={(e) => setEditingMember({
                                ...(editingMember || member),
                                name: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                              id="edit-title"
                              value={editingMember?.title || member.title || ''}
                              onChange={(e) => setEditingMember({
                                ...(editingMember || member),
                                title: e.target.value || null
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-role">Role</Label>
                            <Input
                              id="edit-role"
                              value={editingMember?.role || member.role}
                              onChange={(e) => setEditingMember({
                                ...(editingMember || member),
                                role: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                              id="edit-description"
                              value={editingMember?.description || member.description}
                              onChange={(e) => setEditingMember({
                                ...(editingMember || member),
                                description: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-order">Display Order</Label>
                            <Input
                              id="edit-order"
                              type="number"
                              value={editingMember?.order ?? member.order}
                              onChange={(e) => setEditingMember({
                                ...(editingMember || member),
                                order: parseInt(e.target.value) || 0
                              })}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="edit-is_provider"
                              checked={editingMember?.is_provider ?? member.is_provider}
                              onCheckedChange={(checked) => setEditingMember({
                                ...(editingMember || member),
                                is_provider: checked
                              })}
                            />
                            <Label htmlFor="edit-is_provider">Is Provider</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => handleUpdateMember(editingMember || member)}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the team member
                            and their associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>Delete</AlertDialogAction>
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