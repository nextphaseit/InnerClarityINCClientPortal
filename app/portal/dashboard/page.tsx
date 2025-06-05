"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MessageSquare,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { usePatientAuth } from "@/components/patient-auth-provider"

export default function PatientDashboard() {
  const { user } = usePatientAuth()
  const [stats, setStats] = useState({
    upcomingAppointments: 2,
    unreadMessages: 3,
    pendingForms: 1,
    outstandingBalance: 150.0,
  })

  const upcomingAppointments = [
    {
      id: "1",
      date: "2024-01-15",
      time: "10:00 AM",
      type: "Therapy Session",
      provider: "Dr. Sarah Johnson",
      status: "confirmed",
    },
    {
      id: "2",
      date: "2024-01-22",
      time: "2:00 PM",
      type: "Follow-up",
      provider: "Dr. Sarah Johnson",
      status: "pending",
    },
  ]

  const recentMessages = [
    {
      id: "1",
      from: "Dr. Sarah Johnson",
      subject: "Appointment Reminder",
      preview: "Your appointment is scheduled for tomorrow at 10:00 AM...",
      timestamp: "2 hours ago",
      unread: true,
    },
    {
      id: "2",
      from: "Billing Department",
      subject: "Payment Confirmation",
      preview: "Thank you for your recent payment...",
      timestamp: "1 day ago",
      unread: false,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm border border-teal-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Patient"}!
            </h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your care</p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-teal-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-teal-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Forms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingForms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-gray-900">${stats.outstandingBalance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <Card className="border-teal-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-teal-600" />
                Upcoming Appointments
              </div>
              <Badge variant="outline" className="text-teal-600 border-teal-200">
                {stats.upcomingAppointments} scheduled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-teal-100 bg-teal-50/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.type}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.date} at {appointment.time}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.provider}</p>
                    </div>
                  </div>
                  <Badge
                    variant={appointment.status === "confirmed" ? "default" : "secondary"}
                    className={appointment.status === "confirmed" ? "bg-teal-500" : ""}
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full border-teal-200 text-teal-700 hover:bg-teal-50">
                <Link href="/portal/appointments">View All Appointments</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                Recent Messages
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {stats.unreadMessages} unread
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg border ${
                    message.unread ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{message.from}</p>
                        {message.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      <p className="text-sm font-medium text-gray-700 mt-1">{message.subject}</p>
                      <p className="text-sm text-gray-600 mt-1">{message.preview}</p>
                      <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/portal/messages">View All Messages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 border-teal-200 hover:bg-teal-50"
              >
                <Link href="/portal/appointments">
                  <Calendar className="h-6 w-6 text-teal-600" />
                  <span className="text-sm">Book Appointment</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 border-blue-200 hover:bg-blue-50"
              >
                <Link href="/portal/messages">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Send Message</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 border-purple-200 hover:bg-purple-50"
              >
                <Link href="/portal/forms">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">Complete Forms</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 border-orange-200 hover:bg-orange-50"
              >
                <Link href="/portal/billing">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                  <span className="text-sm">Pay Bill</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Health Summary */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              Health Summary
            </CardTitle>
            <CardDescription>Your recent health activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Last Session</p>
                    <p className="text-xs text-green-700">Completed on Jan 8, 2024</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Pending Forms</p>
                    <p className="text-xs text-yellow-700">1 form needs completion</p>
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                <Link href="/portal/health-log">View Health Log</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
