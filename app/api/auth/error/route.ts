import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Get error parameters from URL
  const searchParams = new URL(request.url).searchParams
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  // Log the error for debugging
  console.error("Auth error:", { error, errorDescription, url: request.url })

  // Create redirect URL to the error page
  const baseUrl = new URL(request.url).origin
  const redirectUrl = new URL("/auth/error", baseUrl)

  // Add error parameters to the redirect URL
  if (error) redirectUrl.searchParams.set("error", error)
  if (errorDescription) redirectUrl.searchParams.set("error_description", errorDescription)

  // Redirect to the error page
  return NextResponse.redirect(redirectUrl)
}

export async function POST(request: NextRequest) {
  return GET(request)
}
