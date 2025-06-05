/**
 * Validates NextAuth and Microsoft OAuth configuration
 */
export function validateAuthConfig() {
  const requiredEnvVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
  }

  const missingVars: string[] = []
  const warnings: string[] = []

  // Check for missing required variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key)
    }
  })

  // Validate NEXTAUTH_SECRET length
  if (requiredEnvVars.NEXTAUTH_SECRET && requiredEnvVars.NEXTAUTH_SECRET.length < 32) {
    warnings.push("NEXTAUTH_SECRET should be at least 32 characters long")
  }

  // Validate NEXTAUTH_URL format
  if (requiredEnvVars.NEXTAUTH_URL && !requiredEnvVars.NEXTAUTH_URL.startsWith("https://")) {
    warnings.push("NEXTAUTH_URL should use HTTPS in production")
  }

  // Log results
  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingVars.join(", "))
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
  }

  if (warnings.length > 0) {
    console.warn("⚠️ Configuration warnings:", warnings.join(", "))
  }

  console.log("✅ NextAuth configuration validated successfully")

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  }
}

/**
 * Generates a secure NextAuth secret
 */
export function generateNextAuthSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let result = ""
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
