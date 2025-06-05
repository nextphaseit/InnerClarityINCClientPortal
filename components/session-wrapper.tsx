"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface SessionWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export default function SessionWrapper({
  children,
  requireAuth = false,
  requireAdmin = false,
  redirectTo = "/auth/signin",
}: SessionWrapperProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (requireAuth && !session) {
      console.log("🔒 No session found, redirecting to signin...")
      router.push(redirectTo)
      return
    }

    if (requireAdmin && session && !session.user?.role?.includes("admin")) {
      console.log("🚫 User is not admin, redirecting...")
      router.push("/unauthorized")
      return
    }
  }, [session, status, requireAuth, requireAdmin, redirectTo, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (requireAuth && !session) {
    return null
  }

  if (requireAdmin && session && !session.user?.role?.includes("admin")) {
    return null
  }

  return <>{children}</>
}
