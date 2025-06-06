import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("Auth error route accessed:", request.url)

  try {
    // Parse URL safely
    const url = new URL(request.url)
    const error = url.searchParams.get("error") || "UnknownError"
    const errorDescription = url.searchParams.get("error_description") || "An authentication error occurred"

    console.log("Auth error params:", { error, errorDescription })

    // Build redirect URL step by step
    const origin = url.origin
    const redirectPath = "/auth/error"
    const redirectUrl = new URL(redirectPath, origin)

    // Add search params safely
    redirectUrl.searchParams.set("error", String(error))
    redirectUrl.searchParams.set("error_description", String(errorDescription))

    console.log("Redirecting to:", redirectUrl.toString())

    // Use NextResponse.redirect with proper status
    return NextResponse.redirect(redirectUrl.toString(), { status: 302 })
  } catch (error) {
    console.error("Auth error route failed:", error)

    // Return a simple HTML response as fallback
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Authentication Error</h1>
          <p>An error occurred during authentication.</p>
          <a href="/auth/signin" style="color: blue; text-decoration: underline;">Try signing in again</a>
          <br><br>
          <a href="/" style="color: blue; text-decoration: underline;">Return to home</a>
        </body>
      </html>
    `

    return new Response(html, {
      status: 400,
      headers: {
        "Content-Type": "text/html",
      },
    })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
