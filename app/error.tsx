"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

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

  // Get a safe error message
  const getErrorMessage = (error: Error) => {
    try {
      if (error.message) {
        return error.message
      }
      return "An unexpected error occurred"
    } catch {
      return "An unexpected error occurred"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/inner-clarity-logo.png"
              alt="Inner Clarity"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Something went wrong</CardTitle>
            <CardDescription className="text-base mt-2">
              An unexpected error occurred. Please try again.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{getErrorMessage(error)}</AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">Error Details (Development)</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all text-xs">{error.stack || error.toString()}</pre>
            </details>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <span>🔒</span>
              <span>HIPAA Secure Portal</span>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-1">Your data security is our priority</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
