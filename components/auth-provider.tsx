"use client"

import type React from "react"
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react"
import type { Session } from "next-auth"
import { createContext, useContext } from "react"

interface AuthProviderProps {
  children: React.ReactNode
  session?: Session | null
}

// Create auth context for additional functionality
const AuthContext = createContext<{
  isAdmin: boolean
  isAuthenticated: boolean
} | null>(null)

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  )
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const isAuthenticated = status === "authenticated" && !!session
  const isAdmin = isAuthenticated && session?.user?.role === "admin"

  return <AuthContext.Provider value={{ isAdmin, isAuthenticated }}>{children}</AuthContext.Provider>
}

// Export useAuth hook as named export
export function useAuth() {
  const context = useContext(AuthContext)
  const { data: session, status } = useSession()

  return {
    session,
    status,
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" && !!session,
    isAdmin: session?.user?.role === "admin",
    signIn,
    signOut,
    ...context,
  }
}

// Also export as named export for flexibility
export { AuthProvider }
