import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

    const signInUrl = new URL("/api/auth/signin", request.url)
    signInUrl.searchParams.set("provider", "auth0")
    signInUrl.searchParams.set("callbackUrl", callbackUrl)

    return NextResponse.redirect(signInUrl)
  } catch (error) {
    console.error("Auth0 signin route error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=Configuration", request.url))
  }
}
