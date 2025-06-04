"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Home, RefreshCw, Mail } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error")

  const errorMessages: Record<string, { title: string; description: string; action?: string }> = {
    Configuration: {
      title: "Configuration Error",
      description: "The authentication service is not properly configured. Please contact your system administrator.",
      action: "contact_admin",
    },
    AccessDenied: {
      title: "Access Denied",
      description: "You don't have permission to access this application. Your email domain may not be authorized.",
      action: "contact_admin",
    },
    Verification: {
      title: "Verification Failed",
      description: "The verification link has expired or has already been used. Please try signing in again.",
      action: "retry",
    },
    OAuthSignin: {
      title: "OAuth Sign-in Failed",
      description: "There was a problem with the OAuth sign-in process. Please try again.",
      action: "retry",
    },
    OAuthCallback: {
      title: "OAuth Callback Error",
      description: "There was a problem processing the OAuth callback. This may be a configuration issue.",
      action: "contact_admin",
    },
    OAuthCreateAccount: {
      title: "Account Creation Failed",
      description: "We couldn't create your account. Please contact support for assistance.",
      action: "contact_admin",
    },
    EmailCreateAccount: {
      title: "Email Account Creation Failed",
      description:
        "We couldn't create an account with that email address. Please try a different email or contact support.",
      action: "contact_admin",
    },
    Callback: {
      title: "Callback Error",
      description: "There was a problem with the authentication callback. Please try signing in again.",
      action: "retry",
    },
    OAuthAccountNotLinked: {
      title: "Account Not Linked",
      description: "This account is not linked to your profile. Please use the same sign-in method you used before.",
      action: "retry",
    },
    EmailSignin: {
      title: "Email Sign-in Failed",
      description: "We couldn't send you a sign-in email. Please check your email address and try again.",
      action: "retry",
    },
    CredentialsSignin: {
      title: "Invalid Credentials",
      description: "The email or password you entered is incorrect. Please try again.",
      action: "retry",
    },
    SessionRequired: {
      title: "Session Required",
      description: "You need to be signed in to access this page. Please sign in and try again.",
      action: "retry",
    },
    Default: {
      title: "Authentication Error",
      description: "An unexpected error occurred during authentication. Please try again.",
      action: "retry",
    },
  }

  const errorInfo = errorMessages[error || "Default"] || errorMessages.Default

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Authentication Error</h1>
          <p className="text-gray-600 dark:text-gray-400">Something went wrong during sign-in</p>
        </div>

        <Card className="shadow-lg border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">{errorInfo.title}</CardTitle>
            <CardDescription>{errorInfo.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error Code:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {errorInfo.action === "retry" && (
                <Button asChild className="w-full">
                  <Link href="/auth/signin">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>

              {errorInfo.action === "contact_admin" && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="mailto:support@innerclarityinc.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>If this problem persists, please contact support at:</p>
              <p className="font-medium">support@innerclarityinc.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}
