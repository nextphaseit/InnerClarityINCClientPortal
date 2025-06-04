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
  tenantId?: string | null
  provider?: string | null
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
        const res = await fetch("/api/auth/session", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!res.ok) {
          console.warn("Session fetch failed:", res.status, res.statusText)
          setStatus("unauthenticated")
          return
        }

        const data = await res.json()

        if (!data || !data.user || !data.user.id) {
          setStatus("unauthenticated")
          return
        }

        setUser(data.user)
        setStatus("authenticated")
      } catch (error) {
        console.error("Failed to load user session:", error)
        setStatus("unauthenticated")
      }
    }

    loadUserSession()
  }, [])

  const signIn = async (provider = "credentials") => {
    try {
      const callbackUrl = encodeURIComponent(window.location.origin + "/dashboard")
      window.location.href = `/api/auth/signin/${provider}?callbackUrl=${callbackUrl}`
    } catch (error) {
      console.error("Sign in error:", error)
      router.push("/auth/error?error=OAuthSignin")
    }
  }

  const signOut = async () => {
    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (res.ok) {
        setUser(null)
        setStatus("unauthenticated")
        router.push("/")
      } else {
        throw new Error("Failed to sign out")
      }
    } catch (error) {
      console.error("Sign out error:", error)
      // Force logout even if API call fails
      setUser(null)
      setStatus("unauthenticated")
      router.push("/")
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
