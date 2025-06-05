"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset?: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error)
  }, [error])

  const handleReset = () => {
    try {
      if (typeof reset === "function") {
        reset()
      } else {
        window.location.href = "/"
      }
    } catch (err) {
      console.error("Reset failed:", err)
      window.location.href = "/"
    }
  }

  const handleGoHome = () => {
    try {
      window.location.href = "/"
    } catch (err) {
      console.error("Navigation failed:", err)
      window.location.reload()
    }
  }

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Critical Error</h1>
              <p className="text-gray-600 dark:text-gray-400">A critical error occurred in the application</p>
            </div>

            <Card className="shadow-lg border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-400">Application Error</CardTitle>
                <CardDescription>
                  We're sorry, but there was a critical error. Please try refreshing the page or return to the home
                  page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {process.env.NODE_ENV === "development" && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">{error.message}</p>
                    {error.digest && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Digest: {error.digest}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Button onClick={handleReset} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                  </Button>

                  <Button onClick={handleGoHome} variant="outline" className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Return to home page
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>If this problem persists, please contact support at:</p>
                  <p className="font-medium">support@nextphaseit.org</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </body>
    </html>
  )
}
