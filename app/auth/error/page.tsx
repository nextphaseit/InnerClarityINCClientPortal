"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return {
          title: "Configuration Error",
          description: "There is a problem with the server configuration. Please contact support.",
        }
      case "AccessDenied":
        return {
          title: "Access Denied",
          description: "You do not have permission to access this application. Please contact your administrator.",
        }
      case "Verification":
        return {
          title: "Verification Failed",
          description: "The verification token has expired or has already been used.",
        }
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
        return {
          title: "Authentication Error",
          description: "There was an error during the authentication process. Please try again.",
        }
      case "OAuthAccountNotLinked":
        return {
          title: "Account Not Linked",
          description:
            "This account is not linked to your profile. Please use the same sign-in method you used before.",
        }
      case "SessionRequired":
        return {
          title: "Session Required",
          description: "You need to be signed in to access this page.",
        }
      default:
        return {
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication. Please try again.",
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl text-red-900 dark:text-red-100">{errorInfo.title}</CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">{errorInfo.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/">Go Home</Link>
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400">Error Code: {error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
