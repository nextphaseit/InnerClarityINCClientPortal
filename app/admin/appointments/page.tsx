"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { Calendar, Clock, Plus, Filter, Users, Video, Shield, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabaseClient"
import { StatusBadge } from "@/components/status-badge"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"

// Mark as dynamic to prevent static rendering issues
export const dynamic = "force-dynamic"

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patientName: "",
    provider: "",
    datetime: "",
    status: "Upcoming",
  })

  // Use our custom auth hook with proper error handling
  const { user, loading, error } = useAuth()

  const [appointments, setAppointments] = useState<any[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")

  // Set up realtime notifications and auto-refresh
  useRealtimeNotifications({
    enabled: true,
    playSound: true,
  })

  // Auto-refresh appointments when new data arrives
  useEffect(() => {
    if (!user || user.role !== "admin") return

    const channel = supabase
      .channel("appointments-refresh")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          console.log("🔄 Auto-refreshing appointments due to realtime update")
          loadAppointments()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    try {
      if (!loading) {
        if (!user) {
          console.log("❌ No user found, redirecting to sign in")
          router.push("/auth/signin?tab=admin")
          return
        }

        if (user.role !== "admin") {
          console.log("❌ User is not admin, redirecting to unauthorized")
          router.push("/unauthorized?reason=admin_required")
          return
        }

        console.log("✅ Admin user authenticated:", user.email)
      }
    } catch (err) {
      console.error("❌ Error in admin appointments auth check:", err)
    }
  }, [user, loading, router])

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
        *,
        patient_profile:profiles!appointments_patient_id_fkey(
          full_name,
          email
        )
      `)
        .order("appointment_date", { ascending: true })

      if (error) {
        console.error("Error loading appointments:", error)
        return
      }

      setAppointments(data || [])
      setFilteredAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
    }
  }

  useEffect(() => {
    if (user && user.role === "admin") {
      loadAppointments()
    }
  }, [user])

  useEffect(() => {
    let filtered = appointments

    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    if (dateFilter) {
      filtered = filtered.filter((apt) => apt.appointment_date.startsWith(dateFilter))
    }

    setFilteredAppointments(filtered)
  }, [appointments, statusFilter, dateFilter])

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId)

      if (error) {
        throw error
      }

      // Reload appointments
      await loadAppointments()
    } catch (error) {
      console.error("Error updating appointment status:", error)
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-clarity-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state if there's an authentication error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => router.push("/auth/signin?tab=admin")}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Show unauthorized message if no user or wrong role
  if (!user || user.role !== "admin") {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const stats = {
    totalToday: filteredAppointments.filter((apt) =>
      apt.appointment_date.startsWith(new Date().toISOString().split("T")[0]),
    ).length,
    confirmed: filteredAppointments.filter((apt) => apt.status === "confirmed").length,
    pending: filteredAppointments.filter((apt) => apt.status === "pending").length,
    virtual: filteredAppointments.filter((apt) => apt.appointment_type === "virtual").length,
  }

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("📅 Scheduling appointment:", newAppointment)

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAppointment),
      })

      if (response.ok) {
        console.log("✅ Appointment scheduled successfully")
        setNewAppointment({ patientName: "", provider: "", datetime: "", status: "Upcoming" })
        setIsScheduleModalOpen(false)
        // Refresh appointments list here if needed
      } else {
        console.error("❌ Failed to schedule appointment:", response.statusText)
      }
    } catch (error) {
      console.error("❌ Error scheduling appointment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointment Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage and schedule appointments for all providers.</p>
          </div>
          <Button onClick={() => setIsScheduleModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-clarity-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.confirmed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Video className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Virtual</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.virtual}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date and Status Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredAppointments.length} appointments
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(appointment.appointment_date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{appointment.duration}min</p>
                    </div>
                    <div className="h-12 w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {appointment.patient_profile?.full_name || "Unknown Patient"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.appointment_type} - {appointment.reason}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{appointment.patient_profile?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <StatusBadge status={appointment.status} type="appointment" />
                    <div className="flex space-x-1">
                      {appointment.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "confirmed")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">Appointment Privacy</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All appointment data is confidential and protected under HIPAA regulations. Access is logged for
                  compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Appointment Modal */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Schedule New Appointment</h2>
              <form onSubmit={handleScheduleAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Patient Name *</label>
                  <Input
                    required
                    value={newAppointment.patientName}
                    onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                    placeholder="Patient name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Provider *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    value={newAppointment.provider}
                    onChange={(e) => setNewAppointment({ ...newAppointment, provider: e.target.value })}
                  >
                    <option value="">Select Provider</option>
                    <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                    <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                    <option value="Dr. Emily Rodriguez">Dr. Emily Rodriguez</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time *</label>
                  <Input
                    type="datetime-local"
                    required
                    value={newAppointment.datetime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, datetime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newAppointment.status}
                    onChange={(e) => setNewAppointment({ ...newAppointment, status: e.target.value })}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Appointment"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
