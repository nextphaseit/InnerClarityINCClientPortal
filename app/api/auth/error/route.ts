import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get("error")

    // Log the error for debugging
    console.log("Auth error:", error)

    // Return a simple JSON response
    return NextResponse.json(
      {
        error: error || "unknown_error",
        message: getErrorMessage(error),
        timestamp: new Date().toISOString(),
      },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (err) {
    console.error("Auth error route failed:", err)

    return NextResponse.json(
      {
        error: "internal_error",
        message: "An unexpected error occurred",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

function getErrorMessage(error: string | null): string {
  const errorMessages: Record<string, string> = {
    Configuration: "Server configuration error",
    AccessDenied: "Access denied",
    Verification: "Verification token expired",
    CredentialsSignin: "Invalid credentials",
    OAuthSignin: "OAuth sign in error",
    OAuthCallback: "OAuth callback error",
    OAuthCreateAccount: "Could not create OAuth account",
    EmailSignin: "Email sign in error",
    SessionRequired: "Session required",
  }

  return errorMessages[error || ""] || "Authentication error occurred"
}
