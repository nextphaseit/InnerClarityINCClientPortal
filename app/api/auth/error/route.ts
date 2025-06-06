import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    // Log the authentication error for debugging
    console.error("Authentication error occurred:", {
      error,
      errorDescription,
      url: request.url,
      timestamp: new Date().toISOString(),
    })

    // Create the redirect URL to the error page
    const baseUrl = new URL(request.url).origin
    const redirectUrl = new URL("/auth/error", baseUrl)

    if (error) {
      redirectUrl.searchParams.set("error", error)
    }

    if (errorDescription) {
      redirectUrl.searchParams.set("error_description", errorDescription)
    }

    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error("Error in auth error handler:", err)

    // Fallback redirect to sign-in page
    const baseUrl = new URL(request.url).origin
    const fallbackUrl = new URL("/auth/signin", baseUrl)
    fallbackUrl.searchParams.set("error", "AuthError")

    return NextResponse.redirect(fallbackUrl)
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
