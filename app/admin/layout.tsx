import type React from "react"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { SessionProvider } from "next-auth/react"
import AdminSidebar from "@/components/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get session on the server side
  const session = await getServerSession(authOptions)

  // Double-check authentication on the server side
  if (!session) {
    console.log("🔒 No admin session found in layout, redirecting to signin...")
    redirect("/auth/signin?tab=admin")
  }

  // Check if user has admin role
  if (!session.user?.role?.includes("admin")) {
    console.log("🚫 User is not admin, redirecting to unauthorized...")
    redirect("/unauthorized")
  }

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}
