"use client"

import type React from "react"
import { useState, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Calendar, MessageSquare, FileText, Shield, Bell, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUnreadMessages } from "@/hooks/use-unread-messages"
import { supabase } from "@/lib/supabase"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/admin/clients",
    icon: Users,
  },
  {
    name: "Appointments",
    href: "/admin/appointments",
    icon: Calendar,
  },
  {
    name: "Forms",
    href: "/admin/forms",
    icon: FileText,
  },
  {
    name: "Documents",
    href: "/admin/documents",
    icon: FileText,
  },
  {
    name: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
    showBadge: true,
  },
  {
    name: "Files",
    href: "/admin/files",
    icon: FileText,
  },
  {
    name: "Audit Log",
    href: "/admin/audit",
    icon: Shield,
  },
]

interface AdminLayoutClientProps {
  children: React.ReactNode
  session: any
}

export function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Get unread message count for admin
  const { unreadCount } = useUnreadMessages({
    user: session.user,
    userRole: "admin",
  })

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={toggleMobileMenu} className="bg-white shadow-lg">
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={closeMobileMenu} />}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 shadow-xl
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Admin Header */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded"></div>
            </div>
            <h1 className="text-lg font-bold text-white">Admin Portal</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            const showBadge = item.showBadge && unreadCount > 0

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}
                  `}
                />
                <span className="flex-1">{item.name}</span>
                {showBadge && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session.user.name || session.user.email}</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-64 min-h-screen">
        {/* Top bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center space-x-4 lg:ml-0 ml-12">
            <h2 className="text-lg font-semibold text-gray-900">Inner Clarity Admin Portal</h2>
          </div>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600">Welcome, {session.user.name || session.user.email}</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Microsoft Authenticated
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  )
}
