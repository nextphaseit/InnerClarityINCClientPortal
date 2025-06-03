"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Lock, Eye } from "lucide-react"

export default function SignInPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const authError = searchParams.get("error")

  useEffect(() => {
    if (authError) {
      setError("Authentication failed. Please try again.")
    }
  }, [authError])

  const handleSignIn = async (provider: string) => {
    try {
      setLoading(provider)
      setError(null)

      const result = await signIn(provider, {
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError("Authentication failed. Please try again.")
      } else if (result?.ok) {
        // Get the session to determine user role and redirect accordingly
        const session = await getSession()
        if (session?.user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src="/images/inner-clarity-logo.png"
              alt="Inner Clarity"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to Inner Clarity</CardTitle>
            <CardDescription className="text-base mt-2">
              Secure mental health portal for clients and providers
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button
              onClick={() => handleSignIn("auth0")}
              disabled={loading !== null}
              className="w-full h-12 text-base"
              size="lg"
            >
              {loading === "auth0" ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Shield className="mr-2 h-5 w-5" />
              )}
              Sign in with Auth0
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              onClick={() => handleSignIn("azure-ad")}
              disabled={loading !== null}
              variant="outline"
              className="w-full h-12 text-base"
              size="lg"
            >
              {loading === "azure-ad" ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Lock className="mr-2 h-5 w-5" />
              )}
              Sign in with Microsoft
            </Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>HIPAA Compliant & Secure</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <Lock className="h-6 w-6 mx-auto text-clarity-blue-500" />
                <p className="text-xs text-muted-foreground">End-to-End Encryption</p>
              </div>
              <div className="space-y-1">
                <Shield className="h-6 w-6 mx-auto text-clarity-green-500" />
                <p className="text-xs text-muted-foreground">HIPAA Compliant</p>
              </div>
              <div className="space-y-1">
                <Eye className="h-6 w-6 mx-auto text-clarity-blue-500" />
                <p className="text-xs text-muted-foreground">Audit Trail</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
