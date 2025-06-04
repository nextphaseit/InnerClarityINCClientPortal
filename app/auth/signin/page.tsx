"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, Shield, AlertTriangle, Info } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("patient")

  // Check environment variables for provider configuration
  const isAuth0Configured = process.env.NEXT_PUBLIC_AUTH0_CONFIGURED === "true"
  const isMicrosoftConfigured = process.env.NEXT_PUBLIC_MICROSOFT_CONFIGURED === "true"
  const hasAnyProvider = isAuth0Configured || isMicrosoftConfigured

  // Get tab from URL params
  useEffect(() => {
    const tab = searchParams?.get("tab")
    if (tab === "admin" || tab === "patient") {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    // Check for error message in URL
    const errorMessage = searchParams?.get("error")
    if (errorMessage) {
      console.log("Auth error:", errorMessage)
      switch (errorMessage) {
        case "AccessDenied":
          setError("Access denied. Please check your credentials and try again.")
          break
        case "OAuthSignin":
          setError("OAuth sign-in failed. Please check your configuration.")
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
        case "Configuration":
          setError("Authentication service is not properly configured.")
          break
        default:
          setError("An error occurred during sign in. Please try again.")
      }
    }

    // Check for success message in URL
    const successMessage = searchParams?.get("message")
    if (successMessage) {
      setMessage(successMessage)
    }
  }, [searchParams])

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Attempting credentials login for:", email)

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("Credentials login result:", result)

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      if (result?.ok) {
        // Get the session to determine redirect
        const session = await getSession()
        console.log("Session after login:", session)

        if (session?.user?.role === "admin") {
          console.log("Redirecting admin to admin dashboard")
          router.push("/admin")
        } else {
          console.log("Redirecting patient to patient dashboard")
          router.push("/patient/dashboard")
        }
      }
    } catch (error) {
      console.error("Credentials sign in error:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleAuth0Login = async () => {
    if (!isAuth0Configured) {
      setError("Auth0 is not configured. Please contact support.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Attempting Auth0 login")

      await signIn("auth0", {
        callbackUrl: "/patient/dashboard",
        redirect: true,
      })
    } catch (error) {
      console.error("Auth0 login error:", error)
      setError("Auth0 login failed. Please try again or contact support.")
      setLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    if (!isMicrosoftConfigured) {
      setError("Microsoft login is not configured. Please contact support.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Attempting Microsoft login")

      await signIn("azure-ad", {
        callbackUrl: "/admin",
        redirect: true,
      })
    } catch (error) {
      console.error("Microsoft login error:", error)
      setError("Microsoft login failed. Please try again or contact support.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
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
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">Sign in to access your secure portal</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="bg-green-50 border-green-200">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}

          {/* No Providers Available Message */}
          {!hasAnyProvider && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                No authentication providers are currently enabled. Please contact support for assistance.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="patient" className="text-sm">
                Patient Portal
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-sm">
                Admin Portal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="space-y-4">
              {/* Auth0 Login Button - Only show if configured */}
              {isAuth0Configured && (
                <Button
                  onClick={handleAuth0Login}
                  className="w-full bg-clarity-blue-600 hover:bg-clarity-blue-700 text-white"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Connecting..." : "Sign in with Auth0"}
                </Button>
              )}

              {/* Show divider only if Auth0 is available */}
              {isAuth0Configured && (
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or use credentials</span>
                  </div>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="patient-email"
                      type="email"
                      placeholder="patient@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="patient-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-clarity-blue-600 hover:text-clarity-blue-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="patient-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading} size="lg">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              {/* Auth0 Not Configured Message */}
              {!isAuth0Configured && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    Auth0 login is not currently available. Please use your email and password to sign in.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              {/* Microsoft Login Button - Only show if configured */}
              {isMicrosoftConfigured && (
                <Button
                  onClick={handleMicrosoftLogin}
                  className="w-full bg-[#0078d4] hover:bg-[#006cbe] text-white"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Connecting..." : "Sign in with Microsoft"}
                </Button>
              )}

              {/* Show divider only if Microsoft is available */}
              {isMicrosoftConfigured && (
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or use credentials</span>
                  </div>
                </div>
              )}

              {/* Admin Credentials Form */}
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@innerclarity.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading} size="lg">
                  {loading ? "Signing in..." : "Admin Sign in"}
                </Button>
              </form>

              {/* Microsoft Not Configured Message */}
              {!isMicrosoftConfigured && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    Microsoft login is not currently available. Please use your admin credentials to sign in.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Admin Access Requirements:</p>
                <p className="mt-1 text-xs">
                  Authorized domains: @innerclarity.org, @innerclarityinc.com, @nextphaseit.org
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-clarity-blue-600 hover:text-clarity-blue-700 font-medium">
                Create account
              </Link>
            </p>
          </div>

          {/* Demo Credentials - Only show if no providers are configured */}
          {!hasAnyProvider && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs font-medium text-yellow-800 mb-1">Demo Credentials:</p>
              <p className="text-xs text-yellow-700">
                Patient: patient@example.com / patient123
                <br />
                Admin: admin@innerclarity.org / admin123
              </p>
            </div>
          )}

          {/* HIPAA Notice */}
          <div className="mt-4 p-3 bg-clarity-blue-50 rounded-lg border border-clarity-blue-200">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-clarity-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-clarity-blue-800">HIPAA Secure Login</p>
                <p className="text-xs text-clarity-blue-700 mt-1">
                  Your personal health information is protected by HIPAA regulations. All data is encrypted and stored
                  securely.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-4 text-center text-gray-500 text-xs leading-relaxed">
            <p className="font-medium mb-1">Need assistance?</p>
            <p>Phone: (984) 274-3723</p>
            <p>Email: support@innerclarityinc.com</p>
            <p>Address: 508 River Dell Townes Ave, Clayton, NC</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
