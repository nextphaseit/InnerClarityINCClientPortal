"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Admin error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-red-600 mb-6">
          <AlertTriangle className="h-12 w-12 mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold mb-4">Admin Portal Error</h1>
        <p className="text-gray-600 mb-6">
          Something went wrong in the admin portal. Please try again or contact support.
        </p>

        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button asChild variant="outline" className="w-full">
            <a href="/auth/signin?tab=admin">
              <Home className="mr-2 h-4 w-4" />
              Return to Sign In
            </a>
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Error ID: {error.digest}</p>
          <p className="mt-2">If this problem persists, please contact support at:</p>
          <p className="font-medium">support@nextphaseit.org</p>
        </div>
      </div>
    </div>
  )
}
