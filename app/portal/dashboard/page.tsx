"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, MessageSquare, LogOut, ArrowRight, Clock, AlertCircle, User } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string
  date_of_birth: string | null
  created_at: string
  updated_at: string
}

interface Appointment {
  id: string
  date: string
  type: string
  provider_name: string
  status: string
}

interface Invoice {
  id: string
  amount: number
  status: string
  due_date: string
}

interface Message {
  id: string
  content: string
  created_at: string
  read: boolean
}

export default function PatientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    nextAppointment: null as Appointment | null,
    unpaidBalance: 0,
    unreadMessages: 0,
  })

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error("Authentication error:", authError)
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        // Still continue if profile doesn't exist
      } else {
        setProfile(profileData)
      }

      // Fetch dashboard data
      await Promise.all([fetchNextAppointment(user.id), fetchUnpaidBalance(user.id), fetchUnreadMessages(user.id)])
    } catch (error) {
      console.error("Dashboard load error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchNextAppointment = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("client_id", userId)
        .eq("status", "scheduled")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(1)
        .single()

      if (!error && data) {
        setDashboardData((prev) => ({ ...prev, nextAppointment: data }))
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    }
  }

  const fetchUnpaidBalance = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("amount")
        .eq("client_id", userId)
        .in("status", ["pending", "overdue"])

      if (!error && data) {
        const total = data.reduce((sum, invoice) => sum + invoice.amount, 0)
        setDashboardData((prev) => ({ ...prev, unpaidBalance: total }))
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    }
  }

  const fetchUnreadMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("messages").select("id").eq("receiver_id", userId).eq("read", false)

      if (!error && data) {
        setDashboardData((prev) => ({ ...prev, unreadMessages: data.length }))
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Inner Clarity Portal</h1>
                <p className="text-sm text-slate-600">Patient Dashboard</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center space-x-2 border-slate-300 text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {profile?.full_name || user?.email || "Patient"}! 👋
          </h2>
          <p className="text-slate-600">Here's an overview of your account and upcoming activities.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Upcoming Appointment Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Upcoming Appointment</span>
              </CardTitle>
              <CardDescription>Your next scheduled session</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.nextAppointment ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-slate-900">{dashboardData.nextAppointment.type}</div>
                  <div className="text-sm text-slate-600">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(dashboardData.nextAppointment.date)}
                    </div>
                    <div>Provider: {dashboardData.nextAppointment.provider_name}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">No upcoming appointments</p>
                </div>
              )}
              <Button
                variant="link"
                className="p-0 h-auto mt-3 text-indigo-600 hover:text-indigo-700"
                onClick={() => router.push("/portal/appointments")}
              >
                <span className="flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* Billing Summary Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Billing Summary</span>
              </CardTitle>
              <CardDescription>Outstanding balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(dashboardData.unpaidBalance)}</div>
                <div className="text-sm text-slate-600">
                  {dashboardData.unpaidBalance > 0 ? (
                    <span className="text-amber-600 font-medium">Payment due</span>
                  ) : (
                    <span className="text-green-600 font-medium">All caught up! ✓</span>
                  )}
                </div>
              </div>
              <Button
                variant="link"
                className="p-0 h-auto mt-3 text-indigo-600 hover:text-indigo-700"
                onClick={() => router.push("/portal/billing")}
              >
                <span className="flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </span>
              </Button>
            </CardContent>
          </Card>

          {/* New Messages Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>New Messages</span>
              </CardTitle>
              <CardDescription>Unread communications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900">{dashboardData.unreadMessages}</div>
                <div className="text-sm text-slate-600">
                  {dashboardData.unreadMessages > 0 ? (
                    <span className="text-blue-600 font-medium">
                      {dashboardData.unreadMessages === 1 ? "New message" : "New messages"}
                    </span>
                  ) : (
                    <span className="text-slate-500">No new messages</span>
                  )}
                </div>
              </div>
              <Button
                variant="link"
                className="p-0 h-auto mt-3 text-indigo-600 hover:text-indigo-700"
                onClick={() => router.push("/portal/messages")}
              >
                <span className="flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
              onClick={() => router.push("/portal/appointments")}
            >
              <Calendar className="h-6 w-6 text-indigo-600" />
              <span className="text-sm font-medium">Book Appointment</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-slate-200 hover:bg-green-50 hover:border-green-300"
              onClick={() => router.push("/portal/billing")}
            >
              <DollarSign className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Pay Bills</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
              onClick={() => router.push("/portal/messages")}
            >
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Send Message</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-slate-200 hover:bg-purple-50 hover:border-purple-300"
              onClick={() => router.push("/portal/profile")}
            >
              <User className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Update Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
