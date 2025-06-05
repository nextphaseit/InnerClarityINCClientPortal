"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthError() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("An authentication error occurred")

  useEffect(() => {
    const error = searchParams?.get("error")

    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage("There is a server configuration issue")
          break
        case "AccessDenied":
          setErrorMessage("Access denied. Your email domain is not authorized for this portal")
          break
        case "Verification":
          setErrorMessage("The verification link has expired or is invalid")
          break
        case "OAuthSignin":
          setErrorMessage("Error starting the sign-in process")
          break
        case "OAuthCallback":
          setErrorMessage("Error completing the sign-in process")
          break
        case "OAuthCreateAccount":
          setErrorMessage("Error creating your account")
          break
        case "EmailCreateAccount":
          setErrorMessage("Error creating your account")
          break
        case "Callback":
          setErrorMessage("Authentication callback error")
          break
        case "OAuthAccountNotLinked":
          setErrorMessage("Your email is already associated with another account")
          break
        case "EmailSignin":
          setErrorMessage("Error sending the verification email")
          break
        case "CredentialsSignin":
          setErrorMessage("Invalid credentials")
          break
        case "SessionRequired":
          setErrorMessage("Please sign in to access this page")
          break
        default:
          setErrorMessage(`Authentication error: ${error}`)
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-red-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-900">Authentication Error</CardTitle>
          <CardDescription className="text-gray-600">We encountered a problem while signing you in</CardDescription>
        </CardHeader>

        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="text-sm text-gray-600 space-y-2">
            <p>This could be due to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Using an unauthorized email domain</li>
              <li>Microsoft authentication service issues</li>
              <li>Server configuration problems</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
            <Link href="/auth/signin">Try Again</Link>
          </Button>

          <div className="text-center text-xs text-gray-500">
            <p>Need help? Contact support at:</p>
            <p className="font-medium">support@innerclarity.org</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
