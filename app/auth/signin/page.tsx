"use client"
import { useState, useEffect } from "react"
import type React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle, Users, Loader2 } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("patient")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Patient form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const tab = searchParams?.get("tab")
  const callbackUrl = searchParams?.get("callbackUrl")
  const message = searchParams?.get("message")
  const errorMsg = searchParams?.get("error")

  useEffect(() => {
    if (tab === "admin" || tab === "patient") {
      setActiveTab(tab)
    }
  }, [tab])

  useEffect(() => {
    if (message) {
      console.log("ℹ️ Message from URL:", message)
    }

    if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
    }
  }, [message, errorMsg])

  const handlePatientSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🔑 Attempting Supabase patient sign-in for:", email)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        console.error("❌ Supabase sign-in error:", signInError)

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

        // Redirect to callback URL or default dashboard
        const redirectUrl = callbackUrl || "/portal/dashboard"

        // Clean up the callback URL if it's from the preview environment
        const cleanUrl = redirectUrl.includes("lite.vusercontent.net") ? "/portal/dashboard" : redirectUrl

        router.push(cleanUrl)
      }
    } catch (error) {
      console.error("❌ Patient login exception:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSignIn = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔑 Initiating Microsoft admin login...")
      console.log("📍 Callback URL:", callbackUrl || "/admin/dashboard")

      // Use the callbackUrl if provided, otherwise default to admin dashboard
      const redirectUrl = callbackUrl || "/admin/dashboard"

      await signIn("azure-ad", {
        callbackUrl: redirectUrl,
        redirect: true,
      })

      // Note: The code below won't execute if redirect: true works properly
      console.log("⚠️ Redirect didn't happen automatically")
    } catch (err) {
      console.error("❌ Microsoft sign-in exception:", err)
      setError("Microsoft sign-in failed. Please try again.")
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-green-600 mr-2" />
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Sign In Card */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold">Sign In</h2>
              <p className="text-gray-600 text-sm">Choose your portal to continue</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab("patient")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "patient" ? "bg-white text-teal-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Patient Portal</span>
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "admin" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin Portal</span>
              </button>
            </div>

            {/* Patient Portal Tab */}
            {activeTab === "patient" && (
              <div className="space-y-4">
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-lg font-semibold">Patient Portal</h3>
                  <p className="text-sm text-gray-600">Access your appointments, messages, and health records</p>
                </div>

                <form onSubmit={handlePatientSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="patient-email" className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        id="patient-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="patient-password" className="text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <Link href="/auth/reset-password" className="text-xs text-teal-600 hover:text-teal-700">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        id="patient-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Admin Portal Tab */}
            {activeTab === "admin" && (
              <div className="space-y-4">
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-lg font-semibold">Admin Portal</h3>
                  <p className="text-sm text-gray-600">Manage clients, appointments, and practice operations</p>
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Authorized domains: @innerclarity.org, @innerclarityinc.com, @nextphaseit.org
                  </div>
                </div>

                <button
                  onClick={handleAdminSignIn}
                  disabled={loading}
                  className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                      </svg>
                      Sign in with Microsoft
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

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
          <p>Address: 508 River Dell Townes Ave, Clayton, NC</p>
        </div>
      </div>
    </div>
  )
}
