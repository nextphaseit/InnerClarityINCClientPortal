interface RequiredEnvVars {
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  MICROSOFT_CLIENT_ID: string
  MICROSOFT_CLIENT_SECRET: string
  MICROSOFT_TENANT_ID: string
}

interface OptionalEnvVars {
  AUTH0_DOMAIN?: string
  AUTH0_CLIENT_ID?: string
  AUTH0_CLIENT_SECRET?: string
  AUTH0_AUDIENCE?: string
}

export function validateEnvironmentVariables(): {
  isValid: boolean
  missing: string[]
  warnings: string[]
  config: RequiredEnvVars & OptionalEnvVars
} {
  const missing: string[] = []
  const warnings: string[] = []

  // Required environment variables
  const requiredVars: (keyof RequiredEnvVars)[] = [
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "MICROSOFT_CLIENT_ID",
    "MICROSOFT_CLIENT_SECRET",
    "MICROSOFT_TENANT_ID",
  ]

  const config: any = {}

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value || value.trim() === "") {
      missing.push(varName)
    } else {
      config[varName] = value.trim()
    }
  }

  // Check optional Auth0 variables
  const auth0Domain = process.env.AUTH0_DOMAIN
  const auth0ClientId = process.env.AUTH0_CLIENT_ID
  const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET

  if (auth0Domain && auth0ClientId && auth0ClientSecret) {
    config.AUTH0_DOMAIN = auth0Domain
    config.AUTH0_CLIENT_ID = auth0ClientId
    config.AUTH0_CLIENT_SECRET = auth0ClientSecret
    config.AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || `https://${auth0Domain}/api/v2/`
  } else if (auth0Domain || auth0ClientId || auth0ClientSecret) {
    warnings.push("Auth0 configuration is incomplete. All Auth0 variables must be set together.")
  }

  // Validate NEXTAUTH_SECRET length
  if (config.NEXTAUTH_SECRET && config.NEXTAUTH_SECRET.length < 32) {
    warnings.push("NEXTAUTH_SECRET should be at least 32 characters long for security")
  }

  // Validate NEXTAUTH_URL format
  if (config.NEXTAUTH_URL) {
    try {
      new URL(config.NEXTAUTH_URL)
    } catch {
      warnings.push("NEXTAUTH_URL is not a valid URL")
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    config,
  }
}

export function logEnvironmentStatus() {
  const validation = validateEnvironmentVariables()

  console.log("🔧 Environment Variable Validation:")
  console.log(`✅ Valid: ${validation.isValid}`)

  if (validation.missing.length > 0) {
    console.error("❌ Missing required variables:", validation.missing)
  }

  if (validation.warnings.length > 0) {
    console.warn("⚠️ Warnings:", validation.warnings)
  }

  // Log available providers
  const hasAuth0 = !!(validation.config.AUTH0_DOMAIN && validation.config.AUTH0_CLIENT_ID)
  const hasMicrosoft = !!(validation.config.MICROSOFT_CLIENT_ID && validation.config.MICROSOFT_CLIENT_SECRET)

  console.log("🔐 Available Providers:")
  console.log(`  Microsoft: ${hasMicrosoft ? "✅" : "❌"}`)
  console.log(`  Auth0: ${hasAuth0 ? "✅" : "❌"}`)

  return validation
}
