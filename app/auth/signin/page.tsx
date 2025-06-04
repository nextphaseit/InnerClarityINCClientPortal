"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = searchParams?.get("callbackUrl") || "/"
  const urlError = searchParams?.get("error")

  useEffect(() => {
    if (urlError) {
      switch (urlError) {
        case "Configuration":
          setError("There is a problem with the server configuration.")
          break
        case "AccessDenied":
          setError("Access denied. Please contact your administrator.")
          break
        case "Verification":
          setError("The verification token has expired or has already been used.")
          break
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
          setError("Error occurred during authentication. Please try again.")
          break
        case "OAuthAccountNotLinked":
          setError("Account not linked. Please use the same sign-in method you used before.")
          break
        case "SessionRequired":
          setError("Please sign in to access this page.")
          break
        default:
          setError("An unexpected error occurred. Please try again.")
      }
    }
  }, [urlError])

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Initiating Microsoft sign-in...")

      const result = await signIn("azure-ad", {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        console.error("Sign-in error:", result.error)
        setError(`Authentication failed: ${result.error}`)
        return
      }

      if (result?.ok) {
        console.log("Sign-in successful, checking session...")

        // Wait a moment for the session to be established
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const session = await getSession()
        if (session) {
          console.log("Session established, redirecting...")
          router.push(callbackUrl)
        } else {
          console.log("No session found, redirecting anyway...")
          router.push(callbackUrl)
        }
      }
    } catch (err) {
      console.error("Sign-in exception:", err)
      setError("An unexpected error occurred during sign-in.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sign In Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Use your Microsoft account to access the application</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Microsoft Sign In Button */}
            <Button
              onClick={handleMicrosoftSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                  </svg>
                  Sign in with Microsoft
                </>
              )}
            </Button>

            {/* Additional Information */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By signing in, you agree to our terms of service and privacy policy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Secure authentication powered by Microsoft Entra ID
          </p>
        </div>
      </div>
    </div>
  )
}
