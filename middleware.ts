import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/auth/reset-password",
    "/auth/error",
    "/api/auth",
    "/about",
    "/services",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/hipaa-notice",
    "/portal/auth/signin",
    "/portal/auth/signup",
    "/admin/login",
  ]

  // Allow public paths and static files
  if (
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Handle ADMIN routes with NextAuth
  if (pathname.startsWith("/admin")) {
    console.log("🔒 Checking admin authentication for:", pathname)

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      console.log("❌ No admin token found, redirecting to admin login")
      const url = new URL("/admin/login", request.url)
      url.searchParams.set("callbackUrl", request.url)
      return NextResponse.redirect(url)
    }

    // Check if user has admin role
    if (token.role !== "admin") {
      console.log("❌ User is not admin, redirecting to unauthorized")
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }

    console.log("✅ Admin authentication successful for:", token.email)
  }

  // Handle PATIENT PORTAL routes with Supabase Auth
  if (pathname.startsWith("/portal") && !pathname.startsWith("/portal/auth")) {
    // Get Supabase session from cookies
    const supabaseToken =
      request.cookies.get("sb-access-token")?.value || request.cookies.get("supabase-auth-token")?.value

    // Check for Supabase session in various cookie formats
    const hasSupabaseSession = request.cookies
      .getAll()
      .some(
        (cookie) =>
          cookie.name.includes("supabase") || cookie.name.includes("sb-") || cookie.name === "supabase.auth.token",
      )

    if (!hasSupabaseSession && !supabaseToken) {
      const url = new URL("/portal/auth/signin", request.url)
      url.searchParams.set("callbackUrl", request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
