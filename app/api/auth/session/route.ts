import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json(
      {
        user: {
          id: session.user?.id || "",
          name: session.user?.name || "",
          email: session.user?.email || "",
          role: session.user?.role || "patient",
          tenantId: session.user?.tenantId || "inner-clarity-main",
          provider: session.user?.provider || "credentials",
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json({ error: "Internal server error", user: null }, { status: 500 })
  }
}
