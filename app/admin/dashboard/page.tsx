"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { Calendar, FileText, Users, MessageSquare, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface DashboardStats {
  totalPatients: number
  pendingAppointments: number
  unreadMessages: number
  pendingDocuments: number
  newFormSubmissions: number
  todayAppointments: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    pendingAppointments: 0,
    unreadMessages: 0,
    pendingDocuments: 0,
    newFormSubmissions: 0,
    todayAppointments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const { user, loading: authLoading, error } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/signin?tab=admin")
        return
      }

      if (user.role !== "admin") {
        router.push("/unauthorized?reason=admin_required")
        return
      }

      loadDashboardData()
    }
  }, [user, authLoading, router])

  const loadDashboardData = async () => {
    try {
      // Load all stats in parallel
      const [
        patientsResult,
        appointmentsResult,
        messagesResult,
        documentsResult,
        formsResult,
        todayAppointmentsResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "patient"),
        supabase.from("appointments").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("messages").select("id", { count: "exact" }).eq("read", false),
        supabase.from("documents").select("id", { count: "exact" }).eq("status", "uploaded"),
        supabase.from("form_responses").select("id", { count: "exact" }).eq("status", "submitted"),
        supabase
          .from("appointments")
          .select("id", { count: "exact" })
          .gte("appointment_date", new Date().toISOString().split("T")[0])
          .lt("appointment_date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
      ])

      setStats({
        totalPatients: patientsResult.count || 0,
        pendingAppointments: appointmentsResult.count || 0,
        unreadMessages: messagesResult.count || 0,
        pendingDocuments: documentsResult.count || 0,
        newFormSubmissions: formsResult.count || 0,
        todayAppointments: todayAppointmentsResult.count || 0,
      })

      // Load recent activity
      const { data: recentData } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          status,
          created_at,
          patient_profile:profiles!appointments_patient_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      setRecentActivity(recentData || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-clarity-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have permission to view this page.</p>
          <Button onClick={() => router.push("/auth/signin?tab=admin")}>Sign In as Admin</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user.name || user.email}. Here's what's happening today.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Appointments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread Messages</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unreadMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Documents</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-indigo-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Form Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newFormSubmissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/appointments">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Review Pending Appointments ({stats.pendingAppointments})
                </Button>
              </Link>
              <Link href="/admin/documents">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Review Documents ({stats.pendingDocuments})
                </Button>
              </Link>
              <Link href="/admin/forms">
                <Button className="w-full justify-start" variant="outline">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Review Form Submissions ({stats.newFormSubmissions})
                </Button>
              </Link>
              <Link href="/admin/messages">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Check Messages ({stats.unreadMessages})
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          New appointment request from {activity.patient_profile?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          activity.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : activity.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(stats.pendingAppointments > 0 || stats.pendingDocuments > 0 || stats.newFormSubmissions > 0) && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="font-medium text-yellow-800">Action Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You have {stats.pendingAppointments + stats.pendingDocuments + stats.newFormSubmissions} items
                    requiring review.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
