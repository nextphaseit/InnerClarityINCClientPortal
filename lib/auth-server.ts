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

/**
 * Get the current admin session on the server side
 * Returns null if no valid admin session exists
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      console.log("❌ No session found")
      return null
    }

    // Check if user has admin role
    if (session.user?.role !== "admin") {
      console.log(`❌ User ${session.user?.email} does not have admin role: ${session.user?.role}`)
      return null
    }

    // Check if authenticated via Microsoft
    if (session.provider !== "azure-ad") {
      console.log(`❌ User ${session.user?.email} not authenticated via Microsoft: ${session.provider}`)
      return null
    }

    // Verify email domain
    const email = session.user?.email?.toLowerCase() || ""
    const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
    const domain = email.split("@")[1]

    if (!authorizedDomains.includes(domain)) {
      console.log(`❌ User ${email} from unauthorized domain: ${domain}`)
      return null
    }

    console.log(`✅ Valid admin session for ${session.user?.email}`)
    return session as AdminSession
  } catch (error) {
    console.error("❌ Error checking admin session:", error)
    return null
  }
}

/**
 * Require admin authentication - redirects if not authenticated
 * Use this in admin page components
 */
export async function requireAdminAuth(): Promise<AdminSession> {
  const session = await getAdminSession()

  if (!session) {
    console.log("🔄 Redirecting unauthenticated user to admin login")
    redirect("/admin/login")
  }

  return session
}

/**
 * Check if current user is an authenticated admin
 * Returns boolean without redirecting
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}
