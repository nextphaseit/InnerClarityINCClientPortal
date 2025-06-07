"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePatientAuth } from "@/components/patient-auth-provider"
import {
  Calendar,
  MessageSquare,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  Activity,
} from "lucide-react"

export default function PatientDashboardPage() {
  const { user, loading } = usePatientAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: 2,
    unreadMessages: 3,
    pendingForms: 1,
    outstandingBalance: 150.0,
    lastAppointment: "2024-01-10",
    nextAppointment: "2024-01-25",
    healthScore: 85,
    completedSessions: 12,
  })

  useEffect(() => {
    if (!loading && !user) {
      console.log("❌ No patient session found, redirecting to signin")
      router.push("/portal/auth/signin")
      return
    }

    if (user) {
      console.log("✅ Patient dashboard access granted for:", user.email)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "Book Appointment",
      description: "Schedule your next session",
      icon: Calendar,
      href: "/portal/appointments",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Send Message",
      description: "Contact your care team",
      icon: MessageSquare,
      href: "/portal/messages",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Complete Forms",
      description: "Fill out required forms",
      icon: FileText,
      href: "/portal/forms",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "View Billing",
      description: "Check your account balance",
      icon: CreditCard,
      href: "/portal/billing",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "appointment",
      title: "Therapy Session Completed",
      description: "Session with Dr. Sarah Johnson",
      time: "2 days ago",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "message",
      title: "New Message Received",
      description: "Follow-up instructions from your therapist",
      time: "3 days ago",
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "form",
      title: "Health Assessment Submitted",
      description: "Weekly mood tracking form completed",
      time: "5 days ago",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      id: 4,
      type: "payment",
      title: "Payment Processed",
      description: "Session fee payment successful",
      time: "1 week ago",
      icon: CreditCard,
      color: "text-emerald-600",
    },
  ]

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0]}!
          </h1>
          <p className="text-slate-600 mt-2">Here's an overview of your mental health journey.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">Next: {dashboardData.nextAppointment}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">From your care team</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.healthScore}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Improving
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.completedSessions}</div>
              <p className="text-xs text-muted-foreground">Total sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts for managing your care</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.title}
                    onClick={() => router.push(action.href)}
                    className={`h-24 flex flex-col items-center justify-center space-y-2 ${action.color} text-white`}
                  >
                    <Icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs opacity-90">{action.description}</div>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions and updates</CardDescription>
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
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Reminders */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications & Reminders</CardTitle>
              <CardDescription>Important updates and upcoming tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.pendingForms > 0 && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Pending Forms</p>
                        <p className="text-xs text-amber-700">
                          You have {dashboardData.pendingForms} form(s) to complete
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => router.push("/portal/forms")}>
                      Complete
                    </Button>
                  </div>
                )}

                {dashboardData.outstandingBalance > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Outstanding Balance</p>
                        <p className="text-xs text-blue-700">${dashboardData.outstandingBalance.toFixed(2)} due</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => router.push("/portal/billing")}>
                      Pay Now
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Next Appointment</p>
                      <p className="text-xs text-green-700">Scheduled for {dashboardData.nextAppointment}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => router.push("/portal/appointments")}>
                    View Details
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">New Messages</p>
                      <p className="text-xs text-purple-700">{dashboardData.unreadMessages} unread messages</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => router.push("/portal/messages")}>
                    Read
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
