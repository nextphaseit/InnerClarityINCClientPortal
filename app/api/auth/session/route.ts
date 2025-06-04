import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Always return a valid JSON response
    return NextResponse.json({
      user: session?.user || null,
      expires: session?.expires || null,
    })
  } catch (error) {
    console.error("Session API error:", error)

    // Return a valid JSON error response
    return NextResponse.json(
      { error: "Failed to get session", message: "An error occurred while retrieving the session" },
      { status: 500 },
    )
  }
}
