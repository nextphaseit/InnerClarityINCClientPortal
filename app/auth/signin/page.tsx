"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Users, AlertCircle, Info } from "lucide-react"

function SignInContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("patient")

  // Get error from URL params
  const urlError = searchParams?.get("error")
  const callbackUrl = searchParams?.get("callbackUrl") || "/"
  const tab = searchParams?.get("tab")

  // Check environment variables for provider configuration
  const isAuth0Configured = process.env.NEXT_PUBLIC_AUTH0_CONFIGURED === "true"
  const isMicrosoftConfigured = process.env.NEXT_PUBLIC_MICROSOFT_CONFIGURED === "true"

  useEffect(() => {
    if (tab === "admin") {
      setActiveTab("admin")
    } else if (tab === "patient") {
      setActiveTab("patient")
    }
  }, [tab])

  useEffect(() => {
    if (urlError) {
      console.error("❌ Auth error from URL:", urlError)
      switch (urlError) {
        case "Configuration":
          setError("Authentication service is not properly configured.")
          break
        case "AccessDenied":
          setError("Access denied. Please contact your administrator.")
          break
        case "Verification":
          setError("The verification token has expired or has already been used.")
          break
        case "OAuthSignin":
          setError("OAuth sign-in failed. Please try again.")
          break
        case "OAuthCallback":
          setError("OAuth callback error. Please try again.")
          break
        case "OAuthCreateAccount":
          setError("Could not create OAuth account. Please contact support.")
          break
        case "EmailCreateAccount":
          setError("Could not create account with that email address.")
          break
        case "Callback":
          setError("Callback URL error. Please try again.")
          break
        case "OAuthAccountNotLinked":
          setError("Account not linked. Please use the same sign-in method you used before.")
          break
        case "EmailSignin":
          setError("Email sign-in failed. Please check your email.")
          break
        case "CredentialsSignin":
          setError("Invalid email or password.")
          break
        case "SessionRequired":
          setError("Please sign in to access this page.")
          break
        default:
          setError("An error occurred during sign in. Please try again.")
      }
    }
  }, [urlError])

  const handleAuth0SignIn = async () => {
    if (!isAuth0Configured) {
      const errorMsg = "Auth0 is not configured. Please contact support."
      console.error("❌", errorMsg)
      setError(errorMsg)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log("🔑 Attempting Auth0 sign in")

      const result = await signIn("auth0", {
        callbackUrl: callbackUrl || "/dashboard",
        redirect: false,
      })

      if (result?.error) {
        console.error("❌ Auth0 sign in error:", result.error)
        setError(`Auth0 sign in failed: ${result.error}`)
      } else if (result?.url) {
        console.log("✅ Auth0 sign in successful, redirecting")
        window.location.href = result.url
      } else {
        // Check session and redirect manually
        const session = await getSession()
        if (session?.user) {
          const redirectUrl = session.user.role === "admin" ? "/admin" : "/dashboard"
          console.log(`✅ Auth0 sign in successful, redirecting to ${redirectUrl}`)
          router.push(redirectUrl)
        }
      }
    } catch (err) {
      console.error("❌ Auth0 sign in exception:", err)
      setError(`Auth0 sign in failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftSignIn = async () => {
    if (!isMicrosoftConfigured) {
      const errorMsg = "Microsoft login is not configured. Please contact support."
      console.error("❌", errorMsg)
      setError(errorMsg)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      console.log("🔑 Attempting Microsoft sign in")

      const result = await signIn("azure-ad", {
        callbackUrl: callbackUrl || "/admin",
        redirect: false,
      })

      if (result?.error) {
        console.error("❌ Microsoft sign in error:", result.error)
        setError(`Microsoft sign in failed: ${result.error}`)
      } else if (result?.url) {
        console.log("✅ Microsoft sign in successful, redirecting")
        window.location.href = result.url
      } else {
        // Check session and redirect manually
        const session = await getSession()
        if (session?.user) {
          const redirectUrl = session.user.role === "admin" ? "/admin" : "/dashboard"
          console.log(`✅ Microsoft sign in successful, redirecting to ${redirectUrl}`)
          router.push(redirectUrl)
        }
      }
    } catch (err) {
      console.error("❌ Microsoft sign in exception:", err)
      setError(`Microsoft sign in failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

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

        {/* Configuration Status */}
        {(!isAuth0Configured || !isMicrosoftConfigured) && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {!isAuth0Configured && "Auth0 is not configured. "}
              {!isMicrosoftConfigured && "Microsoft login is not configured. "}
              Please contact support for assistance.
            </AlertDescription>
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

                {/* Auth0 Login for Patients */}
                <Button
                  onClick={handleAuth0SignIn}
                  disabled={isLoading || !isAuth0Configured}
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
                      Sign in as Patient
                    </>
                  )}
                </Button>

                {/* Microsoft Login for Patients (via Auth0) */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    You can also sign in with Microsoft through Auth0
                  </p>
                </div>

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

                {/* Microsoft Login for Admins */}
                <Button
                  onClick={handleMicrosoftSignIn}
                  disabled={isLoading || !isMicrosoftConfigured}
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
                      Sign in with Microsoft
                    </>
                  )}
                </Button>

                {/* Auth0 Login for Admins (if they have admin domain) */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <Button
                  onClick={handleAuth0SignIn}
                  disabled={isLoading || !isAuth0Configured}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in with Auth0 (Admin Domain Required)"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin access is restricted to authorized personnel only
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Authorized domains: @innerclarity.org, @innerclarityinc.com, @nextphaseit.org
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
