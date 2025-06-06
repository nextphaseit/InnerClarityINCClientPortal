"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Database, Key, Settings } from "lucide-react"

export default function HomePage() {
  const { user, profile, loading, isConfigured } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isConfigured && user && profile) {
      // Redirect based on role
      if (profile.role === "admin" || profile.role === "super_admin") {
        router.push("/admin")
      } else {
        router.push("/portal")
      }
    }
  }, [user, profile, loading, isConfigured, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Setup Required</CardTitle>
            <CardDescription className="text-lg">
              Welcome to NextPhase IT Admin Portal. Please configure your environment to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold">1. Configure Supabase</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up your Supabase project and add the connection details to your environment variables.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Key className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold">2. Add Environment Variables</h3>
                  <p className="text-sm text-muted-foreground">
                    Copy the .env.local.example file and add your Supabase keys.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Settings className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold">3. Run Database Scripts</h3>
                  <p className="text-sm text-muted-foreground">
                    Execute the SQL scripts in the scripts folder to set up your database schema.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Required Environment Variables:</h4>
              <code className="text-sm text-blue-800 dark:text-blue-200 block whitespace-pre-wrap">
                {`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
              </code>
            </div>

            <div className="text-center">
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                Refresh After Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If configured but no user, show sign in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">NextPhase IT</CardTitle>
            <CardDescription>Admin Portal</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/auth/signin")} className="w-full bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
