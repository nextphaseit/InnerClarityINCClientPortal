import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const error = searchParams.get("error")

  // Log the authentication error
  console.error("Authentication error occurred:", error)

  // Redirect to the error page with the error parameter
  const redirectUrl = new URL("/auth/error", request.url)
  if (error) {
    redirectUrl.searchParams.set("error", error)
  }

  return NextResponse.redirect(redirectUrl)
}

export async function POST(request: NextRequest) {
  return GET(request)
}
