import type { ReactNode } from "react"
import type { Metadata } from "next"
import { SidebarNavigation } from "@/components/sidebar-navigation"

export const metadata: Metadata = {
  title: "Patient Portal | Inner Clarity Inc",
  description: "Access your mental health resources and appointments",
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <SidebarNavigation />
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
