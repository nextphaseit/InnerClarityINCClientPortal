"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Shield } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateDomain = (email: string) => {
    const authorizedDomains = ["@innerclarity.org", "@innerclarityinc.com", "@nextphaseit.org"]
    return authorizedDomains.some((domain) => email.toLowerCase().endsWith(domain.toLowerCase()))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Email address is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!validateDomain(email)) {
      setError("Only authorized Inner Clarity staff can reset passwords")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Call Microsoft Graph API to initiate password reset
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setSuccess(true)
      console.log("✅ Password reset email sent successfully")
    } catch (err) {
      console.error("❌ Password reset error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-purple-100">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>

            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Check your email inbox and spam folder</li>
                <li>• Click the reset link in the email</li>
                <li>• Follow the Microsoft password reset process</li>
                <li>• Return to sign in with your new password</li>
              </ul>
            </div>
            <Link
              href="/auth/signin"
              className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-purple-100">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            Enter your work email address and we'll help you reset your Microsoft account password
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800 font-medium mb-2">Authorized Domains Only</p>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• @innerclarity.org</li>
            <li>• @innerclarityinc.com</li>
            <li>• @nextphaseit.org</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError("")
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter your work email"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending Reset Email...</span>
              </div>
            ) : (
              "Send Reset Instructions"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center space-y-4">
          <Link
            href="/auth/signin"
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </Link>

          <div className="text-sm text-gray-500">
            Need help? Contact{" "}
            <a href="mailto:support@innerclarityinc.com" className="text-purple-600 hover:text-purple-700">
              support@innerclarityinc.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
