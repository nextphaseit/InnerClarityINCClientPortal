"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Mail, Lock, Calendar, Shield } from "lucide-react"

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  dateOfBirth: string
}

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  dateOfBirth?: string
  general?: string
}

interface PasswordValidation {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  // Check for message in URL (e.g., from redirect)
  useEffect(() => {
    const message = searchParams?.get("message")
    if (message) {
      setErrors({ general: message })
    }
  }, [searchParams])

  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    // Validate password as user types
    if (name === "password") {
      setPasswordValidation(validatePassword(value))

      // Check password confirmation match if it exists
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      } else if (formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
      }
    }

    // Check password match when typing in confirm password field
    if (name === "confirmPassword" && formData.password) {
      if (value !== formData.password) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }))
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
      isValid = false
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address"
        isValid = false
      }
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else {
      const validation = validatePassword(formData.password)
      if (!Object.values(validation).every(Boolean)) {
        newErrors.password = "Password does not meet all requirements"
        isValid = false
      }
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const isFormValid = (): boolean => {
    return (
      !!formData.fullName.trim() &&
      !!formData.email.trim() &&
      !!formData.password &&
      !!formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      Object.values(passwordValidation).every(Boolean) &&
      Object.keys(errors).length === 0
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear general error
    setErrors((prev) => ({ ...prev, general: undefined }))

    // Validate form
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Redirect to signin with success message
      router.push("/auth/signin?message=Registration successful! Please sign in.")
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({
        general: error instanceof Error ? error.message : "Registration failed. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAuth0Login = () => {
    router.push("/api/auth/signin?provider=auth0")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/inner-clarity-logo.png"
              alt="Inner Clarity"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
          <CardDescription className="text-gray-600">
            Join Inner Clarity to access your secure patient portal
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errors.general && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center">
                Full Name <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.fullName ? "border-red-500 focus:ring-red-500" : ""}`}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  required
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="text-sm text-red-500 mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                Email Address <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  required
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                Password <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500 mt-1">
                  {errors.password}
                </p>
              )}

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div
                      className={`flex items-center ${passwordValidation.minLength ? "text-green-600" : "text-red-600"}`}
                    >
                      <span className="mr-1">{passwordValidation.minLength ? "✓" : "✗"}</span>
                      At least 8 characters
                    </div>
                    <div
                      className={`flex items-center ${passwordValidation.hasUppercase ? "text-green-600" : "text-red-600"}`}
                    >
                      <span className="mr-1">{passwordValidation.hasUppercase ? "✓" : "✗"}</span>
                      One uppercase letter
                    </div>
                    <div
                      className={`flex items-center ${passwordValidation.hasLowercase ? "text-green-600" : "text-red-600"}`}
                    >
                      <span className="mr-1">{passwordValidation.hasLowercase ? "✓" : "✗"}</span>
                      One lowercase letter
                    </div>
                    <div
                      className={`flex items-center ${passwordValidation.hasNumber ? "text-green-600" : "text-red-600"}`}
                    >
                      <span className="mr-1">{passwordValidation.hasNumber ? "✓" : "✗"}</span>
                      One number
                    </div>
                    <div
                      className={`flex items-center ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-red-600"}`}
                    >
                      <span className="mr-1">{passwordValidation.hasSpecialChar ? "✓" : "✗"}</span>
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center">
                Confirm Password <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-clarity-blue-600 hover:bg-clarity-blue-700"
              disabled={loading || !isFormValid()}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleAuth0Login}>
              Sign up with Auth0
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-clarity-blue-600 hover:text-clarity-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {/* HIPAA Notice */}
          <div className="mt-6 p-3 bg-clarity-blue-50 rounded-lg border border-clarity-blue-200">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-clarity-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-clarity-blue-800">HIPAA Secure Registration</p>
                <p className="text-xs text-clarity-blue-700 mt-1">
                  Your personal health information is protected by HIPAA regulations. All data is encrypted and stored
                  securely.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
