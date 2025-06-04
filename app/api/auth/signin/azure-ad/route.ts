import { type NextRequest, NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const callbackUrl = searchParams.get("callbackUrl") || "/admin"

    const signInUrl = new URL("/api/auth/signin", request.url)
    signInUrl.searchParams.set("provider", "azure-ad")
    signInUrl.searchParams.set("callbackUrl", callbackUrl)

    return NextResponse.redirect(signInUrl)
  } catch (error) {
    console.error("Azure AD signin route error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=Configuration", request.url))
  }
}
