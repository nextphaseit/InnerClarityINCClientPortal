import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/register",
    "/auth/signin",
    "/auth/error",
    "/auth/callback",
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

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  console.log(`🔒 Middleware - Path: ${pathname}, Token: ${token ? "Present" : "Missing"}`)

  // Create response with security headers
  const response = NextResponse.next()

  // Add security headers for HIPAA compliance
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  // Check if user is authenticated
  if (!token) {
    console.log(`🚫 Unauthenticated access attempt to: ${pathname}`)

    // Redirect unauthenticated users based on the route they're trying to access
    if (pathname.startsWith("/admin")) {
      console.log("Redirecting to Microsoft login for admin route")
      return NextResponse.redirect(new URL("/auth/signin?tab=admin", request.url))
    } else if (
      pathname.startsWith("/patient") ||
      pathname.startsWith("/appointments") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/forms") ||
      pathname.startsWith("/profile")
    ) {
      console.log("Redirecting to Auth0 login for patient route")
      return NextResponse.redirect(new URL("/auth/signin?tab=patient", request.url))
    } else {
      // Default to sign-in page
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  // Role-based access control for authenticated users
  if (token) {
    console.log(`👤 User role: ${token.role}, accessing: ${pathname}`)

    // Admin routes - require admin role
    if (pathname.startsWith("/admin")) {
      if (token.role !== "admin") {
        console.log("❌ Access denied: Patient trying to access admin route")
        return NextResponse.redirect(new URL("/unauthorized?reason=admin_required", request.url))
      }
    }

    // Patient routes - require patient role
    if (
      pathname.startsWith("/patient") ||
      pathname.startsWith("/appointments") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/messages")
    ) {
      if (token.role !== "patient") {
        console.log("❌ Access denied: Admin trying to access patient route")
        return NextResponse.redirect(new URL("/unauthorized?reason=patient_required", request.url))
      }
    }

    // Dashboard redirect logic
    if (pathname === "/dashboard") {
      if (token.role === "admin") {
        console.log("🔄 Redirecting admin to admin dashboard")
        return NextResponse.redirect(new URL("/admin", request.url))
      } else if (token.role === "patient") {
        console.log("🔄 Redirecting patient to patient dashboard")
        return NextResponse.redirect(new URL("/patient/dashboard", request.url))
      }
    }

    // Tenant isolation for multi-tenant setup
    if (token.tenantId) {
      response.headers.set("X-Tenant-ID", token.tenantId as string)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
