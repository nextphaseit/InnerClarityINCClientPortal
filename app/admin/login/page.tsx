"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdminDomain, setIsAdminDomain] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we're on the admin domain
    const hostname = window.location.hostname
    const isAdmin = hostname.includes("admin") || hostname === "localhost"
    setIsAdminDomain(isAdmin)

    // Redirect to patient portal if not on admin domain
    if (!isAdmin && hostname !== "localhost") {
      window.location.href = "https://patients.nextphaseit.org/portal/auth/signin"
    }
  }, [])

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn("azure-ad", {
        callbackUrl: "/admin/dashboard",
        redirect: false,
      })

      if (result?.error) {
        setError(
          result.error === "AccessDenied"
            ? "Access denied. Your email domain is not authorized."
            : `Sign in failed: ${result.error}`,
        )
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show Microsoft login on non-admin domains
  if (!isAdminDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center">Redirecting to patient portal...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
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
          <CardDescription>Sign in with your Microsoft work account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
        </CardContent>
      </Card>
    </div>
  )
}
