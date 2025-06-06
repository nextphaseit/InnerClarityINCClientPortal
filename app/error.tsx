"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the full error details
    console.error("Application error details:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      name: error.name,
    })
  }, [error])

  // Handle specific error types
  const getErrorMessage = () => {
    if (error.message.includes("response")) {
      return "There was a problem with the server response. Please try again."
    }
    if (error.message.includes("fetch")) {
      return "Network error occurred. Please check your connection."
    }
    return "An unexpected error occurred. Our team has been notified."
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-red-600 mb-6">
          <AlertTriangle className="h-12 w-12 mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold mb-2 text-gray-900">Something went wrong</h1>
        <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Information</h2>
          <p className="text-sm text-red-700 mb-2">
            <strong>Type:</strong> {error.name || "Application Error"}
          </p>
          {error.digest && (
            <p className="text-sm text-red-700 mb-2">
              <strong>ID:</strong> {error.digest}
            </p>
          )}
          <p className="text-sm text-red-700">
            <strong>Time:</strong> {new Date().toLocaleString()}
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={reset} className="w-full bg-gray-900 hover:bg-gray-800">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>

          <Button asChild variant="outline" className="w-full">
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to home page
            </a>
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
