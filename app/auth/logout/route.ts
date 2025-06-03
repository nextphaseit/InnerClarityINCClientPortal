import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect to NextAuth signout
  return NextResponse.redirect(new URL("/api/auth/signout", request.url))
}
