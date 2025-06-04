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
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { name: "Profile", href: "/portal/profile", icon: User },
  { name: "Appointments", href: "/portal/appointments", icon: Calendar },
  { name: "Billing", href: "/portal/billing", icon: CreditCard },
  { name: "Messages", href: "/portal/messages", icon: MessageCircle },
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
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Patient Portal</h2>
            <p className="text-sm text-gray-600">Inner Clarity</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-teal-100 text-teal-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Sign out */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
