"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  CreditCard,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  FileText,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { logAuditEvent } from "@/lib/auth"

interface DashboardStats {
  totalPatients: number
  activePatients: number
  upcomingAppointments: number
  todayAppointments: number
  unreadMessages: number
  overdueInvoices: number
  totalRevenue: number
  monthlyRevenue: number
  pendingDocuments: number
  completedForms: number
}

interface RecentActivity {
  id: string
  type: "appointment" | "payment" | "message" | "registration" | "document" | "form"
  description: string
  timestamp: string
  patient_name?: string
  amount?: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activePatients: 0,
    upcomingAppointments: 0,
    todayAppointments: 0,
    unreadMessages: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingDocuments: 0,
    completedForms: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
    logAuditEvent("view", "dashboard")
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load stats in parallel
      const [
        patientsResult,
        appointmentsResult,
        messagesResult,
        invoicesResult,
        paymentsResult,
        documentsResult,
        formsResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id, status").eq("role", "patient"),
        supabase.from("appointments").select("id, appointment_date, status"),
        supabase.from("messages").select("id, read").eq("read", false),
        supabase.from("invoices").select("id, amount, status, due_date"),
        supabase.from("payments").select("id, amount, created_at"),
        supabase.from("documents").select("id, status"),
        supabase.from("forms_submissions").select("id, status"),
      ])

      // Calculate stats
      const patients = patientsResult.data || []
      const appointments = appointmentsResult.data || []
      const messages = messagesResult.data || []
      const invoices = invoicesResult.data || []
      const payments = paymentsResult.data || []
      const documents = documentsResult.data || []
      const forms = formsResult.data || []

      const today = new Date().toISOString().split("T")[0]
      const thisMonth = new Date().toISOString().slice(0, 7)

      setStats({
        totalPatients: patients.length,
        activePatients: patients.filter((p) => p.status === "active").length,
        upcomingAppointments: appointments.filter((a) => a.appointment_date >= today && a.status === "confirmed")
          .length,
        todayAppointments: appointments.filter((a) => a.appointment_date.startsWith(today)).length,
        unreadMessages: messages.length,
        overdueInvoices: invoices.filter((i) => i.status === "pending" && i.due_date < today).length,
        totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        monthlyRevenue: payments
          .filter((p) => p.created_at.startsWith(thisMonth))
          .reduce((sum, p) => sum + (p.amount || 0), 0),
        pendingDocuments: documents.filter((d) => d.status === "pending").length,
        completedForms: forms.filter((f) => f.status === "completed").length,
      })

      // Load recent activity
      await loadRecentActivity()
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // In a real app, this would be a more sophisticated query
      const activities: RecentActivity[] = [
        {
          id: "1",
          type: "registration",
          description: "New patient registered",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          patient_name: "John Smith",
        },
        {
          id: "2",
          type: "appointment",
          description: "Appointment scheduled",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          patient_name: "Jane Doe",
        },
        {
          id: "3",
          type: "payment",
          description: "Payment received",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          patient_name: "Bob Johnson",
          amount: 15000, // $150.00 in cents
        },
        {
          id: "4",
          type: "message",
          description: "New message received",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          patient_name: "Alice Brown",
        },
        {
          id: "5",
          type: "document",
          description: "Document uploaded",
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          patient_name: "Charlie Wilson",
        },
      ]

      setRecentActivity(activities)
    } catch (error) {
      console.error("Error loading recent activity:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100) // Assuming amounts are in cents
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <Users className="h-4 w-4 text-green-600" />
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "payment":
        return <DollarSign className="h-4 w-4 text-green-600" />
      case "message":
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case "document":
        return <FileText className="h-4 w-4 text-orange-600" />
      case "form":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      subtitle: `${stats.activePatients} active`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      change: "+12%",
      changeType: "increase" as const,
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      subtitle: `${stats.upcomingAppointments} upcoming`,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      change: "+8%",
      changeType: "increase" as const,
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages,
      subtitle: "Requires attention",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      change: "-5%",
      changeType: "decrease" as const,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
      subtitle: `${stats.overdueInvoices} overdue invoices`,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
      change: "+15%",
      changeType: "increase" as const,
    },
    {
      title: "Pending Documents",
      value: stats.pendingDocuments,
      subtitle: "Awaiting review",
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      change: "+3%",
      changeType: "increase" as const,
    },
    {
      title: "Completed Forms",
      value: stats.completedForms,
      subtitle: "This month",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
      change: "+22%",
      changeType: "increase" as const,
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome to the NextPhase IT Admin Portal</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>System Healthy</span>
            </Badge>
            <Button onClick={loadDashboardData} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{stat.subtitle}</p>
                      <div className="flex items-center space-x-1">
                        {stat.changeType === "increase" ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span
                          className={`text-xs ${stat.changeType === "increase" ? "text-green-600" : "text-red-600"}`}
                        >
                          {stat.change}
                        </span>
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                      {activity.patient_name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.patient_name}
                          {activity.amount && (
                            <span className="ml-2 font-medium text-green-600">{formatCurrency(activity.amount)}</span>
                          )}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add New Patient
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
                <CreditCard className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Review Documents
              </Button>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>System Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.overdueInvoices > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        {stats.overdueInvoices} overdue invoices require attention
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                )}
                {stats.pendingDocuments > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        {stats.pendingDocuments} documents awaiting review
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                )}
                {stats.unreadMessages > 0 && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        {stats.unreadMessages} unread messages
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                )}
                {stats.overdueInvoices === 0 && stats.pendingDocuments === 0 && stats.unreadMessages === 0 && (
                  <div className="flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p>No alerts at this time</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
