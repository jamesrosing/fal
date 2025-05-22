"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from '@/components/features/admin/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/shared/ui/sidebar'
import { Button } from '@/components/shared/ui/button'
import { Input } from '@/components/shared/ui/input'
import { Label } from '@/components/shared/ui/label'
import { Separator } from '@/components/shared/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/shared/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/shared/ui/breadcrumb'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from "sonner"

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check if user has a valid session on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error("Invalid or expired password reset link")
        router.push('/auth/login')
      }
    }
    
    checkSession()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    
    // Validate passwords
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }
    
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long")
      return
    }
    
    setIsLoading(true)
    
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        throw error
      }
      
      // Success
      toast.success("Password updated successfully")
      
      // Redirect to profile page
      router.push('/profile')
    } catch (error: any) {
      toast.error(error.message || "Failed to update password")
      setErrorMessage(error.message || "An error occurred during password update")
      console.error("Password update error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar isAdminPage={false} />
        <SidebarInset className="flex-grow">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Update Password</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Create New Password</CardTitle>
                <CardDescription>Enter and confirm your new password</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                      {errorMessage}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
} 