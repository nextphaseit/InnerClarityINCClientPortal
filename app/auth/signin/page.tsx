"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Lock, Eye } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const { signIn, user } = useAuth()

  useEffect(() => {
    if (user) {
      // Redirect if already signed in
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const success = await signIn(email, password)

      if (success) {
        // Redirect will happen via useEffect when user state updates
      } else {
        setError("Invalid email or password. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // For demo purposes
  const handleDemoLogin = (type: "admin" | "client") => {
    setEmail(type === "admin" ? "admin@innerclarity.com" : "client@example.com")
    setPassword("password123")
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your.email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

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

        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-muted-foreground mb-2">Demo Accounts:</p>
          <div className="flex gap-2 w-full">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDemoLogin("admin")}>
              Admin Demo
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDemoLogin("client")}>
              Client Demo
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">Password: password123</p>
        </CardFooter>
      </Card>
    </div>
  )
}
