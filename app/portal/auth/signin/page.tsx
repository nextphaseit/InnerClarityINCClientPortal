"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, ExternalLink, AlertCircle, Heart } from "lucide-react"
import Link from "next/link"
import { usePatientAuth } from "@/components/patient-auth-provider"

export default function PatientSignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPatientDomain, setIsPatientDomain] = useState(false)
  const [isCheckingDomain, setIsCheckingDomain] = useState(true)
  const router = useRouter()
  const { signIn } = usePatientAuth()

  useEffect(() => {
    // Check if we're on the patient domain
    const hostname = window.location.hostname
    const isPatient =
      hostname.includes("patients.nextphaseit.org") ||
      (hostname.includes("localhost") && window.location.pathname.startsWith("/portal"))

    setIsPatientDomain(isPatient)
    setIsCheckingDomain(false)

    if (!isPatient && hostname.includes("admin")) {
      // Redirect to admin portal if on admin domain
      console.log("🔄 On admin domain, redirecting to admin portal")
      window.location.href = "https://admin.nextphaseit.org/admin/login"
      return
    }
  }, [])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("🔄 Attempting patient sign-in with Supabase")

      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        console.error("❌ Patient sign-in error:", signInError.message)
        setError(signInError.message)
      } else {
        console.log("✅ Patient sign-in successful")
        router.push("/portal")
      }
    } catch (error) {
      console.error("❌ Unexpected sign-in error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🔄 Attempting demo sign-in")

      const { error: signInError } = await signIn("demo@patient.com", "demo123")

      if (signInError) {
        console.error("❌ Demo sign-in error:", signInError.message)
        setError("Demo sign-in failed. Please try manual sign-in.")
      } else {
        console.log("✅ Demo sign-in successful")
        router.push("/portal")
      }
    } catch (error) {
      console.error("❌ Demo sign-in error:", error)
      setError("Demo sign-in failed. Please try manual sign-in.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking domain
  if (isCheckingDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-teal-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
            <p className="text-center text-slate-600">Verifying domain access...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show redirect message if on admin domain
  if (!isPatientDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-teal-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <ExternalLink className="h-8 w-8 text-green-600 mb-4" />
            <p className="text-center text-slate-600 mb-4">Redirecting to admin portal...</p>
            <Button
              onClick={() => (window.location.href = "https://admin.nextphaseit.org/admin/login")}
              variant="outline"
              className="w-full"
            >
              Continue to Admin Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-teal-100 px-4">
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-800">Patient Portal</CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to access your health records and appointments
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-medium">Quick Access</span>
            </div>
          </div>

          <Button
            onClick={handleDemoSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
            size="lg"
          >
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
              Use Demo Account
            </div>
          </Button>
          <p className="text-xs text-slate-500 text-center">Demo: demo@patient.com / demo123</p>

          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/portal/auth/signup" className="text-green-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-slate-600">
                <Link href="/portal/auth/reset-password" className="text-green-600 hover:underline font-medium">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="text-center space-y-3">
              <p className="text-xs text-slate-500">Need admin portal access?</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://admin.nextphaseit.org", "_blank")}
                className="text-xs border-slate-300 hover:bg-slate-50"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Go to Admin Portal
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              Need help? Contact{" "}
              <a href="mailto:support@innerclarity.org" className="text-green-600 hover:underline font-medium">
                support@innerclarity.org
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
