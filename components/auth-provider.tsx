"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

interface AuthContextType {
  user: User | null
  status: "loading" | "authenticated" | "unauthenticated"
  signIn: (provider?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: "loading",
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const router = useRouter()

  useEffect(() => {
    async function loadUserSession() {
      try {
        // Simulate loading time for demo purposes
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const res = await fetch("/api/auth/session")

        if (!res.ok) {
          setStatus("unauthenticated")
          return
        }

        const session = await res.json()

        if (!session || !session.user) {
          setStatus("unauthenticated")
          return
        }

        setUser(session.user)
        setStatus("authenticated")
      } catch (error) {
        console.error("Failed to load user session:", error)
        setStatus("unauthenticated")
      }
    }

    loadUserSession()
  }, [])

  const signIn = async (provider = "auth0") => {
    try {
      const callbackUrl = window.location.origin
      window.location.href = `/api/auth/signin?provider=${provider}&callbackUrl=${encodeURIComponent(callbackUrl)}`
    } catch (error) {
      console.error("Sign in error:", error)
      router.push("/auth/error?error=OAuthSignin")
    }
  }

  const signOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" })
      if (res.ok) {
        setUser(null)
        setStatus("unauthenticated")
        router.push("/")
      } else {
        throw new Error("Failed to sign out")
      }
    } catch (error) {
      console.error("Sign out error:", error)
      router.push("/auth/error?error=Default")
    }
  }

  return <AuthContext.Provider value={{ user, status, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
