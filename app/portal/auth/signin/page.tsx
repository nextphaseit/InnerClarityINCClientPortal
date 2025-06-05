"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react"
import { usePatientAuth } from "@/components/patient-auth-provider"
import Image from "next/image"

export default function PatientSignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { signIn } = usePatientAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        console.error("Sign in error:", error)
        setError(error.message || "Failed to sign in")
      } else {
        console.log("Sign in successful, redirecting...")
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          router.push("/portal/dashboard")
        }, 100)
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-100 px-4">
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
          <CardDescription>Sign in to access your mental health portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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

            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmail("demo@patient.com")
                  setPassword("demo123")
                }}
              >
                Use Demo Credentials
              </Button>
            </div>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                href="/portal/auth/reset-password"
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/portal/auth/signup" className="text-teal-600 hover:text-teal-700 hover:underline">
                Sign up
              </Link>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-center text-gray-500">
                Need help? Contact{" "}
                <a href="mailto:support@innerclarity.org" className="text-teal-600 hover:underline">
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
