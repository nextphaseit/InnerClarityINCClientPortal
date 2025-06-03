"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("An unexpected error occurred")
  const [errorCode, setErrorCode] = useState<string | null>(null)

  useEffect(() => {
    try {
      const error = searchParams?.get("error")
      setErrorCode(error)

      switch (error) {
        case "CredentialsSignin":
          setErrorMessage("Invalid email or password. Please check your credentials and try again.")
          break
        case "OAuthSignin":
        case "OAuthCallback":
          setErrorMessage("There was a problem with the authentication service. Please try again.")
          break
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
          setErrorMessage("There was a problem creating your account. Please try again.")
          break
        case "Callback":
          setErrorMessage("There was a problem during the authentication callback. Please try again.")
          break
        case "OAuthAccountNotLinked":
          setErrorMessage(
            "This email is already associated with another account. Please sign in with your original method.",
          )
          break
        case "EmailSignin":
          setErrorMessage("Unable to send sign-in email. Please check your email address.")
          break
        case "SessionRequired":
          setErrorMessage("You must be signed in to access this page.")
          break
        case "AccessDenied":
          setErrorMessage("Access denied. You don't have permission to access this resource.")
          break
        case "Verification":
          setErrorMessage("The verification link has expired or has already been used.")
          break
        case "Configuration":
          setErrorMessage("There is a server configuration issue. Please contact support.")
          break
        default:
          setErrorMessage("An unexpected error occurred during authentication. Please try again.")
      }
    } catch (err) {
      console.error("Error parsing search params:", err)
      setErrorMessage("An unexpected error occurred. Please try again.")
    }
  }, [searchParams])

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
            <CardTitle className="text-2xl font-bold text-red-600">Authentication Error</CardTitle>
            <CardDescription className="text-base mt-2">There was a problem signing you in</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <Link href="/contact" className="text-clarity-blue-600 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>

          {errorCode && (
            <div className="text-center text-xs text-muted-foreground">
              <p>Error code: {errorCode}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <span>🔒</span>
              <span>HIPAA Secure Authentication</span>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Your security and privacy are our top priority
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clarity-blue-600"></div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorContent />
    </Suspense>
  )
}
