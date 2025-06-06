"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState("An authentication error occurred")

  useEffect(() => {
    const error = searchParams?.get("error")

    if (error) {
      switch (error) {
        case "AccessDenied":
          setErrorMessage("Access denied. You do not have permission to access this resource.")
          break
        case "Configuration":
          setErrorMessage("There is a problem with the server configuration.")
          break
        case "Verification":
          setErrorMessage("The verification link is invalid or has expired.")
          break
        case "OAuthSignin":
          setErrorMessage("Error in the OAuth sign-in process.")
          break
        case "OAuthCallback":
          setErrorMessage("Error in the OAuth callback process.")
          break
        case "OAuthCreateAccount":
          setErrorMessage("Could not create OAuth provider account.")
          break
        case "EmailCreateAccount":
          setErrorMessage("Could not create email provider account.")
          break
        case "Callback":
          setErrorMessage("Error in the OAuth callback handler.")
          break
        case "OAuthAccountNotLinked":
          setErrorMessage("Email already in use with different provider.")
          break
        case "EmailSignin":
          setErrorMessage("Error sending the verification email.")
          break
        case "CredentialsSignin":
          setErrorMessage("Invalid credentials.")
          break
        case "SessionRequired":
          setErrorMessage("Authentication required. Please sign in to access this page.")
          break
        default:
          setErrorMessage(`Authentication error: ${error}`)
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-red-600 mb-6">
          <AlertTriangle className="h-12 w-12 mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>If this problem persists, please contact support at:</p>
          <p className="font-medium">support@nextphaseit.org</p>
        </div>
      </div>
    </div>
  )
}
