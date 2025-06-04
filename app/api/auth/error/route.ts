import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get("error") || "unknown_error"

    // Map error codes to messages
    const errorMessages: Record<string, string> = {
      AccessDenied: "You do not have permission to access this resource",
      Verification: "The verification link is invalid or has expired",
      OAuthSignin: "Error in the OAuth sign-in process",
      OAuthCallback: "Error in the OAuth callback process",
      OAuthCreateAccount: "Error creating OAuth account",
      EmailCreateAccount: "Error creating email account",
      Callback: "Error in the callback handler",
      OAuthAccountNotLinked: "This email is already associated with another account",
      EmailSignin: "Error sending the email verification link",
      CredentialsSignin: "Invalid credentials",
      SessionRequired: "Authentication required",
      default: "An unknown error occurred during authentication",
    }

    // Always return a valid JSON response
    return NextResponse.json({
      error: error,
      message: errorMessages[error] || errorMessages.default,
    })
  } catch (error) {
    console.error("Auth error API error:", error)

    // Return a valid JSON error response even if something fails
    return NextResponse.json(
      {
        error: "internal_error",
        message: "An internal server error occurred",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return NextResponse.json(
    {
      error: "method_not_allowed",
      message: "This endpoint only supports GET requests",
    },
    { status: 405 },
  )
}
