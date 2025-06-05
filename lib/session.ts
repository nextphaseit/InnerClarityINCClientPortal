import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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
  const user = await requireAuth("/unauthorized?reason=admin_required")

  if (user.role !== "admin") {
    redirect("/unauthorized?reason=admin_required")
  }

  return user
}

export async function requirePatientAuth() {
  const user = await requireAuth("/unauthorized?reason=patient_required")

  if (user.role !== "patient") {
    redirect("/unauthorized?reason=patient_required")
  }

  return user
}
