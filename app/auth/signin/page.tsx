"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle } from "lucide-react"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard"
  const errorParam = searchParams.get("error")

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        console.log("✅ User already authenticated, redirecting...")
        router.push(callbackUrl)
      }
    }

    checkSession()
  }, [router, callbackUrl])

  useEffect(() => {
    // Handle error from URL params
    if (errorParam) {
      switch (errorParam) {
        case "Configuration":
          setError("There is a problem with the server configuration.")
          break
        case "AccessDenied":
          setError("Access denied. You do not have permission to sign in.")
          break
        case "Verification":
          setError("The verification token has expired or has already been used.")
          break
        case "OAuthSignin":
          setError("Error in constructing an authorization URL.")
          break
        case "OAuthCallback":
          setError("Error in handling the response from an OAuth provider.")
          break
        case "OAuthCreateAccount":
          setError("Could not create OAuth account in the database.")
          break
        case "EmailCreateAccount":
          setError("Could not create email account in the database.")
          break
        case "Callback":
          setError("Error in the OAuth callback handler route.")
          break
        case "OAuthAccountNotLinked":
          setError("The email on the account is already linked, but not with this OAuth account.")
          break
        case "EmailSignin":
          setError("Sending the e-mail with the verification token failed.")
          break
        case "CredentialsSignin":
          setError("The authorize callback returned null in the Credentials provider.")
          break
        case "SessionRequired":
          setError("The content of this page requires you to be signed in at all times.")
          break
        default:
          setError("An error occurred during authentication. Please try again.")
      }
    }
  }, [errorParam])

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🔐 Initiating Microsoft sign-in...")

      const result = await signIn("azure-ad", {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        console.error("❌ Sign-in error:", result.error)
        setError("Failed to sign in with Microsoft. Please try again.")
      } else if (result?.url) {
        console.log("✅ Sign-in successful, redirecting...")
        router.push(result.url)
      }
    } catch (error) {
      console.error("❌ Sign-in exception:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Inner Clarity Admin</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Sign in with your Microsoft account to access the admin portal
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleMicrosoftSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"
                  />
                </svg>
                Sign in with Microsoft
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-500">
            <p>Authorized personnel only</p>
            <p className="mt-1">
              Access restricted to <span className="font-medium">@innerclarity.org</span>,{" "}
              <span className="font-medium">@innerclarityinc.com</span>, and{" "}
              <span className="font-medium">@nextphaseit.org</span> domains
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
