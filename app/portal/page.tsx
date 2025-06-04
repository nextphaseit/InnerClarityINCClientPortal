"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PortalNavigation } from "@/components/portal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageCircle, FileText, CreditCard, Clock, ArrowRight, Heart, User, Activity } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import Link from "next/link"

export default function PortalHomePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your portal...</p>
        </div>
      </div>
    )
  }

  const quickActions = [
    {
      title: "Schedule Appointment",
      description: "Book your next therapy session",
      icon: Calendar,
      href: "/portal/appointments",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Send Message",
      description: "Contact your care team",
      icon: MessageCircle,
      href: "/portal/messages",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Complete Forms",
      description: "Fill out required documents",
      icon: FileText,
      href: "/portal/forms",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "View Billing",
      description: "Check invoices and payments",
      icon: CreditCard,
      href: "/portal/billing",
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ]

  const recentActivity = [
    {
      title: "Therapy Session Completed",
      description: "Individual session with Dr. Sarah Johnson",
      time: "2 days ago",
      icon: Activity,
      color: "text-green-600",
    },
    {
      title: "Form Submitted",
      description: "HIPAA Privacy Notice acknowledged",
      time: "1 week ago",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Payment Processed",
      description: "Invoice #INV-2024-003 paid",
      time: "1 week ago",
      icon: CreditCard,
      color: "text-purple-600",
    },
  ]

  const upcomingAppointments = [
    {
      title: "Individual Therapy",
      provider: "Dr. Sarah Johnson",
      date: "Feb 15, 2024",
      time: "10:00 AM",
      type: "In-Person",
    },
    {
      title: "Group Therapy",
      provider: "Dr. Emily Rodriguez",
      date: "Feb 20, 2024",
      time: "2:00 PM",
      type: "Virtual",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PortalNavigation />

      <div className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome back!
                  </h1>
                  <p className="text-xl text-slate-600 mt-2">
                    {user?.user_metadata?.full_name || user?.email || "Patient"}
                  </p>
                  <p className="text-slate-500 mt-1">Here's what's happening with your care today</p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.title} href={action.href}>
                    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${action.color} transition-colors`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 group-hover:text-slate-900">{action.title}</h3>
                            <p className="text-sm text-slate-600">{action.description}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <Calendar className="h-6 w-6 mr-3 text-indigo-600" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription>Your scheduled therapy sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No upcoming appointments</p>
                      <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" asChild>
                        <Link href="/portal/appointments">Schedule Appointment</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                              <User className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800">{appointment.title}</h3>
                              <p className="text-sm text-slate-600">{appointment.provider}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <div className="flex items-center text-sm text-slate-500">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {appointment.date}
                                </div>
                                <div className="flex items-center text-sm text-slate-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {appointment.time}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              appointment.type === "Virtual"
                                ? "border-green-200 text-green-700 bg-green-50"
                                : "border-blue-200 text-blue-700 bg-blue-50"
                            }
                          >
                            {appointment.type}
                          </Badge>
                        </div>
                      ))}
                      <div className="pt-4">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/portal/appointments">View All Appointments</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <Activity className="h-6 w-6 mr-3 text-purple-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest portal activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => {
                      const Icon = activity.icon
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            <Icon className={`h-5 w-5 ${activity.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                            <p className="text-sm text-slate-600">{activity.description}</p>
                            <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/portal/security">View All Activity</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Health Summary */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <Heart className="h-6 w-6 mr-3 text-red-500" />
                    Health Summary
                  </CardTitle>
                  <CardDescription>Your wellness at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Mood Today</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-800">7/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Anxiety Level</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-800">3/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Sleep Quality</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="w-4/5 h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-800">8/10</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/portal/health-log">Update Health Log</Link>
                    </Button>
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
