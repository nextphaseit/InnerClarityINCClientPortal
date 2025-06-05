"use client"

import { useSession } from "next-auth/react"
import { useMemo } from "react"

export function useAuth() {
  const { data: session, status } = useSession()

  const user = useMemo(() => {
    if (!session?.user) return null

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
      isAdmin: session.user.role?.includes("admin") || false,
    }
  }, [session])

  return {
    user,
    session,
    isLoading: status === "loading",
    isAuthenticated: !!session,
    isAdmin: user?.isAdmin || false,
  }
}
