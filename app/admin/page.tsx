import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { requireAdminAuth } from "@/lib/session"
import {
  Users,
  Calendar,
  MessageSquare,
  FileText,
  Shield,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Admin Dashboard | Inner Clarity",
  description: "Admin dashboard for Inner Clarity mental health services",
}

export default async function AdminDashboard() {
  // Server-side authentication check
  const user = await requireAdminAuth()

  // Mock data - in a real app, this would come from your API
  const stats = {
    totalClients: 127,
    todayAppointments: 8,
    unreadMessages: 5,
    newUploads: 3,
    auditAlerts: 2,
  }

  // Add this after the existing stats
  const tenantInfo = {
    name: user?.tenantId === "inner-clarity" ? "Inner Clarity" : "Health Corp",
    id: user?.tenantId || "unknown",
  }

  const upcomingAppointments = [
    {
      id: "1",
      time: "09:00 AM",
      client: "John Smith",
      type: "Initial Consultation",
      status: "confirmed",
    },
    {
      id: "2",
      time: "10:30 AM",
      client: "Sarah Johnson",
      type: "Follow-up",
      status: "confirmed",
    },
    {
      id: "3",
      time: "02:00 PM",
      client: "Michael Brown",
      type: "Therapy Session",
      status: "pending",
    },
  ]

  const recentActivity = [
    {
      id: "1",
      type: "document_upload",
      client: "Jane Doe",
      description: "Uploaded insurance card",
      timestamp: "10 minutes ago",
    },
    {
      id: "2",
      type: "appointment_booked",
      client: "Robert Wilson",
      description: "Booked therapy session for Jan 20",
      timestamp: "25 minutes ago",
    },
    {
      id: "3",
      type: "message_sent",
      client: "Lisa Anderson",
      description: "Sent message about medication",
      timestamp: "1 hour ago",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Overview of your practice and client management - {tenantInfo.name}
              </p>
            </div>
            <Badge variant="outline" className="text-clarity-blue-600">
              Tenant: {tenantInfo.id}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-clarity-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-clarity-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unreadMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Uploads</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newUploads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Audit Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.auditAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Today's Appointments
                </div>
                <Badge variant="outline">{stats.todayAppointments} scheduled</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{appointment.client}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {appointment.type} at {appointment.time}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={appointment.status === "confirmed" ? "default" : "secondary"}
                      className={appointment.status === "confirmed" ? "bg-clarity-green-500" : ""}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/appointments">View All Appointments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === "document_upload" && <FileText className="h-4 w-4 text-clarity-blue-500" />}
                      {activity.type === "appointment_booked" && (
                        <Calendar className="h-4 w-4 text-clarity-green-500" />
                      )}
                      {activity.type === "message_sent" && <MessageSquare className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.client}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/audit">View Audit Logs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Link href="/admin/clients">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Manage Clients</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Link href="/admin/appointments">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Schedule Appointment</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Link href="/admin/messages">
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">Review Messages</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Link href="/admin/files">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Review Files</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">HIPAA Compliance</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-clarity-green-500" />
                    <span className="text-sm text-clarity-green-600">Active</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Encryption</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-clarity-green-500" />
                    <span className="text-sm text-clarity-green-600">Enabled</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Backup Status</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-clarity-green-500" />
                    <span className="text-sm text-clarity-green-600">Current</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Audit Logging</span>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600">2 Alerts</span>
                  </div>
                </div>

                <Button asChild variant="outline" size="sm" className="w-full mt-4">
                  <Link href="/admin/audit">View Security Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HIPAA Compliance Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">HIPAA Administrative Safeguards</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All administrative actions are logged and monitored for compliance. Access controls and audit trails
                  are maintained according to HIPAA requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
