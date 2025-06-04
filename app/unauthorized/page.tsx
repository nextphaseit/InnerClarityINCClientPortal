"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, LogIn } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"

export default function UnauthorizedPage() {
  const { user, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to appropriate dashboard
    if (status === "authenticated" && user) {
      if (user.role === "admin") {
        router.push("/admin")
      } else if (user.role === "patient") {
        router.push("/dashboard")
      }
    }
  }, [user, status, router])

  const handleSignIn = () => {
    router.push("/auth/signin")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/inner-clarity-logo.png"
              alt="Inner Clarity Inc."
              width={200}
              height={80}
              className="h-16 w-auto"
            />
          </div>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Access Denied</CardTitle>
          <CardDescription className="text-gray-600">You do not have permission to view this page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            {status === "unauthenticated" ? (
              <p>Please sign in with the appropriate account to access this resource.</p>
            ) : (
              <p>Your current account ({user?.email}) does not have the required permissions for this page.</p>
            )}
          </div>

          <div className="space-y-3">
            {status === "unauthenticated" ? (
              <Button onClick={handleSignIn} className="w-full" size="lg">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            ) : (
              <div className="space-y-2">
                <Button onClick={handleSignIn} variant="outline" className="w-full" size="lg">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In with Different Account
                </Button>
                <Button
                  onClick={() => {
                    if (user?.role === "admin") {
                      router.push("/admin")
                    } else if (user?.role === "patient") {
                      router.push("/dashboard")
                    } else {
                      router.push("/")
                    }
                  }}
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            <Button onClick={handleGoHome} variant="ghost" className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </div>

          <div className="text-xs text-center text-gray-400 mt-6">
            <p>Need help? Contact support at support@innerclarity.org</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
