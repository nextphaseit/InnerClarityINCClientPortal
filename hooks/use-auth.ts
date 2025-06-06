"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "@/lib/supabase"
import type { UserProfile } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setUser(null)
        return
      }

      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

      if (error || !profile) {
        setUser(null)
        return
      }

      setUser(profile)
    } catch (error) {
      console.error("Error loading user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null)
        setLoading(false)
      } else {
        await loadUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/auth/signin")
  }

  const refreshUser = async () => {
    await loadUser()
  }

  return <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
