"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MessageSquare, FileText, CreditCard, User, Activity } from "lucide-react"
import Link from "next/link"

export default function PortalHomePage() {
  const { user, session, loading } = usePatientAuth()
  const router = useRouter()

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !user && !session) {
      router.push("/portal/auth/signin")
    }
  }, [user, session, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user && !session) {
    return null // Will redirect
  }

  const quickActions = [
    {
      title: "Book Appointment",
      description: "Schedule your next visit",
      icon: Calendar,
      href: "/portal/appointments",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Messages",
      description: "Check messages from your care team",
      icon: MessageSquare,
      href: "/portal/messages",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Health Forms",
      description: "Complete health assessments",
      icon: FileText,
      href: "/portal/forms",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Billing",
      description: "View invoices and payments",
      icon: CreditCard,
      href: "/portal/billing",
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Profile",
      description: "Update your information",
      icon: User,
      href: "/portal/profile",
      color: "from-teal-500 to-teal-600",
    },
    {
      title: "Health Log",
      description: "Track your wellness journey",
      icon: Activity,
      href: "/portal/health-log",
      color: "from-pink-500 to-pink-600",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Patient"}!
        </h1>
        <p className="text-slate-600">Your mental health journey continues here.</p>
      </div>

      {/* Demo Mode Banner */}
      {user?.id === "demo-user" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <p className="text-amber-800 font-medium">Demo Mode Active</p>
          </div>
          <p className="text-amber-700 text-sm mt-1">
            You're viewing the portal in demo mode. All data is simulated for demonstration purposes.
          </p>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href}>
              <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start p-0 h-auto text-blue-600 hover:text-blue-700">
                    Get started →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest interactions with the portal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Appointment confirmed</p>
                <p className="text-xs text-slate-500">Tomorrow at 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New message from Dr. Smith</p>
                <p className="text-xs text-slate-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Health assessment completed</p>
                <p className="text-xs text-slate-500">Yesterday</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
