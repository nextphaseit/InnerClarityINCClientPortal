"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getProfile, createOrUpdateProfile, type CreateProfileData } from "@/lib/profile-utils"

export function useProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      const profileData = await getProfile(user.id)
      setProfile(profileData)
    } catch (err) {
      console.error("Error loading profile:", err)
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<CreateProfileData>) => {
    try {
      setError(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      const updatedProfile = await createOrUpdateProfile({
        id: user.id,
        full_name: profile?.full_name || "",
        ...updates,
      })

      setProfile(updatedProfile?.[0] || updatedProfile)
      return updatedProfile
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err instanceof Error ? err.message : "Failed to update profile")
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: loadProfile,
  }
}
