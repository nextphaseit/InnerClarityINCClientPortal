"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { Calendar, Clock, User, Loader2, CheckCircle, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

interface AppointmentRequest {
  id: string
  patient_id: string
  preferred_date: string
  preferred_time: string
  appointment_type: string
  reason: string
  notes?: string
  status: "pending" | "approved" | "rejected" | "scheduled"
  created_at: string
  patient_profile?: {
    full_name: string
    email: string
  }
}

export default function AdminAppointmentRequestsPage() {
  const router = useRouter()
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

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

      loadAppointmentRequests()
    }
  }, [user, authLoading, router])

  const loadAppointmentRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("appointment_requests")
        .select(`
          *,
          patient_profile:profiles!appointment_requests_patient_id_fkey(
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading appointment requests:", error)
        return
      }

      setAppointmentRequests(data || [])
    } catch (error) {
      console.error("Error loading appointment requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (requestId: string, newStatus: "approved" | "rejected") => {
    setUpdating(requestId)

    try {
      const { error } = await supabase
        .from("appointment_requests")
        .update({
          status: newStatus,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) {
        throw error
      }

      // Reload data
      await loadAppointmentRequests()
    } catch (error) {
      console.error("Error updating request status:", error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: AppointmentRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const filteredRequests = appointmentRequests.filter((request) => {
    if (statusFilter === "all") return true
    return request.status === statusFilter
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-clarity-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointment Requests</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Review and manage patient appointment requests.</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clarity-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-clarity-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{appointmentRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {appointmentRequests.filter((r) => r.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {appointmentRequests.filter((r) => r.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {appointmentRequests.filter((r) => r.status === "scheduled").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointment requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatDate(request.preferred_date)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{formatTime(request.preferred_time)}</p>
                      </div>
                      <div className="h-12 w-px bg-gray-200 dark:bg-gray-700"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {request.patient_profile?.full_name || "Unknown Patient"}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{request.patient_profile?.email}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {request.appointment_type}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Reason: {request.reason}</p>
                        {request.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Notes: {request.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted:{" "}
                          {new Date(request.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {getStatusBadge(request.status)}
                      {request.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, "approved")}
                            disabled={updating === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updating === request.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRequestStatus(request.id, "rejected")}
                            disabled={updating === request.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {updating === request.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
