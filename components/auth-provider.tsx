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
  provider?: string
}

// Define the Auth context type
type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (provider?: string) => Promise<void>
  signOut: () => Promise<void>
}

// Create the Auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
})

// Custom hook to use the Auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
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
  const [error, setError] = useState<string | null>(null)

  // Safe usage of useSession with proper error handling
  let sessionData = null
  let sessionStatus = "loading"
  const sessionHook = useSession()

  try {
    // Only use useSession on the client side
    if (typeof window !== "undefined") {
      sessionData = sessionHook.data
      sessionStatus = sessionHook.status
    }
  } catch (err) {
    console.error("❌ Error accessing session:", err)
    setError("Failed to access session")
  }

  useEffect(() => {
    try {
      // Update user state when session changes
      if (sessionStatus === "authenticated" && sessionData?.user) {
        console.log("✅ Session authenticated, setting user:", sessionData.user.email)
        setUser(sessionData.user as User)
        setError(null)
      } else if (sessionStatus === "unauthenticated") {
        console.log("🚫 Session unauthenticated, clearing user")
        setUser(null)
        setError(null)
      }

      // Update loading state
      if (sessionStatus !== "loading") {
        setLoading(false)
      }
    } catch (err) {
      console.error("❌ Error updating auth state:", err)
      setError("Failed to update authentication state")
      setLoading(false)
    }
  }, [sessionData, sessionStatus])

  const signIn = async (provider = "auth0") => {
    try {
      setError(null)
      console.log(`🔑 Attempting sign in with provider: ${provider}`)

      // Import signIn dynamically to avoid SSR issues
      const { signIn: nextAuthSignIn } = await import("next-auth/react")

      const result = await nextAuthSignIn(provider, {
        redirect: false,
      })

      if (result?.error) {
        console.error(`❌ Sign in error with ${provider}:`, result.error)
        setError(`Failed to sign in with ${provider}: ${result.error}`)
      } else {
        console.log(`✅ Sign in successful with ${provider}`)
      }
    } catch (err) {
      console.error(`❌ Sign in exception with ${provider}:`, err)
      setError(`Sign in failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      console.log("🚪 Attempting sign out")

      // Import signOut dynamically to avoid SSR issues
      const { signOut: nextAuthSignOut } = await import("next-auth/react")

      await nextAuthSignOut({ redirect: false })
      setUser(null)
      console.log("✅ Sign out successful")
    } catch (err) {
      console.error("❌ Sign out error:", err)
      setError(`Sign out failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  // Provide the auth context
  return <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>{children}</AuthContext.Provider>
}
