"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An unexpected error occurred during authentication.",
  Signin: "There was an error during the sign-in process.",
  OAuthSignin: "Error in constructing an authorization URL.",
  OAuthCallback: "Error in handling the response from an OAuth provider.",
  OAuthCreateAccount: "Could not create OAuth account in the database.",
  EmailCreateAccount: "Could not create email account in the database.",
  Callback: "Error in the OAuth callback handler route.",
  OAuthAccountNotLinked: "The email on the account is already linked, but not with this OAuth account.",
  EmailSignin: "Sending the e-mail with the verification token failed.",
  CredentialsSignin: "The authorize callback returned null in the Credentials provider.",
  SessionRequired: "The content of this page requires you to be signed in at all times.",
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error") || "Default"

  const errorMessage = errorMessages[error] || errorMessages.Default

  const handleRetry = () => {
    window.location.href = "/auth/signin"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/inner-clarity-logo.png"
              alt="Inner Clarity Inc."
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Authentication Error
          </CardTitle>
          <CardDescription className="text-gray-600">There was a problem with your sign-in attempt</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error}
              <br />
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full" variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button asChild className="w-full" variant="outline">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Return Home
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>If this problem persists, please contact support:</p>
            <p className="mt-2">
              <strong>Phone:</strong> (984) 274-3723
              <br />
              <strong>Email:</strong> support@innerclarityinc.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
