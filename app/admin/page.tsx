"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import AdminDashboard from '@/components/features/admin/AdminDashboard'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading, isAdmin } = useAdminAuth()

  useEffect(() => {
    // If not loading and user is not an admin, redirect
    if (!isLoading && !isAdmin) {
      router.push('/auth/login?redirect=/admin')
    }
  }, [isLoading, isAdmin, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not an admin, don't show anything (redirect will happen via useEffect)
  if (!isAdmin) {
    return null
  }

  // Render the admin dashboard
  return <AdminDashboard userEmail={user?.email} />
}