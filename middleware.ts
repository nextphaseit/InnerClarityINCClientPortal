import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/", "/register", "/auth/signin", "/auth/error", "/auth/callback", "/unauthorized", "/not-found"]

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
    // Redirect unauthenticated users based on the route they're trying to access
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/api/auth/signin/azure-ad", request.url))
    } else if (
      pathname.startsWith("/appointments") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/forms") ||
      pathname.startsWith("/profile")
    ) {
      return NextResponse.redirect(new URL("/api/auth/signin/auth0", request.url))
    } else {
      // Default to Auth0 for other protected routes
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  // Role-based access control for authenticated users
  if (token) {
    // Admin routes - require admin role and Azure AD authentication
    if (pathname.startsWith("/admin")) {
      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
      // Optionally check for Azure AD provider
      if (token.provider && token.provider !== "azure-ad" && token.provider !== "credentials") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }

    // Patient routes - require patient role
    if (
      pathname.startsWith("/appointments") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/documents") ||
      pathname.startsWith("/forms") ||
      pathname.startsWith("/profile")
    ) {
      if (token.role !== "patient") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }

    // Add tenant information to headers for API routes
    if (pathname.startsWith("/api") && token.tenantId) {
      response.headers.set("X-Tenant-ID", token.tenantId as string)
    }

    // Redirect authenticated users away from auth pages
    if (pathname === "/" || pathname === "/auth/signin" || pathname === "/register") {
      if (token.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      } else if (token.role === "patient") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
  }

  return response
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
