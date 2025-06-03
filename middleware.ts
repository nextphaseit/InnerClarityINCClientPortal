import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode("your-secret-key-here-make-it-long-and-secure")

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/auth/signin" || path === "/auth/error" || path.startsWith("/api/auth")

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
  }

  const isAuth = !!user

  // Redirect logic
  if (isPublicPath && isAuth) {
    // If user is on a public path and is authenticated, redirect to appropriate dashboard
    return NextResponse.redirect(new URL(user.role === "admin" ? "/admin" : "/dashboard", request.url))
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
      path.startsWith("/forms")) &&
    user?.role === "admin"
  ) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
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
    "/((?!api(?!/auth)|_next|images|favicon.ico).*)",
  ],
}
