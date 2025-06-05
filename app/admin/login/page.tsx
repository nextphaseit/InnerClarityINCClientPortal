"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    const session = await getSession()
    if (session?.user) {
      router.push("/admin/dashboard")
    }
  }

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await signIn("azure-ad", {
        callbackUrl: "/admin/dashboard",
        redirect: false,
      })

      if (result?.error) {
        setError(
          result.error === "AccessDenied"
            ? "Access denied. Your email domain is not authorized for admin access."
            : `Sign in failed: ${result.error}`,
        )
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              NextPhase IT Admin
            </CardTitle>
            <CardDescription className="text-slate-600">
              Sign in with your Microsoft work account to access the admin portal
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

          <Button
            onClick={handleMicrosoftSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg transition-all duration-200"
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
              <div>• @innerclarity.org</div>
              <div>• @innerclarityinc.com</div>
              <div>• @nextphaseit.org</div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              Need help? Contact{" "}
              <a href="mailto:support@nextphaseit.org" className="text-blue-600 hover:underline font-medium">
                support@nextphaseit.org
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
