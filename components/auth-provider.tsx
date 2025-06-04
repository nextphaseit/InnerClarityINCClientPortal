"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

// Define the User type
type User = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: "admin" | "patient"
  tenantId?: string
}

// Define the Auth context type
type AuthContextType = {
  user: User | null
  loading: boolean
}

// Create the Auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

// Custom hook to use the Auth context
export function useAuth() {
  return useContext(AuthContext)
}

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  )
}

// Internal component to handle the session
function AuthProviderContent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Safe usage of useSession with proper error handling for SSR
  const sessionHook = useSession()
  const { data: session, status } = sessionHook

  useEffect(() => {
    // Update user state when session changes
    if (status === "authenticated" && session?.user) {
      setUser(session.user as User)
    } else if (status === "unauthenticated") {
      setUser(null)
    }

    // Update loading state
    if (status !== "loading") {
      setLoading(false)
    }
  }, [session, status])

  // Provide the auth context
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
