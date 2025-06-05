import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.nextUrl.hostname

  console.log(`🔒 Middleware - Processing: ${pathname} on ${hostname}`)

  // Determine if this is admin or patient domain
  const isAdminDomain = hostname.includes("admin") || (hostname.includes("localhost") && pathname.startsWith("/admin"))
  const isPatientDomain =
    hostname.includes("patients") || (hostname.includes("localhost") && pathname.startsWith("/portal"))

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/auth/error",
    "/auth/reset-password",
    "/portal/auth/signin",
    "/portal/auth/signup",
    "/portal/auth/reset-password",
    "/admin/login",
    "/unauthorized",
    "/not-found",
    "/privacy-policy",
    "/terms-of-service",
    "/hipaa-notice",
  ]

  // API paths that don't require authentication
  const publicApiPaths = ["/api/auth", "/api/health"]

  // Static files and Next.js internals - allow through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") ||
    publicPaths.some((path) => pathname === path) ||
    publicApiPaths.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.next()
  }

  try {
    // ADMIN DOMAIN PROTECTION
    if (isAdminDomain && pathname.startsWith("/admin")) {
      console.log(`🛡️ Protecting admin route: ${pathname} on admin domain`)

      // Get the user's session token for admin routes
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      })

      console.log(`🔐 Admin token status: ${token ? "Present" : "Missing"} for ${pathname}`)

      // Check if user is authenticated
      if (!token) {
        console.log(`🚫 Unauthenticated admin access attempt to: ${pathname}`)
        return NextResponse.redirect(new URL("/admin/login?error=authentication_required", request.url))
      }

      // Check if user has admin role
      if (token.role !== "admin") {
        console.log(`❌ Non-admin user (${token.role}) trying to access admin route: ${pathname}`)
        return NextResponse.redirect(new URL("/unauthorized?reason=admin_required", request.url))
      }

      // Verify Microsoft authentication
      if (token.provider !== "azure-ad") {
        console.log(`❌ Non-Microsoft auth (${token.provider}) trying to access admin route: ${pathname}`)
        return NextResponse.redirect(new URL("/admin/login?error=microsoft_required", request.url))
      }

      console.log(`✅ Admin access granted to ${token.email} for ${pathname}`)
    }

    // PATIENT DOMAIN PROTECTION
    if (isPatientDomain && pathname.startsWith("/portal") && !pathname.startsWith("/portal/auth")) {
      console.log(`🏥 Patient route accessed: ${pathname} on patient domain`)

      // For patient routes, we'll let the client-side auth handle redirects
      // since Supabase auth is client-side. The middleware won't block these routes.
      // The PatientLayoutClient will handle authentication checks and redirects.

      // Just add security headers and continue
      const response = NextResponse.next()
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-Content-Type-Options", "nosniff")
      return response
    }

    // DOMAIN SEPARATION - Redirect if on wrong domain
    if (isAdminDomain && pathname.startsWith("/portal")) {
      console.log(`🔄 Redirecting portal route from admin domain to patient domain`)
      return NextResponse.redirect(new URL(`https://patients.nextphaseit.org${pathname}`, request.url))
    }

    if (isPatientDomain && pathname.startsWith("/admin")) {
      console.log(`🔄 Redirecting admin route from patient domain to admin domain`)
      return NextResponse.redirect(new URL(`https://admin.nextphaseit.org${pathname}`, request.url))
    }

    const response = NextResponse.next()

    // Add security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    return response
  } catch (error) {
    console.error("❌ Middleware error:", error)

    // On error, redirect admin routes to login
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login?error=configuration_error", request.url))
    }

    return NextResponse.next()
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
