"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase, handleAuthError } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: "patient" | "admin" | "super_admin"
  avatar_url?: string
  created_at: string
  status: "active" | "inactive" | "suspended"
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: "Not configured" }),
  signUp: async () => ({ error: "Not configured" }),
  signOut: async () => {},
  resetPassword: async () => ({ error: "Not configured" }),
  isConfigured: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = true
  const router = useRouter()

  useEffect(() => {
    console.log("🔄 Initializing Supabase auth...")

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Error getting initial session:", error)
        }

        if (session?.user) {
          console.log("✅ Found existing session for:", session.user.email)
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          console.log("ℹ️ No existing session found")
        }
      } catch (error) {
        console.error("❌ Error getting initial session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email)

      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      console.log("🧹 Cleaning up auth subscription")
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log("👤 Fetching profile for user:", userId)

      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("❌ Error fetching profile:", error)

        // If profile doesn't exist, create one
        if (error.code === "PGRST116") {
          console.log("📝 Creating new profile for user")
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              full_name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User",
              email: user?.email || "",
              role: "patient",
              status: "active",
            })
            .select()
            .single()

          if (createError) {
            console.error("❌ Error creating profile:", createError)
          } else {
            console.log("✅ Profile created successfully")
            setProfile(newProfile)
          }
        }
        return
      }

      console.log("✅ Profile fetched successfully:", data.email)
      setProfile(data)
    } catch (error) {
      console.error("❌ Error fetching profile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔑 Attempting sign in for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (error) {
        console.error("❌ Sign in error:", error)
        return { error: handleAuthError(error) }
      }

      if (data.user) {
        console.log("✅ Sign in successful for:", data.user.email)
        return {}
      }

      return { error: "Sign in failed" }
    } catch (error) {
      console.error("❌ Sign in exception:", error)
      return { error: handleAuthError(error) }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("📝 Attempting sign up for:", email)

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        console.error("❌ Sign up error:", error)
        return { error: handleAuthError(error) }
      }

      if (data.user) {
        console.log("✅ Sign up successful for:", data.user.email)

        // Check if email confirmation is required
        if (!data.session) {
          return { error: "Please check your email and click the confirmation link to complete registration." }
        }

        return {}
      }

      return { error: "Sign up failed" }
    } catch (error) {
      console.error("❌ Sign up exception:", error)
      return { error: handleAuthError(error) }
    }
  }

  const signOut = async () => {
    try {
      console.log("🚪 Signing out...")
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      console.log("✅ Sign out successful")
      router.push("/")
    } catch (error) {
      console.error("❌ Sign out error:", error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      console.log("🔄 Sending password reset for:", email)

      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error("❌ Password reset error:", error)
        return { error: handleAuthError(error) }
      }

      console.log("✅ Password reset email sent")
      return {}
    } catch (error) {
      console.error("❌ Password reset exception:", error)
      return { error: handleAuthError(error) }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        isConfigured: configured,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
