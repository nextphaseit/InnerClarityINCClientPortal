// Re-export supabase client from the main supabase.ts file
import { supabase, createClient, isSupabaseConfigured, getSupabaseClient } from "./supabase"

// Export the supabase client as a named export
export { supabase, createClient, isSupabaseConfigured, getSupabaseClient }

// Also export as default for compatibility
export default supabase
