import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth(redirectTo = "/auth/signin") {
  const session = await getSession()

  if (!session?.user) {
    redirect(redirectTo)
  }

  return session.user
}

export async function requireAdminAuth() {
  const user = await requireAuth("/auth/signin")

  if (user.role !== "admin") {
    redirect("/unauthorized?reason=admin_required")
  }

  return user
}

// Add the missing requirePatientAuth export
export async function requirePatientAuth() {
  const user = await requireAuth("/auth/signin")

  if (user.role !== "patient" && user.role !== "admin") {
    redirect("/unauthorized?reason=patient_required")
  }

  return user
}

// Microsoft-specific auth requirement
export async function requireMicrosoftAuth() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.provider !== "azure-ad") {
    redirect("/auth/signin?error=microsoft_required")
  }

  if (session.user.role !== "admin") {
    redirect("/unauthorized?reason=admin_required")
  }

  return session.user
}
