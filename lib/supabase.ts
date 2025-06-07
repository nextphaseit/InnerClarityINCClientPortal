import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  const configured = !!(supabaseUrl && supabaseAnonKey)
  console.log("🔍 Supabase configuration check:", {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    configured,
  })
  return configured
}

// Create a mock client for when Supabase is not configured
const createMockClient = () => {
  console.log("⚠️ Using mock Supabase client - Supabase not configured")
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
      getSession: async () => ({ data: { session: null }, error: new Error("Supabase not configured") }),
      signUp: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
      signInWithPassword: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
      signInWithOAuth: async () => ({ data: { url: null }, error: new Error("Supabase not configured") }),
      signOut: async () => ({ error: new Error("Supabase not configured") }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: async () => ({ error: new Error("Supabase not configured") }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error("Supabase not configured") }),
          data: [],
          error: new Error("Supabase not configured"),
        }),
        data: [],
        error: new Error("Supabase not configured"),
      }),
      insert: () => ({ data: null, error: new Error("Supabase not configured") }),
      update: () => ({ data: null, error: new Error("Supabase not configured") }),
      upsert: () => ({ data: null, error: new Error("Supabase not configured") }),
      delete: () => ({ data: null, error: new Error("Supabase not configured") }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: new Error("Supabase not configured") }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
        remove: async () => ({ data: null, error: new Error("Supabase not configured") }),
      }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => {} }),
      unsubscribe: () => {},
    }),
  }
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
  : (createMockClient() as any)

// Admin client for server-side operations
export const supabaseAdmin =
  isSupabaseConfigured() && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : (createMockClient() as any)

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
      : createMockClient()
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
