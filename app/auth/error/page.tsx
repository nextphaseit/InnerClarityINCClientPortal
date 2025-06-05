"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("An authentication error occurred")

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
        <div className="mx-auto mb-6">
          <Image src="/images/inner-clarity-logo.png" alt="NextPhase IT" width={120} height={40} className="mx-auto" />
        </div>

        <div className="text-red-600 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>

          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-800 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Return to Home
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>If this problem persists, please contact support at support@nextphaseit.org</p>
        </div>
      </div>
    </div>
  )
}
