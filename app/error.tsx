"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're sorry, but there was an error loading this page. Our team has been notified.
        </p>
        <div className="space-y-4">
          <Button onClick={() => reset()} className="w-full">
            Try again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
            Return to home page
          </Button>
        </div>
      </div>
    </div>
  )
}
