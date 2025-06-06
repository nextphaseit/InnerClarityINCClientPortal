import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Create a mock client for when Supabase is not configured
const createMockClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
    signUp: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
    signInWithPassword: async () => ({ data: { user: null }, error: new Error("Supabase not configured") }),
    signOut: async () => ({ error: new Error("Supabase not configured") }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ data: [], error: new Error("Supabase not configured") }),
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
})

// Export the createClient function
export { createClient }

// Create and export the main Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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
          },
        })
      : createMockClient()
  }
  return supabaseClient
}
