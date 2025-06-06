"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  const [errorInfo, setErrorInfo] = useState({
    error: "Unknown Error",
    description: "An authentication error occurred",
  })

  useEffect(() => {
    try {
      // Get URL parameters safely
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get("error") || "Unknown Error"
      const description = urlParams.get("error_description") || "An authentication error occurred"

      setErrorInfo({
        error: String(error),
        description: String(description),
      })
    } catch (err) {
      console.error("Error parsing URL params:", err)
      // Keep default values
    }
  }, [])

  const getErrorMessage = (error: string) => {
    const errorLower = (error || "").toLowerCase()

    if (errorLower.includes("configuration")) {
      return "There's an issue with the authentication configuration."
    }
    if (errorLower.includes("access") || errorLower.includes("denied")) {
      return "Access was denied. You may not have permission to sign in."
    }
    if (errorLower.includes("verification")) {
      return "The verification link is invalid or has expired."
    }
    return "An unexpected authentication error occurred."
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-red-600 mb-6">
          <AlertTriangle className="h-12 w-12 mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold mb-2 text-gray-900">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{getErrorMessage(errorInfo.error)}</p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Details</h2>
          <p className="text-sm text-red-700 mb-2">
            <strong>Error:</strong> {errorInfo.error}
          </p>
          <p className="text-sm text-red-700">
            <strong>Description:</strong> {errorInfo.description}
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full bg-gray-900 hover:bg-gray-800">
            <Link href="/auth/signin">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try signing in again
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to home page
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
