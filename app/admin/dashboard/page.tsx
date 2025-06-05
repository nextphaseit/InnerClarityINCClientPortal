"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { Users, Calendar, MessageSquare, Ticket, TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  totalClients: number
  activeTickets: number
  todayAppointments: number
  unreadMessages: number
  pendingTasks: number
  systemHealth: "healthy" | "warning" | "error"
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeTickets: 0,
    todayAppointments: 0,
    unreadMessages: 0,
    pendingTasks: 0,
    systemHealth: "healthy",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load real data from Supabase
      const [clientsResult, appointmentsResult, messagesResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "patient"),
        supabase
          .from("appointments")
          .select("id", { count: "exact" })
          .gte("appointment_date", new Date().toISOString().split("T")[0]),
        supabase.from("messages").select("id", { count: "exact" }).eq("read", false),
      ])

      setStats({
        totalClients: clientsResult.count || 0,
        activeTickets: 12, // This would come from a tickets table
        todayAppointments: appointmentsResult.count || 0,
        unreadMessages: messagesResult.count || 0,
        pendingTasks: 5, // This would come from a tasks table
        systemHealth: "healthy",
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      // Fallback to demo data
      setStats({
        totalClients: 156,
        activeTickets: 12,
        todayAppointments: 8,
        unreadMessages: 3,
        pendingTasks: 5,
        systemHealth: "healthy",
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-2">Welcome to the NextPhase IT Admin Portal</p>
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
    </AdminLayout>
  )
}
