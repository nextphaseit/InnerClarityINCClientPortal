import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Extract error from query params
    const { searchParams } = new URL(request.url)
    const error = searchParams.get("error")

    // Create a structured error response
    const errorResponse = {
      status: "error",
      code: error || "unknown_error",
      message: getErrorMessage(error),
      timestamp: new Date().toISOString(),
    }

    // Return as JSON with appropriate status code
    return NextResponse.json(errorResponse, { status: 400 })
  } catch (err) {
    console.error("Auth error route failed:", err)

    // Return a fallback error response
    return NextResponse.json(
      {
        status: "error",
        code: "internal_error",
        message: "An unexpected error occurred processing the authentication error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Helper function to get human-readable error messages
function getErrorMessage(error: string | null): string {
  switch (error) {
    case "Configuration":
      return "There is a problem with the server configuration."
    case "AccessDenied":
      return "Access denied. You do not have permission to sign in."
    case "Verification":
      return "The verification token has expired or has already been used."
    case "CredentialsSignin":
      return "Invalid email or password. Please check your credentials and try again."
    case "OAuthSignin":
      return "Error occurred during OAuth sign in."
    case "OAuthCallback":
      return "Error occurred during OAuth callback."
    case "OAuthCreateAccount":
      return "Could not create OAuth account."
    case "EmailSignin":
      return "Unable to send sign-in email. Please try again later."
    case "SessionRequired":
      return "Please sign in to access this page."
    case "Default":
    default:
      return "An unexpected authentication error occurred. Please try again."
  }
}
