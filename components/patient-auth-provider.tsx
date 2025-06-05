"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"
import type { ReactNode } from "react"

interface PatientAuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: any }>
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined)

export function usePatientAuth() {
  const context = useContext(PatientAuthContext)
  if (context === undefined) {
    throw new Error("usePatientAuth must be used within a PatientAuthProvider")
  }
  return context
}

interface PatientAuthProviderProps {
  children: ReactNode
}

export default function PatientAuthProvider({ children }: PatientAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log("🔧 Supabase not configured, using demo mode")
      // Set mock user for demo
      setUser({
        id: "demo-user",
        email: "patient@example.com",
        user_metadata: { full_name: "Demo Patient" },
      } as User)
      setSession({
        user: {
          id: "demo-user",
          email: "patient@example.com",
          user_metadata: { full_name: "Demo Patient" },
        },
        access_token: "demo-token",
        refresh_token: "demo-refresh",
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: "bearer",
      } as Session)
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
        }

        console.log("Initial session:", session ? "Found" : "Not found")
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error("Error getting initial session:", error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session")
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("Attempting sign in for:", email)

    if (!isSupabaseConfigured()) {
      console.log("Using demo mode sign in")
      // Mock sign in for demo - set the demo user state
      setUser({
        id: "demo-user",
        email: email,
        user_metadata: { full_name: "Demo Patient" },
      } as User)
      setSession({
        user: {
          id: "demo-user",
          email: email,
          user_metadata: { full_name: "Demo Patient" },
        },
        access_token: "demo-token",
        refresh_token: "demo-refresh",
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: "bearer",
      } as Session)
      return { error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("Sign in result:", { data: !!data, error: !!error })
    return { error }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!isSupabaseConfigured()) {
      // Mock sign up for demo
      return { error: null }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })
    return { error }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      // Mock sign out for demo
      setUser(null)
      setSession(null)
      router.push("/portal/auth/signin")
      return
    }

    await supabase.auth.signOut()
    router.push("/portal/auth/signin")
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      // Mock reset for demo
      return { error: null }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/portal/auth/reset-password`,
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <PatientAuthContext.Provider value={value}>{children}</PatientAuthContext.Provider>
}
