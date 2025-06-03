import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Safely extract search params
    let error: string | null = null

    try {
      const url = new URL(request.url)
      error = url.searchParams.get("error")
    } catch (urlError) {
      console.error("Failed to parse URL:", urlError)
      error = "url_parse_error"
    }

    // Log for debugging
    console.log("Processing auth error:", error)

    // Create response data
    const responseData = {
      error: error || "unknown_error",
      message: getErrorMessage(error),
      timestamp: new Date().toISOString(),
    }

    // Return response with explicit error handling
    return new NextResponse(JSON.stringify(responseData), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })
  } catch (err) {
    // Handle any unexpected errors
    console.error("Auth error route exception:", err)

    try {
      const fallbackResponse = {
        error: "internal_server_error",
        message: "An unexpected error occurred while processing the authentication error",
        timestamp: new Date().toISOString(),
      }

      return new NextResponse(JSON.stringify(fallbackResponse), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      })
    } catch (finalError) {
      // Last resort fallback
      console.error("Final fallback error:", finalError)
      return new NextResponse("Internal Server Error", { status: 500 })
    }
  }
}

function getErrorMessage(error: string | null): string {
  try {
    if (!error) return "An authentication error occurred"

    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration"
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in"
      case "Verification":
        return "The verification token has expired or has already been used"
      case "CredentialsSignin":
        return "Invalid email or password. Please check your credentials and try again"
      case "OAuthSignin":
        return "Error occurred during OAuth sign in"
      case "OAuthCallback":
        return "Error occurred during OAuth callback"
      case "OAuthCreateAccount":
        return "Could not create OAuth account"
      case "EmailSignin":
        return "Unable to send sign-in email. Please try again later"
      case "SessionRequired":
        return "Please sign in to access this page"
      case "url_parse_error":
        return "Invalid request format"
      default:
        return "An unexpected authentication error occurred. Please try again"
    }
  } catch (err) {
    console.error("Error in getErrorMessage:", err)
    return "Authentication error occurred"
  }
}

// Handle other HTTP methods
export async function POST() {
  return new NextResponse("Method not allowed", { status: 405 })
}

export async function PUT() {
  return new NextResponse("Method not allowed", { status: 405 })
}

export async function DELETE() {
  return new NextResponse("Method not allowed", { status: 405 })
}
