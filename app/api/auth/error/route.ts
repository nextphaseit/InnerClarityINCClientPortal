import { NextResponse } from "next/server"

export function GET() {
  return NextResponse.json({ error: "Authentication error occurred" }, { status: 400 })
}
