import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  const configured = !!(supabaseUrl && supabaseAnonKey)
  return configured
}

// Export the createClient function
export { createClient }

// Create and export the main Supabase client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : ((() => {
      throw new Error(
        "Supabase is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.",
      )
    })() as any)

// Admin client for server-side operations
export const supabaseAdmin =
  isSupabaseConfigured() && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : ((() => {
        throw new Error(
          "Supabase Admin is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment variables.",
        )
      })() as any)

// Client-side Supabase client (singleton pattern)
let supabaseClient: any = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = isSupabaseConfigured()
      ? createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: "pkce",
          },
        })
      : ((() => {
          throw new Error(
            "Supabase is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.",
          )
        })() as any)
  }
  return supabaseClient
}

// Helper function to handle auth errors
export const handleAuthError = (error: any) => {
  console.error("🚨 Auth Error:", error)

  if (error?.message?.includes("Invalid login credentials")) {
    return "Invalid email or password. Please check your credentials."
  }

  if (error?.message?.includes("Email not confirmed")) {
    return "Please check your email and click the confirmation link before signing in."
  }

  if (error?.message?.includes("User already registered")) {
    return "An account with this email already exists. Please sign in instead."
  }

  return error?.message || "An authentication error occurred. Please try again."
}
