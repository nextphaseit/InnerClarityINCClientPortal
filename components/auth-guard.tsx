"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: "admin" | "patient"
  fallback?: ReactNode
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (status === "unauthenticated") {
      // Redirect to appropriate signin based on required role
      if (requiredRole === "admin") {
        router.push("/api/auth/signin/azure-ad")
      } else {
        router.push("/api/auth/signin/auth0")
      }
      return
    }

    if (requiredRole && session?.user?.role !== requiredRole) {
      router.push("/unauthorized")
      return
    }
  }, [session, status, requiredRole, router])

  if (status === "loading") {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    )
  }

  if (status === "unauthenticated") {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Redirecting to sign in...</p>
          </div>
        </div>
      )
    )
  }

  if (requiredRole && session?.user?.role !== requiredRole) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
