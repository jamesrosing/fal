"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
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
import CldImage from '@/components/shared/media/CldImage';
import CldVideo from '@/components/shared/media/CldVideo';

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Initialize Supabase client in the browser
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      // Successful login
      toast.success("Logged in successfully")
      
      // Get the redirect path from query parameters
      const redirectPath = searchParams.get('redirect') || '/'
      console.log("Redirecting to:", redirectPath)
      
      // Ensure we have the latest session before redirecting
      await supabase.auth.getSession()
      
      // Add a small delay to ensure session is properly set
      setTimeout(() => {
        // Redirect to the original destination or dashboard
        router.push(redirectPath)
        router.refresh()
      }, 500)
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in")
      console.error("Login error:", error)
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
                    <BreadcrumbPage>Login</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                <CardDescription>Enter your email and password to access your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/reset-password" className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                  <div className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/create-account" className="underline underline-offset-4 hover:text-primary">
                      Create an account
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}


