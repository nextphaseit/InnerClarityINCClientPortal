"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = searchParams?.get("callbackUrl") || "/admin/dashboard"
  const errorParam = searchParams?.get("error")

  useEffect(() => {
    // Check if user is already authenticated
    const checkSession = async () => {
      const session = await getSession()
      if (session && session.user?.role === "admin") {
        router.push("/admin/dashboard")
      }
    }
    checkSession()
  }, [router])

  useEffect(() => {
    if (errorParam) {
      switch (errorParam) {
        case "OAuthSignin":
          setError("Error occurred during sign-in. Please try again.")
          break
        case "OAuthCallback":
          setError("Error occurred during authentication callback.")
          break
        case "AccessDenied":
          setError("Access denied. Please use an authorized email address.")
          break
        case "Configuration":
          setError("Authentication configuration error. Please contact support.")
          break
        default:
          setError("An authentication error occurred. Please try again.")
      }
    }
  }, [errorParam])

  const handleSignIn = async (provider: "google" | "auth0") => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔑 Initiating ${provider} admin login...`)

      const result = await signIn(provider, {
        callbackUrl,
        redirect: true,
      })

      if (result?.error) {
        console.error(`❌ ${provider} sign-in error:`, result.error)
        setError(`${provider} sign-in failed. Please try again.`)
        setLoading(false)
      }
    } catch (err) {
      console.error(`❌ ${provider} sign-in exception:`, err)
      setError(`${provider} sign-in failed. Please try again.`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95">
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

          <div className="space-y-3">
            {/* Google Sign-In Button */}
            <Button
              onClick={() => handleSignIn("google")}
              disabled={loading}
              className="w-full h-12 bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              size="lg"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
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
              )}
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>

            {/* Auth0 Sign-In Button */}
            <Button
              onClick={() => handleSignIn("auth0")}
              disabled={loading}
              variant="outline"
              className="w-full h-12 border-slate-300 hover:bg-slate-50"
              size="lg"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.98 7.448L19.62 0H4.347L2.02 7.448c-1.352 4.312.03 9.206 3.815 12.015L12.007 24l6.157-4.537c3.785-2.809 5.167-7.703 3.815-12.015z" />
                </svg>
              )}
              {loading ? "Signing in..." : "Sign in with Auth0"}
            </Button>
          </div>

          <div className="text-center space-y-3 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Authorized Domains</p>
              <p>@nextphaseit.org • @innerclaritycounseling.com</p>
              <p>@innerclarity.org • @innerclarityinc.com</p>
            </div>
          </div>

          <div className="text-center space-y-2 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Need patient portal access?{" "}
              <a href="/portal/auth/signin" className="text-blue-600 hover:underline font-medium">
                Patient Portal
              </a>
            </p>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              Need help? Contact{" "}
              <a href="mailto:support@innerclarityinc.com" className="text-blue-600 hover:underline font-medium">
                support@innerclarityinc.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
