"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle, Users, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { signIn } from "next-auth/react"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("patient")

  const callbackUrl = searchParams?.get("callbackUrl") || "/"
  const urlError = searchParams?.get("error")
  const tab = searchParams?.get("tab")
  const message = searchParams?.get("message")

  useEffect(() => {
    if (tab === "admin" || tab === "patient") {
      setActiveTab(tab)
    }
  }, [tab])

  useEffect(() => {
    if (urlError) {
      console.error("❌ Auth error from URL:", urlError)
      setError("Authentication failed. Please try again.")
    }

    if (message) {
      // This could be a success message from registration
      console.log("ℹ️ Message from URL:", message)
    }
  }, [urlError, message])

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🔑 Attempting Supabase patient login for:", email)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        console.error("❌ Supabase sign-in error:", signInError)

        // Handle specific Supabase errors
        switch (signInError.message) {
          case "Invalid login credentials":
            setError("Invalid email or password. Please check your credentials and try again.")
            break
          case "Email not confirmed":
            setError("Please verify your email address before signing in. Check your inbox for a verification link.")
            break
          case "Too many requests":
            setError("Too many login attempts. Please wait a moment before trying again.")
            break
          default:
            setError(signInError.message || "Login failed. Please try again.")
        }
        return
      }

      if (data.user) {
        console.log("✅ Patient login successful:", data.user.email)
        router.push("/portal/dashboard")
      }
    } catch (error) {
      console.error("❌ Patient login exception:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔑 Initiating Microsoft admin login...")

      const result = await signIn("azure-ad", {
        callbackUrl: "/admin/dashboard",
        redirect: false,
      })

      if (result?.error) {
        console.error("❌ Microsoft sign-in error:", result.error)
        setError("Microsoft sign-in failed. Please try again or contact support.")
        return
      }

      if (result?.ok) {
        console.log("✅ Microsoft sign-in successful")
        router.push("/admin/dashboard")
      }
    } catch (err) {
      console.error("❌ Microsoft sign-in exception:", err)
      setError("Microsoft sign-in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
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

        {/* Success Message */}
        {message && (
          <Alert className="bg-green-50 border-green-200">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sign In Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your portal to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Patient Portal</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin Portal</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patient" className="space-y-4 mt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Patient Portal</h3>
                  <p className="text-sm text-gray-600">Access your appointments, messages, and health records</p>
                </div>

                <form onSubmit={handlePatientLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="patient-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="patient-password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link href="/auth/reset-password" className="text-xs text-teal-600 hover:text-teal-700">
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
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 bg-teal-600 hover:bg-teal-700" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Admin Portal</h3>
                  <p className="text-sm text-gray-600">Manage clients, appointments, and practice operations</p>
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Authorized domains: @innerclarity.org, @innerclarityinc.com, @nextphaseit.org
                  </div>
                </div>

                <Button
                  onClick={handleAdminLogin}
                  disabled={loading}
                  className="w-full h-12 bg-[#0078d4] hover:bg-[#106ebe] text-white"
                >
                  {loading ? (
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
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <div>
                <p className="text-sm font-medium">HIPAA Compliant</p>
                <p className="text-xs text-gray-600">Your privacy and security are protected under HIPAA regulations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="text-center text-gray-500 text-xs leading-relaxed">
          <p className="font-medium mb-1">Need assistance?</p>
          <p>Phone: (984) 274-3723</p>
          <p>Email: support@innerclarityinc.com</p>
          <p>Address: 508 River Dell Townes Ave, Clayton, NC</p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
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
