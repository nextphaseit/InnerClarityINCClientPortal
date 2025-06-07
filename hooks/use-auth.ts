"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  loading: boolean
  isConfigured: boolean
}

interface SignInResult {
  error?: string
  user?: User
}

interface SignUpResult {
  error?: string
  user?: User
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isConfigured: isSupabaseConfigured(),
  })

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ user: null, loading: false, isConfigured: false })
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
          console.error("Error getting session:", error)
        }

        setState({
          user: session?.user ?? null,
          loading: false,
          isConfigured: true,
        })
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setState({ user: null, loading: false, isConfigured: true })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      setState({
        user: session?.user ?? null,
        loading: false,
        isConfigured: true,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    if (!isSupabaseConfigured()) {
      return { error: "Authentication service is not configured" }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        return { error: error.message }
      }

      return { user: data.user }
    } catch (error) {
      console.error("Sign in exception:", error)
      return { error: "An unexpected error occurred during sign in" }
    }
  }

  const signUp = async (email: string, password: string, fullName: string): Promise<SignUpResult> => {
    if (!isSupabaseConfigured()) {
      return { error: "Authentication service is not configured" }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        return { error: error.message }
      }

      return { user: data.user }
    } catch (error) {
      console.error("Sign up exception:", error)
      return { error: "An unexpected error occurred during registration" }
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      }
    } catch (error) {
      console.error("Sign out exception:", error)
    }
  }

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { error: "Authentication service is not configured" }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/portal/auth/reset-password`,
      })

      if (error) {
        console.error("Password reset error:", error)
        return { error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Password reset exception:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  return {
    user: state.user,
    loading: state.loading,
    isConfigured: state.isConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
