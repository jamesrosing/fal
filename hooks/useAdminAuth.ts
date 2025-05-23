import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface AdminAuthState {
  isLoading: boolean
  isAdmin: boolean
  user: any | null
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isLoading: true,
    isAdmin: false,
    user: null,
  })
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setAuthState({ isLoading: false, isAdmin: false, user: null })
          router.push('/auth/login?redirect=/admin')
          return
        }

        // Check if user has admin role
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
          setAuthState({ isLoading: false, isAdmin: false, user })
          router.push('/?message=unauthorized')
          return
        }

        // User is admin
        setAuthState({ isLoading: false, isAdmin: true, user })
      } catch (error) {
        console.error('Error checking admin auth:', error)
        setAuthState({ isLoading: false, isAdmin: false, user: null })
        router.push('/auth/login?redirect=/admin')
      }
    }

    checkAdminAuth()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAuthState({ isLoading: false, isAdmin: false, user: null })
          router.push('/auth/login')
        } else if (event === 'SIGNED_IN' && session) {
          // Re-check admin status on sign in
          checkAdminAuth()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return authState
} 