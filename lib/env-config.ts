// Production environment configuration
export const ENV_CONFIG = {
  // Authentication
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://admin.nextphaseit.org",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

  // Auth0 Configuration
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,

  // Supabase Configuration
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Stripe Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

  // Production domains
  ADMIN_DOMAIN: "admin.nextphaseit.org",
  PATIENT_DOMAIN: "patients.nextphaseit.org",

  // Feature flags
  ENABLE_DEMO_MODE: false,
  REQUIRE_EMAIL_VERIFICATION: true,
  ENABLE_AUDIT_LOGGING: true,
}

export function validateProductionConfig() {
  const required = [
    "NEXTAUTH_SECRET",
    "AUTH0_CLIENT_ID",
    "AUTH0_CLIENT_SECRET",
    "AUTH0_DOMAIN",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_KEY",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  return true
}

export const isProduction = process.env.NODE_ENV === "production"
export const isDevelopment = process.env.NODE_ENV === "development"
