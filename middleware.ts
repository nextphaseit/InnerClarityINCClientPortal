import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")
  const isClientPage =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/appointments") ||
    request.nextUrl.pathname.startsWith("/messages") ||
    request.nextUrl.pathname.startsWith("/documents") ||
    request.nextUrl.pathname.startsWith("/billing") ||
    request.nextUrl.pathname.startsWith("/forms")

  if (isAuthPage) {
    if (isAuth) {
      // Redirect authenticated users away from auth pages
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }
    return NextResponse.next()
  }

  if (!isAuth && (isAdminPage || isClientPage)) {
    // Redirect unauthenticated users to sign in
    let from = request.nextUrl.pathname
    if (request.nextUrl.search) {
      from += request.nextUrl.search
    }

    return NextResponse.redirect(new URL(`/auth/signin?from=${encodeURIComponent(from)}`, request.url))
  }

  if (isAdminPage && token?.role !== "admin") {
    // Redirect non-admin users away from admin pages
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (isClientPage && token?.role === "admin") {
    // Redirect admin users away from client pages
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/appointments/:path*",
    "/messages/:path*",
    "/documents/:path*",
    "/billing/:path*",
    "/forms/:path*",
    "/auth/:path*",
  ],
}
