"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PortalNavigation } from "@/components/portal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Loader2 } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

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
  updated_at: string
}

export default function AppointmentsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const [requestForm, setRequestForm] = useState({
    preferred_date: "",
    preferred_time: "",
    appointment_type: "",
    reason: "",
    notes: "",
  })

  useEffect(() => {
    checkAuthAndLoadAppointments()
  }, [])

  const checkAuthAndLoadAppointments = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      await loadAppointmentRequests(user.id)
    } catch (error) {
      console.error("Error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const loadAppointmentRequests = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("appointment_requests")
        .select("*")
        .eq("patient_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading appointment requests:", error)
        return
      }

      setAppointmentRequests(data || [])
    } catch (error) {
      console.error("Error loading appointment requests:", error)
    }
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setMessage("")

    try {
      const { data, error } = await supabase
        .from("appointment_requests")
        .insert({
          patient_id: user.id,
          preferred_date: requestForm.preferred_date,
          preferred_time: requestForm.preferred_time,
          appointment_type: requestForm.appointment_type,
          reason: requestForm.reason,
          notes: requestForm.notes,
          status: "pending",
        })
        .select()

      if (error) {
        throw error
      }

      setMessage("Appointment request submitted successfully! We'll contact you within 24 hours.")
      setShowRequestForm(false)
      setRequestForm({
        preferred_date: "",
        preferred_time: "",
        appointment_type: "",
        reason: "",
        notes: "",
      })

      // Reload appointment requests
      await loadAppointmentRequests(user.id)
    } catch (error) {
      console.error("Error submitting request:", error)
      setMessage("Error submitting request. Please try again.")
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PortalNavigation />

      <div className="lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Appointments</h1>
              <p className="text-slate-600">Request and manage your therapy sessions</p>
            </div>
            <Button onClick={() => setShowRequestForm(!showRequestForm)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Request Appointment
            </Button>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("Error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Request Form */}
          {showRequestForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Request New Appointment</CardTitle>
                <CardDescription>Fill out the form below to request a new appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferred_date">Preferred Date *</Label>
                      <Input
                        id="preferred_date"
                        type="date"
                        value={requestForm.preferred_date}
                        onChange={(e) => setRequestForm({ ...requestForm, preferred_date: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferred_time">Preferred Time *</Label>
                      <Input
                        id="preferred_time"
                        type="time"
                        value={requestForm.preferred_time}
                        onChange={(e) => setRequestForm({ ...requestForm, preferred_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="appointment_type">Appointment Type *</Label>
                    <select
                      id="appointment_type"
                      value={requestForm.appointment_type}
                      onChange={(e) => setRequestForm({ ...requestForm, appointment_type: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select appointment type</option>
                      <option value="Individual Therapy">Individual Therapy</option>
                      <option value="Family Therapy">Family Therapy</option>
                      <option value="Couples Therapy">Couples Therapy</option>
                      <option value="Initial Consultation">Initial Consultation</option>
                      <option value="Follow-up Session">Follow-up Session</option>
                      <option value="Assessment">Assessment</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Visit *</Label>
                    <Input
                      id="reason"
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                      placeholder="Brief description of what you'd like to discuss"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={requestForm.notes}
                      onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                      placeholder="Any additional information or special requests"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Appointment Requests */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Appointment Requests</h2>
            {appointmentRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No appointment requests yet</p>
                  <p className="text-sm text-gray-400 mt-1">Submit your first appointment request to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointmentRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="font-medium">{request.appointment_type}</span>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(request.preferred_date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(request.preferred_time)}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Reason: {request.reason}</p>
                          {request.notes && <p className="text-sm text-gray-600 mb-2">Notes: {request.notes}</p>}
                          <p className="text-xs text-gray-500">
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
