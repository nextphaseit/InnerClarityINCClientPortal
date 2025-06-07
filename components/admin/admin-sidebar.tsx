"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  MessageSquare,
  Video,
  FileText,
  ClipboardList,
  CalendarDays,
  Activity,
  Receipt,
  Shield,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Settings,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Patients",
    href: "/admin/patients",
    icon: Users,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Appointments",
    href: "/admin/appointments",
    icon: Calendar,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Billing & Payments",
    href: "/admin/billing",
    icon: CreditCard,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Messages",
    href: "/admin/messages",
    icon: MessageSquare,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Telehealth",
    href: "/admin/telehealth",
    icon: Video,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Documents",
    href: "/admin/documents",
    icon: FileText,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Forms",
    href: "/admin/forms",
    icon: ClipboardList,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Calendar",
    href: "/admin/calendar",
    icon: CalendarDays,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Health Logs",
    href: "/admin/health-logs",
    icon: Activity,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Invoices",
    href: "/admin/invoices",
    icon: Receipt,
    roles: ["admin", "super_admin"],
  },
  {
    name: "Audit Logs",
    href: "/admin/audit-logs",
    icon: Shield,
    roles: ["super_admin"],
  },
  {
    name: "Admin Users",
    href: "/admin/users",
    icon: UserCog,
    roles: ["super_admin"],
  },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  const filteredNavigation = navigationItems.filter((item) => item.roles.includes(user?.role as string))

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
        "transition-all duration-300 ease-in-out shadow-xl",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">NextPhase IT</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onToggle} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  collapsed ? "mx-auto" : "mr-3",
                  "h-5 w-5 transition-colors duration-200",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300",
                )}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
              {!collapsed && item.roles.includes("super_admin") && user?.role !== "super_admin" && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Super
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Actions */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        {!collapsed && (
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                {user?.full_name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.full_name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {user?.role === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
            </div>
          </div>
        )}

        <div className={cn("space-y-2", collapsed ? "flex flex-col items-center" : "")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              collapsed ? "w-8 h-8 p-0" : "w-full justify-start",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
            )}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span className="ml-2">Toggle Theme</span>}
          </Button>

          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Link href="/admin/profile">
                <Settings className="h-4 w-4 mr-2" />
                Profile Settings
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
