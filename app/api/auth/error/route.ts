import { NextResponse } from "next/server"

// This is a simple API route that redirects to the error page
export async function GET(request: Request) {
  try {
    // Get the URL and search parameters
    const url = new URL(request.url)
    const error = url.searchParams.get("error")
    const errorDescription = url.searchParams.get("error_description")

    // Log the error for debugging
    console.log("Auth error redirect:", { error, errorDescription })

    // Build the redirect URL
    const baseUrl = url.origin
    const redirectUrl = new URL("/auth/error", baseUrl)

    // Add the error parameters to the redirect URL
    if (error) {
      redirectUrl.searchParams.set("error", error)
    }
    if (errorDescription) {
      redirectUrl.searchParams.set("error_description", errorDescription)
    }

    // Return a redirect response
    return NextResponse.redirect(redirectUrl.toString())
  } catch (err) {
    console.error("Error in auth error handler:", err)

    // Fallback redirect to the error page without parameters
    const baseUrl = new URL(request.url).origin
    return NextResponse.redirect(`${baseUrl}/auth/error?error=UnknownError`)
  }
}

// Handle POST requests the same way
export async function POST(request: Request) {
  return GET(request)
}
