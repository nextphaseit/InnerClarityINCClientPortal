"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  description?: string
}

export function ErrorFallback({
  error,
  resetError,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-mono">{error.message}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {resetError && (
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
