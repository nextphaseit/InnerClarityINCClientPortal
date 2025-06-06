"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { LoadingSpinner } from "./loading-spinner"

interface AuthProtectionProps {
  children: React.ReactNode
  requiredRole?: "admin" | "super_admin" | "patient"
  redirectTo?: string
}

export function AuthProtection({ children, requiredRole, redirectTo }: AuthProtectionProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      const defaultRedirect = requiredRole === "patient" ? "/portal/auth/signin" : "/admin/login"
      router.push(redirectTo || defaultRedirect)
      return
    }

    if (requiredRole && session?.user?.role !== requiredRole) {
      if (requiredRole === "super_admin" && session?.user?.role === "admin") {
        // Allow admin to access super_admin pages for demo
        setIsAuthorized(true)
        return
      }
      router.push("/unauthorized")
      return
    }

    setIsAuthorized(true)
  }, [session, status, requiredRole, router, redirectTo])

  if (status === "loading") {
    return <LoadingSpinner size="lg" text="Checking authentication..." />
  }

  if (status === "unauthenticated") {
    return <LoadingSpinner size="lg" text="Redirecting to login..." />
  }

  if (!isAuthorized) {
    return <LoadingSpinner size="lg" text="Verifying permissions..." />
  }

  return <>{children}</>
}
