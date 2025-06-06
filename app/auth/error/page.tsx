"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("An authentication error occurred")
  const [errorDetails, setErrorDetails] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const error = searchParams?.get("error")
      const errorDescription = searchParams?.get("error_description")

      if (errorDescription) {
        setErrorDetails(errorDescription)
      }

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
          case "AuthError":
            setErrorMessage("An authentication error occurred. Please try again.")
            break
          default:
            setErrorMessage(`Authentication error: ${error}`)
        }
      }
    } catch (err) {
      console.error("Error processing error page:", err)
      setErrorMessage("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <div className="mx-auto mb-6">
          <Image
            src="/images/inner-clarity-logo.png"
            alt="Inner Clarity"
            width={120}
            height={40}
            className="mx-auto"
            priority
          />
        </div>

        <div className="text-red-600 mb-4">
          <AlertTriangle className="h-12 w-12 mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold mb-2 text-gray-900">Authentication Error</h1>
        <p className="text-gray-600 mb-4">{errorMessage}</p>

        {errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-700">{errorDetails}</p>
          </div>
        )}

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
