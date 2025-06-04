import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Add security headers for HIPAA compliance
    const response = NextResponse.next()
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    if (process.env.NODE_ENV === "production") {
      response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    }

    // Admin routes - require admin role and Azure AD authentication
    if (pathname.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/api/auth/signin/azure-ad", req.url))
      }
      if (token.role !== "admin" || token.provider !== "azure-ad") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Patient routes - require patient role and Auth0 authentication
    if (
      pathname.startsWith("/appointments") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/forms") ||
      pathname.startsWith("/profile")
    ) {
      if (!token) {
        return NextResponse.redirect(new URL("/api/auth/signin/auth0", req.url))
      }
      if (token.role !== "patient") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Add tenant information to headers for API routes
    if (pathname.startsWith("/api") && token?.tenantId) {
      response.headers.set("X-Tenant-ID", token.tenantId)
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public paths that don't require authentication
        const publicPaths = [
          "/",
          "/register",
          "/auth/signin",
          "/auth/error",
          "/auth/callback",
          "/unauthorized",
          "/not-found",
        ]

        // API paths that don't require authentication
        const publicApiPaths = ["/api/auth", "/api/register", "/api/health", "/api/stripe/webhook"]

        // Check if path is public
        if (publicPaths.some((path) => pathname === path || pathname.startsWith(path))) {
          return true
        }

        // Check if API path is public
        if (publicApiPaths.some((path) => pathname.startsWith(path))) {
          return true
        }

        // Static files and Next.js internals
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/images") ||
          pathname.startsWith("/favicon") ||
          pathname.includes(".")
        ) {
          return true
        }

        // All other paths require authentication
        return !!token
      },
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|images|public).*)",
  ],
}
