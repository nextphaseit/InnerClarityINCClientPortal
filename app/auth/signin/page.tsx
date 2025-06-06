"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const urlError = searchParams?.get("error")
    if (urlError) {
      switch (urlError) {
        case "OAuthSignin":
          setError("Error occurred during sign-in. Please try again.")
          break
        case "OAuthCallback":
          setError("Error occurred during authentication callback.")
          break
        case "AccessDenied":
          setError("Access denied. Please use an authorized email address.")
          break
        default:
          setError("An authentication error occurred.")
      }
    }
  }, [searchParams])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError("")
      await signIn("google", { callbackUrl: "/admin/dashboard" })
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <h1 className="text-3xl font-semibold mb-6">Sign In</h1>
      <Button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {isLoading ? "Signing in..." : "Sign In with Google"}
      </Button>
    </div>
  )
}
