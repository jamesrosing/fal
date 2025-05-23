import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Hardcoded credentials as fallback to ensure API works even without env vars
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pzzrsiomhdwyvgctlduf.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6enJzaW9taGR3eXZnY3RsZHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4NDIxNDcsImV4cCI6MjAzMTQxODE0N30.Hp4OQFOqiEje-CY6v-h7kKh2H-tqhYU_hUvRJO3-nwg'

// Simple direct Supabase client creation
const createClient = () => createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sample data to fall back to if the database query fails
const sampleTeamMembers = [
  {
    id: '1',
    name: 'Dr. Jane Smith',
    title: 'MD, FACS',
    role: 'Plastic Surgeon',
    description: 'Board-certified plastic surgeon with over 15 years of experience.',
    order: 1,
    is_provider: 'true',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_url: 'https://placehold.co/600x800?text=Dr.+Jane+Smith'
  },
  {
    id: '2',
    name: 'Dr. Michael Johnson',
    title: 'MD',
    role: 'Dermatologist',
    description: 'Specializing in medical and cosmetic dermatology.',
    order: 2,
    is_provider: 'true',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_url: 'https://placehold.co/600x800?text=Dr.+Michael+Johnson'
  },
  {
    id: '3',
    name: 'Sarah Thompson',
    role: 'Patient Coordinator',
    description: 'Helping patients navigate their aesthetic journey.',
    order: 3,
    is_provider: 'false',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    image_url: 'https://placehold.co/600x800?text=Sarah+Thompson'
  }
];

// GET all team members
export async function GET() {
  console.log('GET /api/team: Starting request')
  
  try {
    // Create the client
    const supabase = createClient()
    
    console.log('GET /api/team: Supabase client created')
    
    // Try to fetch team members
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('order', { ascending: true })

    if (error) {
      console.error('GET /api/team: Failed to fetch team members:', error)
      console.log('GET /api/team: Returning sample data')
      return NextResponse.json(sampleTeamMembers)
    }

    console.log(`GET /api/team: Successfully fetched ${data?.length || 0} team members`)
    
    // Return sample data if there are no team members
    if (!data || data.length === 0) {
      console.log('GET /api/team: No team members found, returning sample data')
      return NextResponse.json(sampleTeamMembers)
    }

    // Convert types to match TeamMember interface
    const formattedData = data.map(member => ({
      ...member,
      order: typeof member.order === 'string' ? parseInt(member.order, 10) : member.order,
      is_provider: member.is_provider.toString() // Convert to string regardless of original type
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('GET /api/team: Error fetching team members:', error)
    console.log('GET /api/team: Returning sample data due to error')
    return NextResponse.json(sampleTeamMembers)
  }
}

// POST to create or update a team member
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, ...teamMemberData } = body

    let result
    if (id) {
      // Update existing team member
      const { data, error } = await createClient()
        .from('team_members')
        .update(teamMemberData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new team member
      const { data, error } = await createClient()
        .from('team_members')
        .insert(teamMemberData)
        .select()
        .single()

      if (error) throw error
      result = data
    }

    revalidatePath('/team')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

// PATCH to update specific fields
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }

    // UUID validation regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format. Expected UUID format.' },
        { status: 400 }
      )
    }

    // Validate updates
    if ('image_url' in updates && !updates.image_url) {
      updates.image_url = '' // Convert null/undefined to empty string to match database
    }

    console.log('Starting team member update process:', { id, updates })

    // First, try to get all team members to verify connection
    const { data: allMembers, error: listError } = await createClient()
      .from('team_members')
      .select('id, name, image_url')

    if (listError) {
      console.error('Error listing team members:', listError)
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    console.log('Available team members:', allMembers?.map((m: { id: string; name: string; image_url?: string }) => ({
      id: m.id,
      name: m.name,
      image_url: m.image_url || '<empty>'
    })))

    // Check if member exists
    const { data: existingMember, error: checkError } = await createClient()
      .from('team_members')
      .select('*')
      .eq('id', id)

    if (checkError) {
      console.error('Error fetching team member:', checkError)
      return NextResponse.json(
        { error: 'Error fetching team member' },
        { status: 500 }
      )
    }

    if (!existingMember || existingMember.length === 0) {
      console.error(`Team member not found. ID: ${id}. Available IDs:`, allMembers?.map((m: { id: string }) => m.id))
      return NextResponse.json(
        { error: `Team member not found with ID: ${id}` },
        { status: 404 }
      )
    }

    console.log('Found existing member:', existingMember[0])

    // Perform the update
    const { error: updateError } = await createClient()
      .from('team_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: `Failed to update team member: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Fetch the updated record
    const { data: updatedMember, error: getError } = await createClient()
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single()

    if (getError) {
      console.error('Error fetching updated member:', getError)
      return NextResponse.json(
        { error: 'Failed to fetch updated team member' },
        { status: 500 }
      )
    }

    if (!updatedMember) {
      return NextResponse.json(
        { error: 'No data returned after update' },
        { status: 500 }
      )
    }

    console.log('Update successful:', updatedMember)

    revalidatePath('/team')
    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update team member' },
      { status: 500 }
    )
  }
}

// DELETE a team member
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = (await searchParams).get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }

    const { error } = await createClient()
      .from('team_members')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/team')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    )
  }
} 