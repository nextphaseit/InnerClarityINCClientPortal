"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center p-6 text-center bg-red-50">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-2">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
                <h1 className="text-3xl font-bold text-gray-900">Something went wrong</h1>
                <p className="text-gray-600">An unexpected error occurred</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-red-700 mb-2">Application Error</h2>
                <p className="text-gray-600 mb-6">
                  We're sorry, but there was an error loading this page. Our team has been notified.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => this.setState({ hasError: false, error: null })}
                    className="w-full bg-gray-900 hover:bg-gray-800"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try again
                  </Button>

                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Return to home page
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>If this problem persists, please contact support at:</p>
                  <p className="font-medium">support@nextphaseit.org</p>
                </div>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
