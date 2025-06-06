"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { signIn, getSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Shield, AlertCircle, Users, Eye, EyeOff } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("patient")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Patient form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const callbackUrl = searchParams?.get("callbackUrl")
  const errorMsg = searchParams?.get("error")
  const tab = searchParams?.get("tab")

  useEffect(() => {
    // Set active tab from URL if provided
    if (tab === "admin" || tab === "patient") {
      setActiveTab(tab)
    }

    // Check if user is already authenticated
    const checkSession = async () => {
      try {
        // Check for admin session
        const adminSession = await getSession()
        if (adminSession?.user?.role === "admin") {
          router.push("/admin/dashboard")
          return
        }

        // Check for patient session
        const {
          data: { session: patientSession },
        } = await supabase.auth.getSession()
        if (patientSession) {
          router.push("/portal/dashboard")
          return
        }
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [router, tab])

  useEffect(() => {
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
    }
  }, [errorMsg])

  const handlePatientSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("🔑 Attempting patient sign-in with Supabase")

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        console.error("❌ Patient sign-in error:", signInError.message)

        switch (signInError.message) {
          case "Invalid login credentials":
            setError("Invalid email or password. Please check your credentials and try again.")
            break
          case "Email not confirmed":
            setError("Please verify your email address before signing in.")
            break
          default:
            setError(signInError.message || "Login failed. Please try again.")
        }
        return
      }

      if (data.user) {
        console.log("✅ Patient login successful:", data.user.email)
        router.push(callbackUrl || "/portal/dashboard")
      }
    } catch (error) {
      console.error("❌ Patient login exception:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🔑 Initiating Google admin login...")

      await signIn("google", {
        callbackUrl: callbackUrl || "/admin/dashboard",
        redirect: true,
      })

      // Note: The code below won't execute if redirect: true works properly
      console.log("⚠️ Redirect didn't happen automatically")
    } catch (err) {
      console.error("❌ Google sign-in exception:", err)
      setError("Google sign-in failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🔄 Attempting demo sign-in")

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: "demo@patient.com",
        password: "demo123",
      })

      if (signInError) {
        console.error("❌ Demo sign-in error:", signInError.message)
        setError("Demo sign-in failed. Please try manual sign-in.")
      } else if (data.user) {
        console.log("✅ Demo sign-in successful")
        router.push("/portal/dashboard")
      }
    } catch (error) {
      console.error("❌ Demo sign-in error:", error)
      setError("Demo sign-in failed. Please try manual sign-in.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Checking authentication status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your secure portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Sign In Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-6">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger
                  value="patient"
                  className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Patient Portal
                </TabsTrigger>
                <TabsTrigger value="admin" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Portal
                </TabsTrigger>
              </TabsList>

              {/* Patient Portal Tab */}
              <TabsContent value="patient" className="space-y-4 mt-2">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Patient Portal</h3>
                  <p className="text-sm text-gray-500">Access your health records and appointments</p>
                </div>

                <form onSubmit={handlePatientSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/reset-password" className="text-xs text-teal-600 hover:text-teal-700">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <Button onClick={handleDemoSignIn} disabled={isLoading} variant="outline" className="w-full">
                  Use Demo Account
                </Button>

                <div className="text-center text-sm">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                      Sign up
                    </Link>
                  </p>
                </div>
              </TabsContent>

              {/* Admin Portal Tab */}
              <TabsContent value="admin" className="space-y-4 mt-2">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Admin Portal</h3>
                  <p className="text-sm text-gray-500">Manage clients, appointments, and practice operations</p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4">
                  <p className="text-xs text-blue-700 text-center">
                    Authorized domains: @nextphaseit.org, @innerclaritycounseling.com, @innerclarity.org
                  </p>
                </div>

                <Button
                  onClick={handleAdminSignIn}
                  disabled={isLoading}
                  className="w-full bg-[#4285F4] hover:bg-[#3367D6] text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* HIPAA Notice */}
        <div className="bg-white border-l-4 border-l-teal-500 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm font-medium">HIPAA Compliant</p>
              <p className="text-xs text-gray-600">Your privacy and security are protected under HIPAA regulations</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center text-gray-500 text-xs leading-relaxed">
          <p className="font-medium mb-1">Need assistance?</p>
          <p>Phone: (984) 274-3723</p>
          <p>Email: support@innerclarityinc.com</p>
        </div>
      </div>
    </div>
  )
}
