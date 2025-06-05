import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import type { Session } from "next-auth"

export interface AdminSession extends Session {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: "admin"
    tenantId: string
  }
  provider: string
  accessToken: string
}

export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  return session
}

export async function requireAdminAuth() {
  const session = await requireAuth()

  if (session.user?.role !== "admin") {
    redirect("/unauthorized")
  }

  return session
}
