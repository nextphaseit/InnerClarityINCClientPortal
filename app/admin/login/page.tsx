"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle } from "lucide-react"
import Image from "next/image"

function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for error parameters
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "authentication_required":
          setError("Please sign in to access the admin portal.")
          break
        case "microsoft_required":
          setError("Admin access requires Microsoft authentication.")
          break
        case "configuration_error":
          setError("Authentication configuration error. Please contact support.")
          break
        case "AccessDenied":
          setError("Access denied. Your email domain is not authorized for admin access.")
          break
        case "Signin":
          setError("Sign in failed. Please try again.")
          break
        default:
          setError("An authentication error occurred. Please try again.")
      }
    }

    // Check if already authenticated
    checkExistingSession()
  }, [searchParams])

  const checkExistingSession = async () => {
    try {
      const session = await getSession()
      if (session?.user?.role === "admin") {
        console.log("✅ Admin already authenticated, redirecting to dashboard")
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("Error checking session:", error)
    }
  }

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🔄 Initiating Microsoft sign-in for admin")

      const result = await signIn("azure-ad", {
        callbackUrl: "/admin/dashboard",
        redirect: false,
      })

      if (result?.error) {
        console.error("❌ Sign-in error:", result.error)

        switch (result.error) {
          case "AccessDenied":
            setError("Access denied. Your email domain is not authorized for admin access.")
            break
          case "Signin":
            setError("Sign in failed. Please check your credentials and try again.")
            break
          default:
            setError(`Sign in failed: ${result.error}`)
        }
      } else if (result?.url) {
        console.log("✅ Sign-in successful, redirecting to:", result.url)
        router.push(result.url)
      }
    } catch (error) {
      console.error("❌ Unexpected sign-in error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/inner-clarity-logo.png"
              alt="Inner Clarity Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
          <CardDescription>Sign in with your Microsoft work account to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleMicrosoftSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign in with Microsoft
                </>
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs text-gray-600">Admin access is restricted to authorized email domains:</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• @innerclarity.org</div>
                <div>• @innerclarityinc.com</div>
                <div>• @nextphaseit.org</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-gray-500">
                Need help? Contact{" "}
                <a href="mailto:support@innerclarity.org" className="text-blue-600 hover:underline">
                  support@innerclarity.org
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
