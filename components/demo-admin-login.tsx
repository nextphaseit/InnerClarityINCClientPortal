"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TestTube, Eye, EyeOff, Info } from "lucide-react"

interface DemoAdminLoginProps {
  onSuccess?: () => void
}

export function DemoAdminLogin({ onSuccess }: DemoAdminLoginProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [credentials, setCredentials] = useState({
    email: "demo@admin.nextphaseit.org",
    password: "DemoAdmin123!",
  })

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("🧪 Attempting demo admin login...")

      const result = await signIn("demo-admin", {
        email: credentials.email,
        password: credentials.password,
        callbackUrl: "/admin/dashboard",
        redirect: false,
      })

      if (result?.error) {
        console.error("❌ Demo login error:", result.error)
        setError("Demo login failed. Please check your credentials.")
      } else if (result?.url) {
        console.log("✅ Demo login successful, redirecting...")
        window.location.href = result.url
        onSuccess?.()
      }
    } catch (err) {
      console.error("❌ Demo login exception:", err)
      setError("An unexpected error occurred during demo login.")
    } finally {
      setLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setCredentials({
      email: "demo@admin.nextphaseit.org",
      password: "DemoAdmin123!",
    })
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-lg text-amber-800">Demo Admin Access</CardTitle>
        </div>
        <CardDescription className="text-amber-700">Use the demo account to test admin portal features</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Demo Account Features:</strong>
            <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
              <li>Super Admin privileges</li>
              <li>Access to all admin features</li>
              <li>User management capabilities</li>
              <li>Full portal functionality</li>
            </ul>
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleDemoLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-email">Email</Label>
            <Input
              id="demo-email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
              className="bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo-password">Password</Label>
            <div className="relative">
              <Input
                id="demo-password"
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                className="bg-white pr-10"
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

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Demo Login
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={fillDemoCredentials}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Fill Demo
            </Button>
          </div>
        </form>

        <div className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
          <strong>Demo Credentials:</strong>
          <br />
          Email: demo@admin.nextphaseit.org
          <br />
          Password: DemoAdmin123!
        </div>
      </CardContent>
    </Card>
  )
}
