"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react"

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      console.log("❌ No session found, redirecting to signin")
      router.push("/auth/signin")
      return
    }

    if (!["admin", "super_admin"].includes(session.user?.role || "")) {
      console.log("❌ User is not admin, redirecting to unauthorized")
      router.push("/unauthorized")
      return
    }

    console.log("✅ Admin dashboard access granted for:", session.user?.email)
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !["admin", "super_admin"].includes(session.user?.role || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  // Mock data for dashboard
  const stats = {
    totalClients: 156,
    activeClients: 142,
    todayAppointments: 12,
    pendingAppointments: 8,
    unreadMessages: 5,
    monthlyRevenue: 45600,
    revenueGrowth: 12.5,
    systemAlerts: 2,
  }

  const recentActivity = [
    {
      id: 1,
      type: "appointment",
      message: "New appointment scheduled with John Smith",
      time: "10 minutes ago",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      id: 2,
      type: "message",
      message: "Message received from Jane Doe",
      time: "25 minutes ago",
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      id: 3,
      type: "client",
      message: "New client registration: Robert Wilson",
      time: "1 hour ago",
      icon: Users,
      color: "text-purple-600",
    },
    {
      id: 4,
      type: "alert",
      message: "System backup completed successfully",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
  ]

  const upcomingAppointments = [
    {
      id: 1,
      client: "John Smith",
      time: "10:00 AM",
      type: "Initial Consultation",
      status: "confirmed",
    },
    {
      id: 2,
      client: "Jane Doe",
      time: "11:30 AM",
      type: "Follow-up Session",
      status: "confirmed",
    },
    {
      id: 3,
      client: "Robert Wilson",
      time: "2:00 PM",
      type: "Therapy Session",
      status: "pending",
    },
    {
      id: 4,
      client: "Sarah Johnson",
      time: "3:30 PM",
      type: "Assessment",
      status: "confirmed",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user?.name}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your practice today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            System Online
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Role: {session.user?.role}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeClients} active</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">{stats.pendingAppointments} pending</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+{stats.revenueGrowth}% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming appointments and sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appointment.client}</p>
                      <p className="text-xs text-gray-500">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{appointment.time}</p>
                    <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push("/admin/clients")}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Users className="h-6 w-6" />
              <span>Manage Clients</span>
            </Button>
            <Button
              onClick={() => router.push("/admin/appointments")}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Calendar className="h-6 w-6" />
              <span>Schedule Appointment</span>
            </Button>
            <Button
              onClick={() => router.push("/admin/messages")}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <MessageSquare className="h-6 w-6" />
              <span>View Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {stats.systemAlerts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              System Alerts ({stats.systemAlerts})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="text-sm font-medium">Scheduled maintenance reminder</p>
                  <p className="text-xs text-gray-600">System maintenance scheduled for this weekend</p>
                </div>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div>
                  <p className="text-sm font-medium">Security update available</p>
                  <p className="text-xs text-gray-600">New security patch ready for installation</p>
                </div>
                <Button size="sm" variant="outline">
                  Update Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
