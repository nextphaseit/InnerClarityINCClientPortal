import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const error = url.searchParams.get("error") || "UnknownError"
    const errorDescription = url.searchParams.get("error_description") || "An authentication error occurred"

    console.log("Auth error redirect:", { error, errorDescription })

    // Create redirect URL safely
    const baseUrl = url.origin
    const redirectUrl = new URL("/auth/error", baseUrl)

    // Add parameters safely
    if (error && typeof error === "string") {
      redirectUrl.searchParams.set("error", error)
    }
    if (errorDescription && typeof errorDescription === "string") {
      redirectUrl.searchParams.set("error_description", errorDescription)
    }

    return NextResponse.redirect(redirectUrl.toString())
  } catch (err) {
    console.error("Auth error handler failed:", err)

    // Return JSON response as fallback
    return NextResponse.json(
      {
        error: "AuthError",
        message: "Authentication error occurred",
        details: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
