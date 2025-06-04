import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Handle sign-out logic here
    // In a real implementation, you would clear the session/cookies

    const response = NextResponse.json({ success: true })

    // Clear any auth cookies
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("__Secure-next-auth.session-token")
    response.cookies.delete("next-auth.csrf-token")
    response.cookies.delete("__Host-next-auth.csrf-token")

    return response
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "Sign-out failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Redirect GET requests to POST for sign-out
  return NextResponse.redirect(new URL("/", request.url))
}
