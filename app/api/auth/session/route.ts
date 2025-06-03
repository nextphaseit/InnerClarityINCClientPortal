import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json(
      {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          tenantId: session.user.tenantId,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json(
      {
        user: null,
        error: "Session check failed",
      },
      { status: 200 },
    )
  }
}
