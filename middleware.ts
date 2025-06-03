import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/register" ||
    path === "/auth/signin" ||
    path === "/auth/error" ||
    path === "/not-found" ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/register") ||
    path.startsWith("/api/health") ||
    path.startsWith("/api/stripe/webhook") ||
    path.startsWith("/_next") ||
    path.startsWith("/images") ||
    path === "/favicon.ico"

  // Get the user's session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "TEMPORARY-SECRET-FOR-DEVELOPMENT",
  })

  const isAuth = !!token

  // Redirect authenticated users away from auth pages
  if (isPublicPath && isAuth && (path === "/" || path === "/auth/signin" || path === "/register")) {
    const redirectUrl = token.role === "admin" ? "/admin" : "/dashboard"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Redirect unauthenticated users to signin
  if (!isPublicPath && !isAuth) {
    const callbackUrl = encodeURIComponent(path)
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url))
  }

  // Role-based access control
  if (isAuth) {
    // Admin routes - only admins can access
    if (path.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Patient routes - only patients can access
    if (
      (path.startsWith("/dashboard") ||
        path.startsWith("/appointments") ||
        path.startsWith("/messages") ||
        path.startsWith("/billing")) &&
      token.role !== "patient"
    ) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  // Add security headers for HIPAA compliance
  const response = NextResponse.next()

  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  // Add tenant information to headers for API routes
  if (path.startsWith("/api") && token?.tenantId) {
    response.headers.set("X-Tenant-ID", token.tenantId)
  }

  return response
}

export const config = {
  matcher: ["/((?!api(?!/auth|/register|/health|/stripe/webhook)|_next|images|favicon.ico).*)"],
}
