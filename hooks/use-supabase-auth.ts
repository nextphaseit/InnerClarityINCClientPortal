"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string
  email: string
  role: "admin" | "super_admin" | "patient"
  avatar_url?: string
  created_at: string
}

interface AuthUser extends Profile {
  user_id: string
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

      if (error) {
        console.error("Error loading user profile:", error)
        setUser(null)
      } else if (profile) {
        setUser({
          ...profile,
          user_id: authUser.id,
        })
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/signin?tab=admin")
  }

  return {
    user,
    loading,
    signOut,
  }
}
