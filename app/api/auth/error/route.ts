import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
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
    const redirectUrl = new URL("/auth/error", request.url)

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
    const fallbackUrl = new URL("/auth/signin", request.url)
    fallbackUrl.searchParams.set("error", "AuthError")

    return NextResponse.redirect(fallbackUrl)
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
