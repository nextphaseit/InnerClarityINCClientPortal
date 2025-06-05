"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get error from URL if present
  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      console.error("Authentication error:", errorParam)

      // Map error codes to user-friendly messages
      switch (errorParam) {
        case "AccessDenied":
          setError("Access denied. Your email domain is not authorized for this portal.")
          break
        case "Configuration":
          setError("There is a server configuration issue. Please contact support.")
          break
        case "Verification":
          setError("The verification link has expired or is invalid.")
          break
        case "OAuthSignin":
          setError("Error starting the sign-in process. Please try again.")
          break
        case "OAuthCallback":
          setError("Error completing the sign-in process. Please try again.")
          break
        case "OAuthCreateAccount":
          setError("Error creating your account. Please contact support.")
          break
        case "EmailCreateAccount":
          setError("Error creating your account. Please contact support.")
          break
        case "Callback":
          setError("Authentication callback error. Please try again.")
          break
        case "OAuthAccountNotLinked":
          setError("Your email is already associated with another account.")
          break
        case "EmailSignin":
          setError("Error sending the verification email. Please try again.")
          break
        case "CredentialsSignin":
          setError("Invalid credentials. Please check your email and password.")
          break
        case "SessionRequired":
          setError("Please sign in to access this page.")
          break
        default:
          setError(`Authentication error: ${errorParam}. Please try again.`)
      }
    }
  }, [searchParams])

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get the callback URL or default to home
      const callbackUrl = searchParams?.get("callbackUrl") || "/"

      console.log("🔑 Initiating Microsoft sign-in...")

      // Trigger Microsoft sign-in
      await signIn("azure-ad", {
        callbackUrl,
        redirect: true,
      })

      // Note: With redirect: true, the code below won't execute
      // as the browser will be redirected by NextAuth
    } catch (err) {
      console.error("❌ Sign-in error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-purple-100">
        <CardHeader className="space-y-6 items-center text-center pb-6">
          {/* Logo */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-md">
            <Shield className="h-8 w-8 text-white" />
          </div>

          {/* Title and description */}
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to Inner Clarity</CardTitle>
            <CardDescription className="text-gray-600">Sign in with your Microsoft account to continue</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error alert */}
          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Microsoft sign-in button */}
          <Button
            onClick={handleMicrosoftSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                </svg>
                Sign in with Microsoft
              </>
            )}
          </Button>

          {/* Authorized domains info */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-100">
            <p>Authorized email domains:</p>
            <div className="mt-1 space-y-1">
              <p className="font-medium">@innerclarity.org</p>
              <p className="font-medium">@innerclarityinc.com</p>
              <p className="font-medium">@nextphaseit.org</p>
            </div>
          </div>

          {/* Support info */}
          <div className="text-center text-xs text-gray-400 pt-4">
            <p>Need help? Contact support at:</p>
            <p className="font-medium">support@innerclarity.org</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
