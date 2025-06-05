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
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Mock sign in for demo
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
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
