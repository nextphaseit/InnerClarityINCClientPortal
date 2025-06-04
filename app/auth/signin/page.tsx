"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("patient")

  // Get callbackUrl from query parameters
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"

  useEffect(() => {
    // Check for error message in URL
    const errorMessage = searchParams?.get("error")
    if (errorMessage) {
      switch (errorMessage) {
        case "AccessDenied":
          setError("You don't have permission to access that page.")
          break
        case "MicrosoftLoginRequired":
          setError("Admin access requires Microsoft login.")
          break
        case "CredentialsSignin":
          setError("Invalid email or password.")
          break
        default:
          setError("An error occurred during sign in.")
      }
    }

    // Check for success message in URL
    const successMessage = searchParams?.get("message")
    if (successMessage) {
      setMessage(successMessage)
    }
  }, [searchParams])

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      // Redirect based on user role (handled by middleware)
      router.push(callbackUrl)
    } catch (error) {
      setError("An unexpected error occurred")
      console.error("Sign in error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuth0Login = async () => {
    setLoading(true)
    await signIn("auth0", { callbackUrl })
  }

  const handleMicrosoftLogin = async () => {
    setLoading(true)
    await signIn("azure-ad", { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
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
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">Sign in to access your secure portal</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{message}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="patient">Patient Portal</TabsTrigger>
              <TabsTrigger value="admin">Admin Portal</TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="space-y-4">
              <Button
                onClick={handleAuth0Login}
                className="w-full bg-clarity-blue-600 hover:bg-clarity-blue-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in with Auth0"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <form onSubmit={handleCredentialsLogin} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-clarity-blue-600 hover:text-clarity-blue-700"
                    >
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
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <Button
                onClick={handleMicrosoftLogin}
                className="w-full bg-[#0078d4] hover:bg-[#006cbe]"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in with Microsoft"}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-2">
                <p>Admin access is restricted to authorized personnel only.</p>
                <p className="mt-1">You must use your @innerclarityinc.com or @nextphaseit.org email.</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-clarity-blue-600 hover:text-clarity-blue-700 font-medium">
                Create account
              </Link>
            </p>
          </div>

          {/* HIPAA Notice */}
          <div className="mt-6 p-3 bg-clarity-blue-50 rounded-lg border border-clarity-blue-200">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-clarity-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-clarity-blue-800">HIPAA Secure Login</p>
                <p className="text-xs text-clarity-blue-700 mt-1">
                  Your personal health information is protected by HIPAA regulations. All data is encrypted and stored
                  securely.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-4 text-center text-gray-500 text-xs">
            For assistance, please contact:
            <br />
            Phone: (984) 274-3723
            <br />
            Email: support@innerclarityinc.com
            <br />
            Address: 508 River Dell Townes Ave, Clayton, NC
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
