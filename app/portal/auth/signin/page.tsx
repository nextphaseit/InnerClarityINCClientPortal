"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePatientAuth } from "@/components/patient-auth-provider"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { signIn } = usePatientAuth()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        throw new Error(signInError.message || "Failed to sign in")
      }

      // Redirect to dashboard on successful login
      router.push("/portal/dashboard")
    } catch (error) {
      console.error("Sign in error:", error)
      setError(error instanceof Error ? error.message : "Failed to sign in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    setLoading(true)
    setError("")

    try {
      const { error: signInError } = await signIn("demo@patient.com", "demo123")

      if (signInError) {
        throw new Error(signInError.message || "Failed to sign in with demo account")
      }
\
      router.push("/portal/dashboar
