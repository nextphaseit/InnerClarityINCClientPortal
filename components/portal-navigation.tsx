"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  User,
  Calendar,
  CreditCard,
  MessageCircle,
  FileText,
  Upload,
  CalendarDays,
  Heart,
  Shield,
  Menu,
  X,
  LogOut,
  Home,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { name: "Dashboard", href: "/portal", icon: Home },
  { name: "Profile", href: "/portal/profile", icon: User },
  { name: "Appointments", href: "/portal/appointments", icon: Calendar },
  { name: "Messages", href: "/portal/messages", icon: MessageCircle },
  { name: "Billing", href: "/portal/billing", icon: CreditCard },
  { name: "Forms", href: "/portal/forms", icon: FileText },
  { name: "Documents", href: "/portal/documents", icon: Upload },
  { name: "Calendar", href: "/portal/calendar", icon: CalendarDays },
  { name: "Health Log", href: "/portal/health-log", icon: Heart },
  { name: "Security", href: "/portal/security", icon: Shield },
]

export function PortalNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-white/20 hover:bg-white"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Inner Clarity</h2>
                <p className="text-sm text-slate-300">Patient Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mr-3 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  {item.name}
                  {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Patient</p>
                  <p className="text-xs text-slate-400 truncate">Active Session</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start bg-transparent border-slate-600 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
