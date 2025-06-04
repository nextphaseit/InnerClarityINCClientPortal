import { type NextRequest, NextResponse } from "next/server"
import { authenticate, createSession } from "@/lib/auth-custom"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await authenticate(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    await createSession(user)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Handle GET requests for signin page
    const url = new URL(request.url)
    const callbackUrl = url.searchParams.get("callbackUrl") || "/dashboard"
    const error = url.searchParams.get("error")

    // Redirect to the signin page with parameters
    const signinUrl = new URL("/auth/signin", request.url)
    if (callbackUrl) {
      signinUrl.searchParams.set("callbackUrl", callbackUrl)
    }
    if (error) {
      signinUrl.searchParams.set("error", error)
    }

    return NextResponse.redirect(signinUrl)
  } catch (error) {
    console.error("Signin GET error:", error)
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }
}
