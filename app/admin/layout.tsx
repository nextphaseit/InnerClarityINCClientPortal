import type React from "react"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import AdminAuthProvider from "@/components/admin-auth-provider"
import { AdminLayoutClient } from "@/components/admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get session on the server side
  const session = await getServerSession(authOptions)

  // Redirect if no session
  if (!session) {
    console.log("🔒 No admin session found, redirecting to signin...")
    redirect("/auth/signin")
  }

  // Check if user has admin role
  if (!session.user?.role?.includes("admin")) {
    console.log("🚫 User is not admin, redirecting to unauthorized...")
    redirect("/unauthorized")
  }

  return (
    <AdminAuthProvider session={session}>
      <AdminLayoutClient session={session}>{children}</AdminLayoutClient>
    </AdminAuthProvider>
  )
}
