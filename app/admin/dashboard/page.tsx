"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, MessageSquare, Ticket, TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react"

interface DashboardStats {
  totalClients: number
  activeTickets: number
  todayAppointments: number
  unreadMessages: number
  pendingTasks: number
  systemHealth: "healthy" | "warning" | "error"
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeTickets: 0,
    todayAppointments: 0,
    unreadMessages: 0,
    pendingTasks: 0,
    systemHealth: "healthy",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated") {
      router.push("/auth/signin?tab=admin")
      return
    }

    if (session?.user?.role !== "admin" && session?.user?.role !== "super_admin") {
      router.push("/unauthorized")
      return
    }

    loadDashboardData()
  }, [session, status, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use demo data for now to avoid database connection issues
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate loading

      setStats({
        totalClients: 156,
        activeTickets: 12,
        todayAppointments: 8,
        unreadMessages: 3,
        pendingTasks: 5,
        systemHealth: "healthy",
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setError("Failed to load dashboard data")

      // Fallback to demo data
      setStats({
        totalClients: 156,
        activeTickets: 12,
        todayAppointments: 8,
        unreadMessages: 3,
        pendingTasks: 5,
        systemHealth: "warning",
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
    },
    {
      title: "Active Tickets",
      value: stats.activeTickets,
      icon: Ticket,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "-5%",
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "0%",
    },
  ]

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar placeholder */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <h2 className="text-lg font-semibold">Admin Portal</h2>
          </div>
          <nav className="mt-6">
            <div className="px-6 py-2 text-sm font-medium text-gray-900 bg-blue-50 border-r-2 border-blue-600">
              Dashboard
            </div>
            <div className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">Clients</div>
            <div className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">Appointments</div>
            <div className="px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">Messages</div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-2">Welcome to the Inner Clarity Admin Portal</p>
                {session?.user?.email && (
                  <p className="text-sm text-slate-500 mt-1">Signed in as: {session.user.email}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={stats.systemHealth === "healthy" ? "default" : "destructive"}
                  className="flex items-center space-x-1"
                >
                  {stats.systemHealth === "healthy" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  <span>System {stats.systemHealth}</span>
                </Badge>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-700">{error}</p>
                  <Button onClick={loadDashboardData} variant="outline" size="sm" className="ml-auto">
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                          <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                          <div className="flex items-center mt-2">
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600">{stat.change}</span>
                          </div>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Add New Client
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Appointment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Ticket className="mr-2 h-4 w-4" />
                    Create Support Ticket
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New client registration</p>
                        <p className="text-xs text-slate-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Appointment scheduled</p>
                        <p className="text-xs text-slate-500">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Support ticket created</p>
                        <p className="text-xs text-slate-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
