import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("🔑 Auth0 sign-in attempt started")

    // Check if Auth0 is configured
    if (!process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_CLIENT_SECRET || !process.env.AUTH0_DOMAIN) {
      console.error("❌ Auth0 not configured")
      return NextResponse.json(
        {
          error: "Auth0 not configured",
          details: "Auth0 environment variables are missing",
        },
        { status: 500 },
      )
    }

    // Parse request body safely
    let body: any = {}
    try {
      const rawBody = await request.text()
      if (rawBody) {
        body = JSON.parse(rawBody)
      }
    } catch (parseError) {
      console.error("❌ Failed to parse Auth0 request body:", parseError)
      // Continue with empty body for GET-style requests
    }

    console.log("📄 Auth0 request body:", body)

    // Redirect to NextAuth Auth0 provider
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
    const authUrl = `${baseUrl}/api/auth/signin/auth0`

    console.log("🔄 Redirecting to Auth0:", authUrl)

    return NextResponse.json(
      {
        success: true,
        redirectUrl: authUrl,
        message: "Redirecting to Auth0 authentication",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("❌ Auth0 sign-in error:", error)

    return NextResponse.json(
      {
        error: "Auth0 sign-in failed",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests by redirecting to Auth0
  try {
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
    const authUrl = `${baseUrl}/api/auth/signin/auth0`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("❌ Auth0 GET redirect error:", error)
    return NextResponse.json({ error: "Redirect failed" }, { status: 500 })
  }
}
