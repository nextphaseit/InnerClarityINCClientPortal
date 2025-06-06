export interface ProductionCheckResult {
  isReady: boolean
  errors: string[]
  warnings: string[]
  recommendations: string[]
}

export function checkProductionReadiness(): ProductionCheckResult {
  const errors: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  // Check environment variables
  const requiredEnvVars = [
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]

  const optionalEnvVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]

  // Check required environment variables
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`)
    }
  })

  // Check optional environment variables
  optionalEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      warnings.push(`Optional environment variable not set: ${envVar}`)
    }
  })

  // Check for demo/test data
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXTAUTH_SECRET === "fallback-secret-for-development") {
      errors.push("Using development NEXTAUTH_SECRET in production")
    }
  }

  // Recommendations
  recommendations.push("Ensure all database tables are created and properly configured")
  recommendations.push("Test authentication flows for both admin and patient portals")
  recommendations.push("Verify Stripe webhook endpoints are configured")
  recommendations.push("Test email notifications and SMTP configuration")
  recommendations.push("Review and update CORS settings for production domain")

  return {
    isReady: errors.length === 0,
    errors,
    warnings,
    recommendations,
  }
}
