import { NextResponse } from "next/server"

export function GET() {
  try {
    return NextResponse.json({ error: "Authentication error occurred" }, { status: 400 })
  } catch (error) {
    console.error("Auth error route failed:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
