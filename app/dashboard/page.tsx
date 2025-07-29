"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import {
  Calendar,
  MessageSquare,
  CreditCard,
  FileText,
  Clock,
  DollarSign,
  Bell,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export default function ClientDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
      return
    }

    if (user?.role === "admin") {
      router.push("/admin")
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-clarity-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Mock data - in a real app, this would come from your API
  const upcomingAppointment = {
    date: new Date("2024-01-15T14:00:00"),
    provider: "Dr. Sarah Johnson",
    type: "Therapy Session",
  }

  const paymentDue = {
    amount: 150,
    dueDate: new Date("2024-01-20"),
    description: "Therapy Session - January 8, 2024",
  }

  const unreadMessages = 2

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here's what's happening with your mental health journey today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-clarity-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Appointment</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {upcomingAppointment ? "Jan 15" : "None"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-clarity-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{unreadMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Due</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${paymentDue.amount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Forms</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Next Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointment ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{upcomingAppointment.type}</p>
                      <p className="text-gray-600 dark:text-gray-400">with {upcomingAppointment.provider}</p>
                    </div>
                    <Badge variant="outline" className="bg-clarity-blue-50 text-clarity-blue-700">
                      <Clock className="mr-1 h-3 w-3" />
                      {upcomingAppointment.date.toLocaleDateString()} at{" "}
                      {upcomingAppointment.date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button asChild size="sm">
                      <Link href="/appointments">View Details</Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600 dark:text-gray-400">No upcoming appointments</p>
                  <Button asChild className="mt-4">
                    <Link href="/appointments">Book Appointment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Recent Messages
                </div>
                {unreadMessages > 0 && <Badge variant="destructive">{unreadMessages} new</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-clarity-blue-50 dark:bg-clarity-blue-950/20">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-clarity-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">SJ</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Thank you for completing your homework assignment. Let's discuss...
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-clarity-blue-500 rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">IC</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Inner Clarity Admin</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your insurance verification has been completed successfully.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/messages">View All Messages</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Due */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Due
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">${paymentDue.amount}</p>
                    <p className="text-gray-600 dark:text-gray-400">{paymentDue.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Due {paymentDue.dueDate.toLocaleDateString()}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button asChild>
                    <Link href="/billing">Pay Now</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/billing">View Invoice</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Link href="/appointments">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Book Appointment</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Link href="/documents">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Upload Documents</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Link href="/messages">
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">Send Message</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Link href="/forms">
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-sm">Complete Forms</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">HIPAA Privacy Notice</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your health information is protected under HIPAA regulations. All communications and data are
                  encrypted and secure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
