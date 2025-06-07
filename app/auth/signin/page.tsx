"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle, Eye, EyeOff, TestTube } from "lucide-react"

export default function AdminSignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })

  const callbackUrl = searchParams?.get("callbackUrl") || "/admin/dashboard"
  const errorParam = searchParams?.get("error")

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session && session.user?.role === "admin") {
        console.log("✅ Existing admin session found, redirecting to dashboard")
        router.push("/admin/dashboard")
      }
    }
    checkSession()
  }, [router])

  useEffect(() => {
    if (errorParam) {
      console.error("❌ Auth error:", errorParam)
      switch (errorParam) {
        case "CredentialsSignin":
          setError("Invalid email or password. Please try again.")
          break
        case "OAuthSignin":
          setError("Error occurred during Google sign-in. Please try again.")
          break
        case "OAuthCallback":
          setError("Error occurred during authentication callback.")
          break
        case "AccessDenied":
          setError(
            "Access denied. Please use an authorized email address from nextphaseit.org or other authorized domains.",
          )
          break
        case "Configuration":
          setError("Authentication configuration error. Please contact support.")
          break
        default:
          setError("An authentication error occurred. Please try again.")
      }
    }
  }, [errorParam])

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("🔑 Attempting credentials login for:", credentials.email)

      const result = await signIn("admin-credentials", {
        email: credentials.email,
        password: credentials.password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        console.error("❌ Credentials sign-in error:", result.error)
        setError("Invalid email or password. Please check your credentials.")
      } else if (result?.url) {
        console.log("✅ Credentials login successful, redirecting to:", result.url)
        window.location.href = result.url
      }
    } catch (err) {
      console.error("❌ Credentials sign-in exception:", err)
      setError("An unexpected error occurred during login.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      setError(null)

      console.log("🔑 Initiating Google admin login...")

      const result = await signIn("google", {
        callbackUrl,
        redirect: true,
      })

      if (result?.error) {
        console.error("❌ Google sign-in error:", result.error)
        setError("Google sign-in failed. Please try again.")
        setGoogleLoading(false)
      }
    } catch (err) {
      console.error("❌ Google sign-in exception:", err)
      setError("Google sign-in failed. Please try again.")
      setGoogleLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setCredentials({
      email: "admin@nextphaseit.org",
      password: "Admin123!",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-800">Admin Portal</CardTitle>
              <CardDescription className="text-slate-600">
                Sign in to manage clients, appointments, and practice operations
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

            {/* Google Sign In Button - Primary */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm"
              size="lg"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in with Google...
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
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with credentials</span>
              </div>
            </div>

            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@nextphaseit.org"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || googleLoading}
                variant="outline"
                className="w-full h-12"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Sign In with Credentials
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg text-amber-800">Demo Credentials</CardTitle>
            </div>
            <CardDescription className="text-amber-700">Use these credentials to test the admin portal</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-sm text-amber-700 bg-amber-100 p-3 rounded-lg">
              <div className="font-medium mb-2">Available Demo Accounts:</div>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Super Admin:</strong>
                  <br />
                  Email: admin@nextphaseit.org
                  <br />
                  Password: Admin123!
                </div>
                <div>
                  <strong>Demo Admin:</strong>
                  <br />
                  Email: demo@admin.nextphaseit.org
                  <br />
                  Password: DemoAdmin123!
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={fillDemoCredentials}
              className="w-full border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Fill Demo Credentials
            </Button>
          </CardContent>
        </Card>

        <div className="text-center space-y-3">
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Authorized Domains for Google Sign-In</p>
            <p>@nextphaseit.org • @innerclaritycounseling.com</p>
            <p>@innerclarity.org • @innerclarityinc.com • @gmail.com</p>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-slate-600">
            Need patient portal access?{" "}
            <a href="/portal/auth/signin" className="text-blue-600 hover:underline font-medium">
              Patient Portal
            </a>
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            Need help? Contact{" "}
            <a href="mailto:support@nextphaseit.org" className="text-blue-600 hover:underline font-medium">
              support@nextphaseit.org
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
