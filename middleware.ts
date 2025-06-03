import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath = path === "/" || path === "/auth/signin" || path === "/auth/error"

  // Check if the user is authenticated
  const token = await getToken({
    req: request,
    secret: "TEMPORARY-SECRET-FOR-DEVELOPMENT", // Must match the secret in auth.ts
  })

  const isAuth = !!token

  // Redirect logic
  if (isPublicPath && isAuth) {
    // If user is on a public path and is authenticated, redirect to appropriate dashboard
    return NextResponse.redirect(new URL(token.role === "admin" ? "/admin" : "/dashboard", request.url))
  }

  if (!isPublicPath && !isAuth) {
    // If user is on a protected path and is not authenticated, redirect to signin
    const callbackUrl = encodeURIComponent(path)
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url))
  }

  // Role-based access control
  if (path.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (
    (path.startsWith("/dashboard") ||
      path.startsWith("/appointments") ||
      path.startsWith("/messages") ||
      path.startsWith("/documents") ||
      path.startsWith("/billing") ||
      path.startsWith("/forms")) &&
    token?.role === "admin"
  ) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /images (static files)
     * 4. /favicon.ico (favicon file)
     */
    "/((?!api|_next|images|favicon.ico).*)",
  ],
}
