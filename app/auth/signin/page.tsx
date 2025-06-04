"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Users, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function SignInContent() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("patient")

  // Get error from URL params
  const urlError = searchParams?.get("error")
  const callbackUrl = searchParams?.get("callbackUrl") || "/"
  const tab = searchParams?.get("tab")

  useEffect(() => {
    if (tab === "admin") {
      setActiveTab("admin")
    } else if (tab === "patient") {
      setActiveTab("patient")
    }
  }, [tab])

  useEffect(() => {
    if (urlError) {
      switch (urlError) {
        case "Configuration":
          setError("There is a problem with the server configuration.")
          break
        case "AccessDenied":
          setError("Access denied. Please contact your administrator.")
          break
        case "Verification":
          setError("The verification token has expired or has already been used.")
          break
        default:
          setError("An error occurred during sign in. Please try again.")
      }
    }
  }, [urlError])

  const handleAuth0SignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn("auth0", {
        callbackUrl: callbackUrl || "/patient/dashboard",
        redirect: false,
      })

      if (result?.error) {
        setError("Failed to sign in with Auth0. Please try again.")
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Auth0 sign in error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn("azure-ad", {
        callbackUrl: callbackUrl || "/admin",
        redirect: false,
      })

      if (result?.error) {
        setError("Failed to sign in with Microsoft. Please try again.")
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Microsoft sign in error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Check if providers are configured
  const isAuth0Configured = process.env.NEXT_PUBLIC_AUTH0_CONFIGURED === "true"
  const isMicrosoftConfigured = process.env.NEXT_PUBLIC_MICROSOFT_CONFIGURED === "true"

  return (
    <div className="min-h-screen bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/inner-clarity-logo.png"
              alt="Inner Clarity"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to Inner Clarity</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Secure, HIPAA-compliant mental health services</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sign In Tabs */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your account type to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Patient</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patient" className="space-y-4 mt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Patient Portal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access your appointments, messages, and health records
                  </p>
                </div>

                {isAuth0Configured ? (
                  <Button
                    onClick={handleAuth0SignIn}
                    disabled={isLoading}
                    className="w-full bg-clarity-blue-600 hover:bg-clarity-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 3.433-2.043 4.568-1.258 1.24-2.956 1.875-4.525 1.875-1.569 0-3.267-.635-4.525-1.875C5.328 11.593 4.6 10.018 4.432 8.16c1.563 1.049 3.61 1.677 5.568 1.677s4.005-.628 5.568-1.677z" />
                        </svg>
                        Continue with Auth0
                      </>
                    )}
                  </Button>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Patient login is not configured. Please contact your administrator.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-clarity-blue-600 hover:text-clarity-blue-700 font-medium">
                      Register here
                    </Link>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Admin Portal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage clients, appointments, and practice operations
                  </p>
                </div>

                {isMicrosoftConfigured ? (
                  <Button
                    onClick={handleMicrosoftSignIn}
                    disabled={isLoading}
                    className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium py-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                        </svg>
                        Continue with Microsoft
                      </>
                    )}
                  </Button>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Admin login is not configured. Please contact your system administrator.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin access is restricted to authorized personnel only
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* HIPAA Notice */}
        <Card className="hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">HIPAA Compliant</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your privacy and security are protected under HIPAA regulations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-4 text-sm">
            <Link href="/privacy-policy" className="text-gray-600 hover:text-clarity-blue-600">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-600 hover:text-clarity-blue-600">
              Terms of Service
            </Link>
            <Link href="/hipaa-notice" className="text-gray-600 hover:text-clarity-blue-600">
              HIPAA Notice
            </Link>
          </div>
          <p className="text-xs text-gray-500">© 2024 Inner Clarity. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
