import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // This is a test route to verify error handling
    return NextResponse.json({
      message: "Test API route is working",
      timestamp: new Date().toISOString(),
      url: request.url,
    })
  } catch (error) {
    console.error("Test error route failed:", error)
    return NextResponse.json({ error: "Test failed", message: String(error) }, { status: 500 })
  }
}
