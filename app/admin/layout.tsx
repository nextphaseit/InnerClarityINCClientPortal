import type React from "react"
import { requireAdminAuth } from "@/lib/auth-server"
import { AdminLayoutClient } from "@/components/admin-layout-client"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Server-side authentication check - will redirect if not authenticated
  const session = await requireAdminAuth()

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>
}
