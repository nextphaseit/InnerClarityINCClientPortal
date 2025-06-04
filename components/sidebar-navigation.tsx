"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  Home,
  User,
  Calendar,
  CreditCard,
  MessageSquare,
  FileText,
  FileUp,
  CalendarDays,
  Activity,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItemProps {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick?: () => void
}

const NavItem = ({ href, icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
        : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white",
    )}
  >
    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />
    <span>{label}</span>
    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
  </Link>
)

export function SidebarNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const navigationItems = [
    { href: "/portal/dashboard", icon: Home, label: "Dashboard" },
    { href: "/portal/profile", icon: User, label: "Profile" },
    { href: "/portal/appointments", icon: Calendar, label: "Appointments" },
    { href: "/portal/billing", icon: CreditCard, label: "Billing" },
    { href: "/portal/messages", icon: MessageSquare, label: "Messages" },
    { href: "/portal/forms", icon: FileText, label: "Forms" },
    { href: "/portal/documents", icon: FileUp, label: "Documents" },
    { href: "/portal/calendar", icon: CalendarDays, label: "Calendar" },
    { href: "/portal/health-log", icon: Activity, label: "Health Log" },
    { href: "/portal/security", icon: Shield, label: "Security" },
  ]

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/90 dark:bg-slate-800/90 shadow-lg border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 backdrop-blur-sm"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:shadow-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Title */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">Inner Clarity Inc</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Patient Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">Patient Portal</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Active Session</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
              <ChevronRight className="h-4 w-4 ml-auto" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
