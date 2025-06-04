import { NextResponse } from "next/server"
import { validateEnvironmentVariables } from "@/lib/env-validation"

export async function GET() {
  try {
    const validation = validateEnvironmentVariables()

    return NextResponse.json({
      isValid: validation.isValid,
      providers: {
        microsoft: !!(validation.config.MICROSOFT_CLIENT_ID && validation.config.MICROSOFT_CLIENT_SECRET),
        auth0: !!(validation.config.AUTH0_DOMAIN && validation.config.AUTH0_CLIENT_ID),
        nextauth: !!validation.config.NEXTAUTH_SECRET,
      },
      warnings: validation.warnings,
      missing: validation.missing,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Config check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check configuration",
        isValid: false,
        providers: { microsoft: false, auth0: false, nextauth: false },
      },
      { status: 500 },
    )
  }
}
