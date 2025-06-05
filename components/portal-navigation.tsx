import { BarChart3, LayoutDashboard, ListChecks, CreditCard, Settings, User } from "lucide-react"

import type { MainNavItem, SidebarNavItem } from "@/types"

interface DashboardConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/portal",
    },
    {
      title: "Tasks",
      href: "/portal/tasks",
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/portal",
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      href: "/portal/tasks",
      icon: ListChecks,
    },
    {
      title: "Billing",
      href: "/portal/billing",
      icon: CreditCard,
      description: "View payment history and manage billing",
    },
    {
      title: "Analytics",
      href: "/portal/analytics",
      icon: BarChart3,
    },
    {
      title: "Profile",
      href: "/portal/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/portal/settings",
      icon: Settings,
    },
  ],
}
