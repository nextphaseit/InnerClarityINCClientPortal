// Verification script to check if the database is set up correctly
// Run with: node scripts/verify-setup.js

const { createClient } = require("@supabase/supabase-js")

async function verifySetup() {
  console.log("🔍 Verifying Inner Clarity Portal setup...\n")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables")
    console.log("Please check your .env.local file")
    return
  }

  console.log("✅ Environment variables found")

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Check database tables
  const tables = [
    "profiles",
    "appointments",
    "messages",
    "invoices",
    "documents",
    "form_responses",
    "health_logs",
    "audit_logs",
    "appointment_requests",
    "payments",
    "autopay_settings",
  ]

  console.log("\n📊 Checking database tables...")

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1)
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
      } else {
        console.log(`✅ Table '${table}': OK`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}': ${err.message}`)
    }
  }

  // Check storage buckets
  console.log("\n🗄️ Checking storage buckets...")
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      console.log(`❌ Storage: ${error.message}`)
    } else {
      const avatarBucket = buckets.find((b) => b.name === "avatars")
      if (avatarBucket) {
        console.log("✅ Avatars bucket: OK")
      } else {
        console.log("❌ Avatars bucket: Not found")
      }
    }
  } catch (err) {
    console.log(`❌ Storage: ${err.message}`)
  }

  console.log("\n🎉 Setup verification complete!")
  console.log("\nIf you see any ❌ errors above, please:")
  console.log("1. Run the database setup script in Supabase SQL Editor")
  console.log("2. Check your environment variables")
  console.log("3. Verify your Supabase project is active")
}

verifySetup().catch(console.error)
