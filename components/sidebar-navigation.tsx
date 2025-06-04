"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"

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

export function SidebarNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobileMenu}
          className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={closeMobileMenu} />}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200 shadow-xl
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded"></div>
            </div>
            <h1 className="text-lg font-bold text-white">Inner Clarity Inc</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                <Icon
                  className={`
                    mr-3 h-5 w-5 transition-colors duration-200
                    ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}
                  `}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Patient Portal</p>
              <p className="text-xs text-slate-500 truncate">Secure Access</p>
            </div>
          </div>

          <Link
            href="/auth/login"
            onClick={closeMobileMenu}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </div>
    </>
  )
}
