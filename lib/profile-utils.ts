import { supabase } from "./supabase"

export interface CreateProfileData {
  id: string
  full_name: string
  date_of_birth?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  insurance_provider?: string | null
  insurance_id?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  emergency_contact_relationship?: string | null
}

export async function createOrUpdateProfile(profileData: CreateProfileData) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )
      .select()

    if (error) {
      console.error("Error upserting profile:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to create/update profile:", error)
    throw error
  }
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching profile:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to fetch profile:", error)
    throw error
  }
}

export async function ensureProfileExists(userId: string, fallbackData?: Partial<CreateProfileData>) {
  try {
    // First, try to get the current user from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error("User not authenticated")
    }

    // Check if profile exists
    const existingProfile = await getProfile(userId)

    if (existingProfile) {
      return existingProfile
    }

    // Create profile if it doesn't exist
    const profileData: CreateProfileData = {
      id: userId,
      full_name: fallbackData?.full_name || user.user_metadata?.full_name || "",
      date_of_birth: fallbackData?.date_of_birth || user.user_metadata?.date_of_birth || null,
      ...fallbackData,
    }

    return await createOrUpdateProfile(profileData)
  } catch (error) {
    console.error("Failed to ensure profile exists:", error)
    throw error
  }
}
