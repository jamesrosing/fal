"use client"

import { useState } from "react"
import { StructuredImageUpload } from "./structured-image-upload"
import { TeamMember } from "@/lib/supabase"
import OptimizedImage from '@/components/media/OptimizedImage';
import OptimizedVideo from '@/components/media/OptimizedVideo';


interface TeamMemberImageUploadProps {
  teamMember: TeamMember
  onUploadComplete: (updatedMember: TeamMember) => void
}

export function TeamMemberImageUpload({ teamMember, onUploadComplete }: TeamMemberImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = async (result: {
    url: string
    public_id: string
    metadata: {
      width: number
      height: number
      format: string
      resource_type: string
    }
  }) => {
    try {
      setUploading(true)
      setError(null)

      // Validate team member ID
      if (!teamMember.id) {
        throw new Error('Team member ID is missing')
      }

      // Ensure we have a valid URL
      if (!result.url) {
        throw new Error('No image URL received from upload')
      }

      console.log('Attempting to update team member:', {
        id: teamMember.id,
        name: teamMember.name,
        currentImageUrl: teamMember.image_url || '<empty>',
        newImageUrl: result.url
      })

      // Update team member with new image URL
      const response = await fetch('/api/team', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: teamMember.id,
          image_url: result.url || '', // Ensure we never send null/undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Error updating team member:', {
          status: response.status,
          statusText: response.statusText,
          data,
          teamMember: {
            id: teamMember.id,
            name: teamMember.name,
            currentImageUrl: teamMember.image_url || '<empty>'
          }
        })
        throw new Error(data.error || 'Failed to update team member')
      }

      console.log('Successfully updated team member:', {
        id: data.id,
        name: data.name,
        previousImageUrl: teamMember.image_url || '<empty>',
        newImageUrl: data.image_url
      })
      onUploadComplete(data)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update team member')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <StructuredImageUpload
        defaultArea="team"
        defaultSection={teamMember.is_provider ? "providers" : "staff"}
        onUploadComplete={handleUploadComplete}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {uploading && <p className="text-muted-foreground text-sm">Updating team member...</p>}
    </div>
  )
} 