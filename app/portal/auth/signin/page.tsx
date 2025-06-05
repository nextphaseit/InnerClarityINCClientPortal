"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, ExternalLink, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePatientAuth } from "@/hooks/use-patient-auth"

export default function PatientSignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPatientDomain, setIsPatientDomain] = useState(false)
  const router = useRouter()
  const { signIn } = usePatientAuth()

  useEffect(() => {
    // Check if we're on the patient domain
    const hostname = window.location.hostname
    const isPatient = hostname.includes("patients") || hostname.includes("localhost")
    setIsPatientDomain(isPatient)

    if (!isPatient && hostname.includes("admin")) {
      // Redirect to admin portal if on admin domain
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

      console.log("🔄 Attempting patient sign-in with email")

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

  const handleAuth0SignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🔄 Redirecting to Auth0 for patient authentication")

      // Redirect to Auth0 (you'll need to implement this based on your Auth0 setup)
      const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
      const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
      const redirectUri = encodeURIComponent(`${window.location.origin}/portal/auth/callback`)

      if (auth0Domain && clientId) {
        window.location.href = `https://${auth0Domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email`
      } else {
        setError("Auth0 is not configured. Please use email sign-in.")
      }
    } catch (error) {
      console.error("❌ Auth0 redirect error:", error)
      setError("Failed to redirect to Auth0. Please try email sign-in.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking domain
  if (!isPatientDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-center text-gray-600">Checking domain...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/inner-clarity-logo.png"
              alt="Inner Clarity Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Patient Portal</CardTitle>
          <CardDescription>Sign in to access your health records and appointments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button onClick={handleAuth0SignIn} disabled={isLoading} variant="outline" className="w-full h-12" size="lg">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 7.568l-5.568 5.568-3.568-3.568 1.414-1.414L12 10.308l4.154-4.154 1.414 1.414z"
              />
            </svg>
            Sign in with Auth0
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/portal/auth/signup" className="text-green-600 hover:underline">
                Sign up
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/portal/auth/reset-password" className="text-green-600 hover:underline">
                Forgot your password?
              </Link>
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">Admin Portal Access:</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://admin.nextphaseit.org", "_blank")}
                className="text-xs"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                Go to Admin Portal
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-center text-gray-500">
              Need help? Contact{" "}
              <a href="mailto:support@innerclarity.org" className="text-green-600 hover:underline">
                support@innerclarity.org
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
