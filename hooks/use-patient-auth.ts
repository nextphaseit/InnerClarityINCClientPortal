"use client"

import { useEffect, useState } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string
  avatar_url?: string
  phone?: string
  email?: string
}

export function usePatientAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      // Use mock data for demo
      setUser({
        id: "demo-user",
        email: "patient@example.com",
        user_metadata: { full_name: "Demo Patient" },
      } as SupabaseUser)
      setProfile({
        id: "demo-user",
        full_name: "Demo Patient",
        email: "patient@example.com",
      })
      setIsOnline(true)
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error("Auth error:", error)
          setLoading(false)
          return
        }

        setUser(user)
        setIsOnline(!!user)

        if (user) {
          // Fetch user profile
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (profileData) {
            setProfile(profileData)
          } else {
            // Create default profile if none exists
            const defaultProfile = {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Patient",
              email: user.email,
            }
            setProfile(defaultProfile)
          }
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setIsOnline(!!session?.user)

      if (session?.user) {
        // Fetch updated profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        setProfile(profileData)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    setIsOnline(false)
  }

  return {
    user,
    profile,
    loading,
    isOnline,
    signOut,
    refreshProfile: async () => {
      if (user && isSupabaseConfigured()) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(data)
      }
    },
  }
}
