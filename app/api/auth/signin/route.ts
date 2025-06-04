import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const provider = searchParams.get("provider") || "auth0"
    const callbackUrl = searchParams.get("callbackUrl") || "/"

    // Redirect to appropriate auth provider
    if (provider === "auth0") {
      return NextResponse.redirect(
        new URL(`/auth/signin?provider=auth0&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url),
      )
    } else if (provider === "azure-ad") {
      return NextResponse.redirect(
        new URL(`/auth/signin?provider=azure-ad&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url),
      )
    }

    // Default to auth0
    return NextResponse.redirect(
      new URL(`/auth/signin?provider=auth0&callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url),
    )
  } catch (error) {
    console.error("Auth signin route error:", error)
    return NextResponse.redirect(new URL("/auth/error?error=Configuration", request.url))
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider = "auth0", callbackUrl = "/" } = body

    // Handle sign-in logic here
    return NextResponse.json({ success: true, provider, callbackUrl })
  } catch (error) {
    console.error("Auth signin POST error:", error)
    return NextResponse.json({ error: "Sign-in failed" }, { status: 500 })
  }
}
