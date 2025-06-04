"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Shield, Users, CheckCircle, XCircle, Info } from "lucide-react"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("admin")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const callbackUrl = searchParams?.get("callbackUrl") || "/"
  const urlError = searchParams?.get("error")
  const tab = searchParams?.get("tab")

  // Environment status check
  const [envStatus, setEnvStatus] = useState<{
    microsoft: boolean
    auth0: boolean
    nextauth: boolean
  }>({ microsoft: false, auth0: false, nextauth: false })

  useEffect(() => {
    // Check environment configuration
    const checkEnvStatus = async () => {
      try {
        const response = await fetch("/api/auth/config")
        if (response.ok) {
          const data = await response.json()
          setEnvStatus(data.providers || { microsoft: false, auth0: false, nextauth: false })
        }
      } catch (err) {
        console.error("Failed to check environment status:", err)
      }
    }

    checkEnvStatus()
  }, [])

  useEffect(() => {
    if (tab === "admin" || tab === "patient") {
      setActiveTab(tab)
    }
  }, [tab])

  useEffect(() => {
    if (urlError) {
      console.error("❌ Auth error from URL:", urlError)

      const errorMessages: Record<string, string> = {
        Configuration: "Authentication service is not properly configured. Please contact support.",
        AccessDenied: "Access denied. Your domain may not be authorized for this application.",
        Verification: "The verification token has expired or has already been used.",
        OAuthSignin: "OAuth sign-in failed. Please try again.",
        OAuthCallback: "OAuth callback error. This may be due to configuration issues.",
        OAuthCreateAccount: "Could not create OAuth account. Please contact support.",
        EmailCreateAccount: "Could not create account with that email address.",
        Callback: "Callback URL error. Please check your configuration.",
        OAuthAccountNotLinked: "Account not linked. Please use the same sign-in method you used before.",
        EmailSignin: "Email sign-in failed. Please check your email.",
        CredentialsSignin: "Invalid credentials provided.",
        SessionRequired: "Please sign in to access this page.",
        Default: "An unexpected error occurred during authentication.",
      }

      setError(errorMessages[urlError] || errorMessages.Default)

      // Set debug info for development
      if (process.env.NODE_ENV === "development") {
        setDebugInfo({
          errorCode: urlError,
          timestamp: new Date().toISOString(),
          callbackUrl,
          userAgent: navigator.userAgent,
        })
      }
    }
  }, [urlError, callbackUrl])

  const handleMicrosoftSignIn = async () => {
    if (!envStatus.microsoft) {
      setError("Microsoft authentication is not configured. Please contact support.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("🔑 Initiating Microsoft sign-in...")

      const result = await signIn("azure-ad", {
        callbackUrl: callbackUrl || "/admin",
        redirect: false,
      })

      console.log("Microsoft sign-in result:", result)

      if (result?.error) {
        console.error("❌ Microsoft sign-in error:", result.error)

        const errorMessages: Record<string, string> = {
          AccessDenied: "Access denied. Your Microsoft account domain may not be authorized.",
          OAuthSignin: "Microsoft sign-in failed. Please try again.",
          OAuthCallback: "Microsoft callback error. Please check your configuration.",
          Configuration: "Microsoft authentication is not properly configured.",
          Default: "Microsoft sign-in failed. Please try again.",
        }

        setError(errorMessages[result.error] || errorMessages.Default)
        return
      }

      if (result?.ok) {
        console.log("✅ Microsoft sign-in successful")

        // Wait for session to be established
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const session = await getSession()
        console.log("Session after Microsoft login:", session)

        if (session?.user) {
          const redirectUrl = session.user.role === "admin" ? "/admin" : "/dashboard"
          console.log(`Redirecting to: ${redirectUrl}`)
          router.push(redirectUrl)
        } else {
          console.log("No session found, redirecting to callback URL")
          router.push(callbackUrl)
        }
      }
    } catch (err) {
      console.error("❌ Microsoft sign-in exception:", err)
      setError(`Microsoft sign-in failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth0SignIn = async () => {
    if (!envStatus.auth0) {
      setError("Auth0 authentication is not configured. Please contact support.")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("🔑 Initiating Auth0 sign-in...")

      const result = await signIn("auth0", {
        callbackUrl: callbackUrl || "/dashboard",
        redirect: false,
      })

      console.log("Auth0 sign-in result:", result)

      if (result?.error) {
        console.error("❌ Auth0 sign-in error:", result.error)
        setError(`Auth0 sign-in failed: ${result.error}`)
        return
      }

      if (result?.ok) {
        console.log("✅ Auth0 sign-in successful")

        // Wait for session to be established
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const session = await getSession()
        console.log("Session after Auth0 login:", session)

        if (session?.user) {
          const redirectUrl = session.user.role === "admin" ? "/admin" : "/dashboard"
          console.log(`Redirecting to: ${redirectUrl}`)
          router.push(redirectUrl)
        } else {
          console.log("No session found, redirecting to callback URL")
          router.push(callbackUrl)
        }
      }
    } catch (err) {
      console.error("❌ Auth0 sign-in exception:", err)
      setError(`Auth0 sign-in failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
    setDebugInfo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inner Clarity</h1>
          <p className="text-gray-600 dark:text-gray-400">Secure Mental Health Portal</p>
        </div>

        {/* Environment Status */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Authentication Status</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  {envStatus.microsoft ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>Microsoft</span>
                </div>
                <div className="flex items-center space-x-1">
                  {envStatus.auth0 ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>Auth0</span>
                </div>
                <div className="flex items-center space-x-1">
                  {envStatus.nextauth ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>NextAuth</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-start">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError} className="h-auto p-1 ml-2">
                <XCircle className="h-3 w-3" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Debug Info (Development Only) */}
        {debugInfo && process.env.NODE_ENV === "development" && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Debug Information</summary>
                <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
              </details>
            </AlertDescription>
          </Alert>
        )}

        {/* Sign In Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your account type to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </TabsTrigger>
                <TabsTrigger value="patient" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Patient</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Admin Portal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage clients, appointments, and practice operations
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Authorized domains only
                  </Badge>
                </div>

                <Button
                  onClick={handleMicrosoftSignIn}
                  disabled={isLoading || !envStatus.microsoft}
                  className="w-full h-12 bg-[#0078d4] hover:bg-[#106ebe] text-white"
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
                      Sign in with Microsoft
                    </>
                  )}
                </Button>

                <div className="text-center text-xs text-gray-500 space-y-1">
                  <p>Authorized domains:</p>
                  <p>@innerclarity.org • @innerclarityinc.com • @nextphaseit.org</p>
                </div>
              </TabsContent>

              <TabsContent value="patient" className="space-y-4 mt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Patient Portal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Access your appointments, messages, and health records
                  </p>
                </div>

                {envStatus.auth0 ? (
                  <Button
                    onClick={handleAuth0SignIn}
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
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
                        Sign in with Auth0
                      </>
                    )}
                  </Button>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>Auth0 authentication is not configured. Please contact support.</AlertDescription>
                  </Alert>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <Button
                  onClick={handleMicrosoftSignIn}
                  disabled={isLoading || !envStatus.microsoft}
                  variant="outline"
                  className="w-full h-12"
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
                      Sign in with Microsoft
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* HIPAA Notice */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">HIPAA Compliant</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your privacy and security are protected under HIPAA regulations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-gray-600">Loading authentication...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
