import { supabase } from "./supabase"
import { redirect } from "next/navigation"

export interface UserProfile {
  id: string
  full_name: string
  email: string
  role: "patient" | "admin" | "super_admin"
  avatar_url?: string
  created_at: string
  status: "active" | "inactive" | "suspended"
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error || !profile) {
      return null
    }

    return profile
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth(requiredRole?: "admin" | "super_admin") {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  if (!["admin", "super_admin"].includes(user.role)) {
    redirect("/unauthorized")
  }

  if (requiredRole === "super_admin" && user.role !== "super_admin") {
    redirect("/unauthorized")
  }

  return user
}

export async function logAuditEvent(action: string, resource: string, resourceId?: string, details?: any) {
  try {
    const user = await getCurrentUser()
    if (!user) return

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      resource,
      resource_id: resourceId,
      details,
      ip_address: "", // Would be populated from request in real app
      user_agent: "", // Would be populated from request in real app
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error logging audit event:", error)
  }
}
