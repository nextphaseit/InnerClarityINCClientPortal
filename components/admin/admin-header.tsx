"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, LogOut, User, Shield } from "lucide-react"
import Link from "next/link"

interface AdminHeaderProps {
  sidebarCollapsed: boolean
}

export function AdminHeader({ sidebarCollapsed }: AdminHeaderProps) {
  const { user, signOut } = useAuth()

  return (
    <header
      className={`
      fixed top-0 right-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800
      transition-all duration-300 ease-in-out
      ${sidebarCollapsed ? "left-16" : "left-64"}
    `}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Portal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">NextPhase IT Healthcare Management</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {user?.full_name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <Badge variant="outline" className="w-fit text-xs">
                    {user?.role === "super_admin" ? "Super Admin" : "Admin"}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              {user?.role === "super_admin" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/system-settings" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    System Settings
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/admin/preferences" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
