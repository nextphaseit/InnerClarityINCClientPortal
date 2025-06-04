import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`🔒 Middleware - Processing: ${pathname}`)

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/error",
    "/auth/callback",
    "/register",
    "/unauthorized",
    "/not-found",
    "/privacy-policy",
    "/terms-of-service",
    "/hipaa-notice",
  ]

  // API paths that don't require authentication
  const publicApiPaths = ["/api/auth", "/api/register", "/api/health", "/api/stripe/webhook"]

  // Static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    publicPaths.some((path) => pathname === path || pathname.startsWith(path)) ||
    publicApiPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next()
  }

  try {
    // Get the user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    console.log(`🔐 Token status: ${token ? "Present" : "Missing"} for ${pathname}`)

    // Create response with security headers
    const response = NextResponse.next()

    // Add HIPAA-compliant security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

    if (process.env.NODE_ENV === "production") {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    }

    // Check if user is authenticated
    if (!token) {
      console.log(`🚫 Unauthenticated access to: ${pathname}`)

      // Determine appropriate sign-in tab based on route
      let signInUrl = "/auth/signin"

      if (pathname.startsWith("/admin")) {
        signInUrl = "/auth/signin?tab=admin"
      } else if (
        pathname.startsWith("/patient") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/appointments") ||
        pathname.startsWith("/billing") ||
        pathname.startsWith("/messages") ||
        pathname.startsWith("/documents") ||
        pathname.startsWith("/forms") ||
        pathname.startsWith("/profile")
      ) {
        signInUrl = "/auth/signin?tab=patient"
      }

      return NextResponse.redirect(new URL(signInUrl, request.url))
    }

    // Role-based access control for authenticated users
    const userRole = token.role as string
    console.log(`👤 User role: ${userRole} accessing: ${pathname}`)

    // Admin routes - require admin role
    if (pathname.startsWith("/admin")) {
      if (userRole !== "admin") {
        console.log("❌ Access denied: Non-admin trying to access admin route")
        return NextResponse.redirect(new URL("/unauthorized?reason=admin_required", request.url))
      }
    }

    // Patient routes - require patient role (but allow admin access)
    if (
      pathname.startsWith("/patient") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/appointments") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/forms") ||
      pathname.startsWith("/profile")
    ) {
      if (userRole !== "patient" && userRole !== "admin") {
        console.log("❌ Access denied: Unauthorized role for patient route")
        return NextResponse.redirect(new URL("/unauthorized?reason=patient_required", request.url))
      }
    }

    // Add tenant and role information to headers for API routes
    if (pathname.startsWith("/api") && token.tenantId) {
      response.headers.set("X-Tenant-ID", token.tenantId as string)
      response.headers.set("X-User-Role", userRole)
      response.headers.set("X-User-ID", token.sub || "")
    }

    // Redirect authenticated users from auth pages to their dashboard
    if (pathname === "/" || pathname === "/auth/signin") {
      const dashboardUrl = userRole === "admin" ? "/admin" : "/dashboard"
      console.log(`✅ Redirecting authenticated ${userRole} to ${dashboardUrl}`)
      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }

    return response
  } catch (error) {
    console.error("❌ Middleware error:", error)

    // On error, redirect to sign-in with error parameter
    return NextResponse.redirect(new URL("/auth/signin?error=Configuration", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)",
  ],
}
