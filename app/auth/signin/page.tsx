"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import Image from "next/image"

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)

      // Using the NextAuth client-side signIn function
      await signIn("azure-ad", {
        callbackUrl: "/admin/dashboard",
        redirect: true,
      })
    } catch (err) {
      console.error("Sign-in error:", err)
      setError("An error occurred during sign-in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <div className="mx-auto mb-6">
          <Image src="/images/inner-clarity-logo.png" alt="NextPhase IT" width={120} height={40} className="mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold mb-2">Admin Portal Sign In</h1>
        <p className="text-gray-500 mb-6">Use your Microsoft account to access the admin portal.</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
              </svg>
              <span>Sign in with Microsoft</span>
            </>
          )}
        </button>

        <div className="mt-6 text-xs text-gray-500">
          <p>Authorized domains: @innerclarity.org, @innerclarityinc.com, @nextphaseit.org</p>
        </div>
      </div>
    </div>
  )
}
