import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get("error") || "UnknownError"
    const errorDescription = searchParams.get("error_description") || "An authentication error occurred"

    console.log("Auth error:", { error, errorDescription })

    // Create a simple redirect to the error page
    const redirectUrl = new URL("/auth/error", request.url)
    redirectUrl.searchParams.set("error", error)
    redirectUrl.searchParams.set("error_description", errorDescription)

    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error("Auth error handler failed:", err)

    // Return a simple JSON response if redirect fails
    return NextResponse.json(
      {
        error: "AuthError",
        message: "Authentication error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
