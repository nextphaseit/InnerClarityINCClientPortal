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
    "/auth/signup",
    "/auth/login",
    "/auth/reset-password",
    "/auth/update-password",
    "/auth/error",
    "/auth/callback",
    "/admin/login", // Allow access to admin login page
    "/portal/dashboard",
    "/register",
    "/unauthorized",
    "/not-found",
    "/privacy-policy",
    "/terms-of-service",
    "/hipaa-notice",
  ]

  // API paths that don't require authentication
  const publicApiPaths = ["/api/auth", "/api/register", "/api/health", "/api/stripe/webhook"]

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
    // Get the user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    console.log(`🔐 Token status: ${token ? "Present" : "Missing"} for ${pathname}`)
    if (token) {
      console.log(`👤 User: ${token.email}, Role: ${token.role}, Provider: ${token.provider}`)
    }

    // Create response with security headers
    const response = NextResponse.next()

    // Add HIPAA-compliant security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")

    if (process.env.NODE_ENV === "production") {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    }

    // ADMIN ROUTE PROTECTION
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      console.log(`🛡️ Protecting admin route: ${pathname}`)

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

      // Verify authorized email domain
      const email = token.email?.toLowerCase() || ""
      const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
      const domain = email.split("@")[1]

      if (!authorizedDomains.includes(domain)) {
        console.log(`❌ Unauthorized domain (${domain}) trying to access admin route: ${pathname}`)
        return NextResponse.redirect(new URL("/unauthorized?reason=unauthorized_domain", request.url))
      }

      console.log(`✅ Admin access granted to ${token.email} for ${pathname}`)

      // Add admin user information to headers for API routes
      response.headers.set("X-Admin-User-ID", token.sub || "")
      response.headers.set("X-Admin-User-Email", token.email || "")
      response.headers.set("X-Admin-User-Role", "admin")
      response.headers.set("X-Admin-Provider", "azure-ad")
      if (token.tenantId) {
        response.headers.set("X-Admin-Tenant-ID", token.tenantId as string)
      }
    }

    // Patient portal routes protection (if needed)
    if (pathname.startsWith("/portal")) {
      // Add patient-specific protection logic here
      console.log(`🏥 Patient portal access to: ${pathname}`)
    }

    // Redirect authenticated admin users away from login page
    if (pathname === "/admin/login" && token && token.role === "admin" && token.provider === "azure-ad") {
      console.log(`✅ Redirecting authenticated admin to dashboard`)
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }

    return response
  } catch (error) {
    console.error("❌ Middleware error:", error)

    // On error, redirect admin routes to login with error
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
