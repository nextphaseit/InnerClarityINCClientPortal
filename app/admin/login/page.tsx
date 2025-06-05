"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle, ExternalLink, Building2 } from "lucide-react"

function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdminDomain, setIsAdminDomain] = useState(false)
  const [isCheckingDomain, setIsCheckingDomain] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we're on the admin domain
    const hostname = window.location.hostname
    const isAdmin =
      hostname.includes("admin.nextphaseit.org") ||
      (hostname.includes("localhost") && window.location.pathname.startsWith("/admin"))

    setIsAdminDomain(isAdmin)
    setIsCheckingDomain(false)

    if (!isAdmin && !hostname.includes("localhost")) {
      // Redirect to patient portal if not on admin domain
      console.log("🔄 Not on admin domain, redirecting to patient portal")
      window.location.href = "https://patients.nextphaseit.org/portal/auth/signin"
      return
    }

    // Check for error parameters
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "authentication_required":
          setError("Please sign in to access the admin portal.")
          break
        case "microsoft_required":
          setError("Admin access requires Microsoft authentication.")
          break
        case "configuration_error":
          setError("Authentication configuration error. Please contact support.")
          break
        case "AccessDenied":
          setError("Access denied. Your email domain is not authorized for admin access.")
          break
        case "Signin":
          setError("Sign in failed. Please try again.")
          break
        case "OAuthAccountNotLinked":
          setError("This Microsoft account is not linked to an admin account.")
          break
        default:
          setError("An authentication error occurred. Please try again.")
      }
    }

    // Check if already authenticated
    if (isAdmin) {
      checkExistingSession()
    }
  }, [searchParams])

  const checkExistingSession = async () => {
    try {
      const session = await getSession()
      if (session?.user?.role === "admin") {
        console.log("✅ Admin already authenticated, redirecting to dashboard")
        router.push("/admin/dashboard")
      }
    } catch (error) {
      console.error("Error checking session:", error)
    }
  }

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("🔄 Initiating Microsoft sign-in for admin")

      const result = await signIn("azure-ad", {
        callbackUrl: "/admin/dashboard",
        redirect: false,
      })

      if (result?.error) {
        console.error("❌ Sign-in error:", result.error)

        switch (result.error) {
          case "AccessDenied":
            setError("Access denied. Your email domain is not authorized for admin access.")
            break
          case "Signin":
            setError("Sign in failed. Please check your credentials and try again.")
            break
          case "OAuthAccountNotLinked":
            setError("This Microsoft account is not linked to an admin account.")
            break
          default:
            setError(`Sign in failed: ${result.error}`)
        }
      } else if (result?.url) {
        console.log("✅ Sign-in successful, redirecting to:", result.url)
        router.push(result.url)
      }
    } catch (error) {
      console.error("❌ Unexpected sign-in error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking domain
  if (isCheckingDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-center text-slate-600">Verifying domain access...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show redirect message if not on admin domain
  if (!isAdminDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <ExternalLink className="h-8 w-8 text-blue-600 mb-4" />
            <p className="text-center text-slate-600 mb-4">Redirecting to patient portal...</p>
            <Button
              onClick={() => (window.location.href = "https://patients.nextphaseit.org/portal/auth/signin")}
              variant="outline"
              className="w-full"
            >
              Continue to Patient Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-800">Inner Clarity Admin</CardTitle>
            <CardDescription className="text-slate-600">
              Sign in with your Microsoft work account to access the admin dashboard
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

          <div className="space-y-4">
            <Button
              onClick={handleMicrosoftSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Sign in with Microsoft
                </>
              )}
            </Button>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium text-slate-700 text-center">Authorized Email Domains</p>
              <div className="text-xs text-slate-600 space-y-1 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>@innerclarity.org</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>@innerclarityinc.com</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>@nextphaseit.org</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="text-center space-y-3">
                <p className="text-xs text-slate-500">Need patient portal access?</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open("https://patients.nextphaseit.org", "_blank")}
                  className="text-xs border-slate-300 hover:bg-slate-50"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Go to Patient Portal
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-center text-slate-500">
                Need help? Contact{" "}
                <a href="mailto:support@innerclarity.org" className="text-blue-600 hover:underline font-medium">
                  support@innerclarity.org
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
