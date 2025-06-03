import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "your-secret-key-here-make-it-long-and-secure")

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/auth/signin" ||
    path === "/auth/error" ||
    path === "/not-found" ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/health") ||
    path.startsWith("/api/stripe/webhook") ||
    path.startsWith("/_next") ||
    path.startsWith("/images") ||
    path === "/favicon.ico"

  // Check if the user is authenticated
  let user = null
  try {
    const token = request.cookies.get("session")?.value
    if (token) {
      const { payload } = await jwtVerify(token, secret)
      user = payload
    }
  } catch (error) {
    // Invalid token, user is not authenticated
    console.error("Token verification failed:", error)
  }

  const isAuth = !!user

  // Redirect logic
  if (isPublicPath && isAuth && (path === "/" || path === "/auth/signin")) {
    // If user is on public auth pages and is authenticated, redirect to appropriate dashboard
    const redirectUrl = user.role === "admin" ? "/admin" : "/dashboard"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  if (!isPublicPath && !isAuth) {
    // If user is on a protected path and is not authenticated, redirect to signin
    const callbackUrl = encodeURIComponent(path)
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url))
  }

  // Role-based access control
  if (path.startsWith("/admin") && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (
    (path.startsWith("/dashboard") ||
      path.startsWith("/appointments") ||
      path.startsWith("/messages") ||
      path.startsWith("/documents") ||
      path.startsWith("/billing") ||
      path.startsWith("/forms") ||
      path.startsWith("/profile") ||
      path.startsWith("/settings")) &&
    user?.role === "admin"
  ) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // Add security headers
  const response = NextResponse.next()

  // HIPAA compliance headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes (except /api/auth)
     * 2. /_next (Next.js internals)
     * 3. /images (static files)
     * 4. /favicon.ico (favicon file)
     */
    "/((?!api(?!/auth|/health|/stripe/webhook)|_next|images|favicon.ico).*)",
  ],
}
