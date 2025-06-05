import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.nextUrl.hostname

  // Check if this is admin domain
  const isAdminDomain = hostname.includes("admin") || hostname === "localhost"

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/auth/error",
    "/portal/auth/signin",
    "/portal/auth/signup",
    "/admin/login",
  ]

  // Static files and public paths - allow through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") ||
    publicPaths.includes(pathname)
  ) {
    return NextResponse.next()
  }

  try {
    // ADMIN ROUTE PROTECTION
    if (pathname.startsWith("/admin")) {
      // Only allow admin routes on admin domain
      if (!isAdminDomain) {
        return NextResponse.redirect(new URL("https://admin.nextphaseit.org/admin/login", request.url))
      }

      // Get the user's session token
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      })

      // Check if user is authenticated
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }

      // Check if user has admin role
      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }

    // PATIENT PORTAL PROTECTION
    if (pathname.startsWith("/portal") && !pathname.startsWith("/portal/auth")) {
      // Patient routes use client-side auth with Supabase
      // Just add security headers
      const response = NextResponse.next()
      response.headers.set("X-Frame-Options", "DENY")
      response.headers.set("X-Content-Type-Options", "nosniff")
      return response
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
