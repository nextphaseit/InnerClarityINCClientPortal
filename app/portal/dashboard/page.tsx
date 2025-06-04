import { PortalNavigation } from "@/components/portal-navigation"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavigation />

      <div className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Keep all existing dashboard content */}
          {/* ... existing content ... */}
        </div>
      </div>
    </div>
  )
}
