"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  User,
  Calendar,
  CreditCard,
  MessageSquare,
  FileText,
  FolderOpen,
  CalendarDays,
  Activity,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePatientAuth } from "@/components/patient-auth-provider"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    href: "/portal/profile",
    icon: User,
  },
  {
    name: "Appointments",
    href: "/portal/appointments",
    icon: Calendar,
  },
  {
    name: "Billing",
    href: "/portal/billing",
    icon: CreditCard,
  },
  {
    name: "Messages",
    href: "/portal/messages",
    icon: MessageSquare,
    showBadge: true,
  },
  {
    name: "Forms",
    href: "/portal/forms",
    icon: FileText,
  },
  {
    name: "Documents",
    href: "/portal/documents",
    icon: FolderOpen,
  },
  {
    name: "Calendar",
    href: "/portal/calendar",
    icon: CalendarDays,
  },
  {
    name: "Health Log",
    href: "/portal/health-log",
    icon: Activity,
  },
  {
    name: "Security",
    href: "/portal/security",
    icon: Shield,
  },
]

interface PatientLayoutClientProps {
  children: React.ReactNode
}

export function PatientLayoutClient({ children }: PatientLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, loading, signOut } = usePatientAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Mock unread count for demo
    setUnreadCount(3)
  }, [])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/portal/auth/signin")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/portal/auth/signin")
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobileMenu}
          className="bg-white/90 backdrop-blur-sm border-teal-200 shadow-lg"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-teal-200 shadow-lg
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-teal-200 bg-gradient-to-r from-teal-600 to-blue-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-br from-teal-500 to-blue-600 rounded"></div>
            </div>
            <h1 className="text-lg font-bold text-white">Inner Clarity</h1>
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
                      ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-teal-50 hover:text-teal-900"
                  }
                `}
              >
                <Icon
                  className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${isActive ? "text-white" : "text-gray-400 group-hover:text-teal-600"}
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
        <div className="border-t border-teal-200 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">Patient Portal</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-teal-50 hover:text-teal-900 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-100">
        {/* Top bar for mobile */}
        <div className="lg:hidden h-16 bg-white/80 backdrop-blur-sm border-b border-teal-200 flex items-center justify-between px-16">
          <h2 className="text-lg font-semibold text-gray-900">Patient Portal</h2>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <div className="relative">
                <Bell className="h-4 w-4 text-gray-600" />
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 min-h-screen">{children}</div>
      </main>
    </div>
  )
}
