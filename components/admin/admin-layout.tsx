"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"

interface AdminLayoutProps {
  children: React.ReactNode
  requiredRole?: "admin" | "super_admin"
}

export function AdminLayout({ children, requiredRole = "admin" }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/signin")
        return
      }

      if (!["admin", "super_admin"].includes(user.role)) {
        router.push("/unauthorized")
        return
      }

      if (requiredRole === "super_admin" && user.role !== "super_admin") {
        router.push("/unauthorized")
        return
      }
    }
  }, [user, loading, router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading admin portal...</p>
        </div>
      </div>
    )
  }

  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <AdminHeader sidebarCollapsed={sidebarCollapsed} />

      <main
        className={`
        transition-all duration-300 ease-in-out pt-16
        ${sidebarCollapsed ? "ml-16" : "ml-64"}
      `}
      >
        <div className="p-6">{children}</div>
      </main>

      <Toaster />
    </div>
  )
}
