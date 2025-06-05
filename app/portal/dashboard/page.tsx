"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, MessageSquare, ArrowRight, Clock, AlertCircle, Activity } from "lucide-react"
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
  appointment_date: string
  appointment_type: string
  provider_name?: string
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
  read?: boolean
}

export default function PatientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    nextAppointment: null as Appointment | null,
    unpaidBalance: 0,
    messageCount: 0,
    loadingAppointments: true,
    loadingBilling: true,
    loadingMessages: true,
  })

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // Use mock data for demo
        setUser({ id: "demo-user", email: "patient@example.com" } as SupabaseUser)
        setProfile({
          id: "demo-user",
          full_name: "Demo Patient",
          date_of_birth: "1990-01-01",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        // Set mock dashboard data
        setDashboardData({
          nextAppointment: {
            id: "mock-1",
            appointment_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            appointment_type: "Individual Therapy",
            provider_name: "Dr. Sarah Johnson",
            status: "scheduled",
          },
          unpaidBalance: 150,
          messageCount: 3,
          loadingAppointments: false,
          loadingBilling: false,
          loadingMessages: false,
        })

        setLoading(false)
        return
      }

      // Real Supabase implementation
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
        // Continue even if profile doesn't exist
      } else {
        setProfile(profileData)
      }

      // Load dashboard data only after authentication is confirmed
      await Promise.all([fetchNextAppointment(user.id), fetchUnpaidBalance(user.id), fetchMessageCount(user.id)])
    } catch (error) {
      console.error("Dashboard load error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchNextAppointment = async (userId: string) => {
    try {
      setDashboardData((prev) => ({ ...prev, loadingAppointments: true }))

      const { data, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_type, provider_name, status")
        .eq("patient_id", userId)
        .gt("appointment_date", new Date().toISOString())
        .order("appointment_date", { ascending: true })
        .limit(1)

      if (error) {
        console.error("Error fetching appointments:", error)
      } else if (data && data.length > 0) {
        setDashboardData((prev) => ({ ...prev, nextAppointment: data[0] }))
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setDashboardData((prev) => ({ ...prev, loadingAppointments: false }))
    }
  }

  const fetchUnpaidBalance = async (userId: string) => {
    try {
      setDashboardData((prev) => ({ ...prev, loadingBilling: true }))

      const { data, error } = await supabase
        .from("invoices")
        .select("amount")
        .eq("patient_id", userId)
        .eq("status", "Unpaid")

      if (error) {
        console.error("Error fetching invoices:", error)
      } else if (data) {
        const total = data.reduce((sum, invoice) => sum + (invoice.amount || 0), 0)
        setDashboardData((prev) => ({ ...prev, unpaidBalance: total }))
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setDashboardData((prev) => ({ ...prev, loadingBilling: false }))
    }
  }

  const fetchMessageCount = async (userId: string) => {
    try {
      setDashboardData((prev) => ({ ...prev, loadingMessages: true }))

      const { data, error } = await supabase.from("messages").select("id, read").eq("patient_id", userId)

      if (error) {
        console.error("Error fetching messages:", error)
      } else if (data) {
        // Count total messages (or unread if read column exists)
        const unreadCount = data.filter((msg) => msg.read === false).length
        const totalCount = data.length

        // Use unread count if available, otherwise total count
        setDashboardData((prev) => ({
          ...prev,
          messageCount: unreadCount > 0 ? unreadCount : totalCount,
        }))
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setDashboardData((prev) => ({ ...prev, loadingMessages: false }))
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back, {profile?.full_name || user?.email || "Patient"}! 👋
        </h1>
        <p className="text-slate-600">Here's an overview of your account and upcoming activities.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointment Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              <span>Upcoming Appointment</span>
            </CardTitle>
            <CardDescription>Your next scheduled session</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.loadingAppointments ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            ) : dashboardData.nextAppointment ? (
              <div className="space-y-2">
                <div className="text-xl font-bold text-slate-900">{dashboardData.nextAppointment.appointment_type}</div>
                <div className="text-sm text-slate-600">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(dashboardData.nextAppointment.appointment_date)}
                  </div>
                  {dashboardData.nextAppointment.provider_name && (
                    <div>Provider: {dashboardData.nextAppointment.provider_name}</div>
                  )}
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
              className="p-0 h-auto mt-3 text-teal-600 hover:text-teal-700"
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
            {dashboardData.loadingBilling ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xl font-bold text-slate-900">{formatCurrency(dashboardData.unpaidBalance)}</div>
                <div className="text-sm text-slate-600">
                  {dashboardData.unpaidBalance > 0 ? (
                    <span className="text-amber-600 font-medium">Payment due</span>
                  ) : (
                    <span className="text-green-600 font-medium">All caught up! ✓</span>
                  )}
                </div>
              </div>
            )}
            <Button
              variant="link"
              className="p-0 h-auto mt-3 text-teal-600 hover:text-teal-700"
              onClick={() => router.push("/portal/billing")}
            >
              <span className="flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Messages Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <span>Messages</span>
            </CardTitle>
            <CardDescription>Your communications</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.loadingMessages ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xl font-bold text-slate-900">{dashboardData.messageCount}</div>
                <div className="text-sm text-slate-600">
                  {dashboardData.messageCount > 0 ? (
                    <span className="text-blue-600 font-medium">
                      {dashboardData.messageCount === 1 ? "Message" : "Messages"}
                    </span>
                  ) : (
                    <span className="text-slate-500">No messages</span>
                  )}
                </div>
              </div>
            )}
            <Button
              variant="link"
              className="p-0 h-auto mt-3 text-teal-600 hover:text-teal-700"
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
            className="h-auto p-4 flex flex-col items-center space-y-2 border-slate-200 hover:bg-teal-50 hover:border-teal-300"
            onClick={() => router.push("/portal/appointments")}
          >
            <Calendar className="h-6 w-6 text-teal-600" />
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
            onClick={() => router.push("/portal/health-log")}
          >
            <Activity className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium">Health Log</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium">Appointment Completed</p>
                  <p className="text-xs text-slate-500">June 4, 2025 • 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium">Message Received</p>
                  <p className="text-xs text-slate-500">June 3, 2025 • 2:15 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div>
                  <p className="text-sm font-medium">Form Submitted</p>
                  <p className="text-xs text-slate-500">June 2, 2025 • 11:30 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle>Health Overview</CardTitle>
            <CardDescription>Your wellness summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Mood Score</span>
                <span className="text-lg font-bold text-teal-600">7.5/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sleep Quality</span>
                <span className="text-lg font-bold text-blue-600">Good</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Stress Level</span>
                <span className="text-lg font-bold text-amber-600">Moderate</span>
              </div>
              <Button
                variant="link"
                className="p-0 h-auto text-teal-600 hover:text-teal-700"
                onClick={() => router.push("/portal/health-log")}
              >
                <span className="flex items-center gap-1">
                  Update Health Log <ArrowRight className="h-3 w-3" />
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
