"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AuthError() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("An authentication error occurred")

  useEffect(() => {
    const error = searchParams?.get("error")
    if (error) {
      setErrorMessage(getErrorMessage(error))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/placeholder.svg?height=80&width=80&text=IC"
              alt="Inner Clarity Inc."
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
            <CardDescription className="text-base mt-2">
              We encountered an issue with your sign-in attempt
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 font-medium">{errorMessage}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Try Again</Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <span>🔒</span>
              <span>HIPAA Secure Portal</span>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-1">
              Need help? Contact support at support@innerclarity.inc
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "Access denied. You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    CredentialsSignin: "Invalid email or password. Please check your credentials and try again.",
    OAuthSignin: "Error occurred during sign in.",
    OAuthCallback: "Error occurred during authentication callback.",
    OAuthCreateAccount: "Could not create account.",
    EmailSignin: "Unable to send sign-in email. Please try again later.",
    SessionRequired: "Please sign in to access this page.",
    Default: "An unexpected authentication error occurred. Please try again.",
  }

  return errorMessages[error] || errorMessages.Default
}
