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
import { Calendar, Clock, User, Plus, CheckCircle } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Appointment {
  id: string
  patient_id: string
  provider_name: string
  appointment_date: string
  appointment_time: string
  duration: number
  type: string
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  notes?: string
  created_at: string
}

export default function AppointmentsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const [requestForm, setRequestForm] = useState({
    preferred_date: "",
    preferred_time: "",
    type: "",
    reason: "",
    notes: "",
  })

  // Mock appointments data
  const mockAppointments: Appointment[] = [
    {
      id: "1",
      patient_id: "user-id",
      provider_name: "Dr. Sarah Johnson",
      appointment_date: "2024-02-15",
      appointment_time: "10:00",
      duration: 60,
      type: "Individual Therapy",
      status: "scheduled",
      notes: "Follow-up session for anxiety management",
      created_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      patient_id: "user-id",
      provider_name: "Dr. Michael Chen",
      appointment_date: "2024-02-08",
      appointment_time: "14:30",
      duration: 90,
      type: "Psychological Assessment",
      status: "completed",
      notes: "Initial assessment completed",
      created_at: "2024-01-08T14:30:00Z",
    },
    {
      id: "3",
      patient_id: "user-id",
      provider_name: "Dr. Emily Rodriguez",
      appointment_date: "2024-01-25",
      appointment_time: "11:00",
      duration: 60,
      type: "Family Therapy",
      status: "completed",
      created_at: "2024-01-25T11:00:00Z",
    },
  ]

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

      // In a real app, load from Supabase
      // const { data, error } = await supabase
      //   .from('appointments')
      //   .select('*')
      //   .eq('patient_id', user.id)
      //   .order('appointment_date', { ascending: false })

      setAppointments(mockAppointments)
    } catch (error) {
      console.error("Error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setMessage("")

    try {
      // In a real app, insert into Supabase
      // const { error } = await supabase.from('appointment_requests').insert({
      //   patient_id: user.id,
      //   preferred_date: requestForm.preferred_date,
      //   preferred_time: requestForm.preferred_time,
      //   type: requestForm.type,
      //   reason: requestForm.reason,
      //   notes: requestForm.notes,
      //   status: 'pending'
      // })

      console.log("Appointment request submitted:", requestForm)

      setMessage("Appointment request submitted successfully! We'll contact you within 24 hours.")
      setShowRequestForm(false)
      setRequestForm({
        preferred_date: "",
        preferred_time: "",
        type: "",
        reason: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error submitting request:", error)
      setMessage("Error submitting request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "no-show":
        return <Badge className="bg-yellow-100 text-yellow-800">No Show</Badge>
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

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "scheduled" && new Date(apt.appointment_date) >= new Date(),
  )
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "completed" || new Date(apt.appointment_date) < new Date(),
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
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
              <p className="text-slate-600">Manage your therapy sessions and appointments</p>
            </div>
            <Button onClick={() => setShowRequestForm(!showRequestForm)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Request Appointment
            </Button>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
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
                      <Label htmlFor="preferred_date">Preferred Date</Label>
                      <Input
                        id="preferred_date"
                        type="date"
                        value={requestForm.preferred_date}
                        onChange={(e) => setRequestForm({ ...requestForm, preferred_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferred_time">Preferred Time</Label>
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
                    <Label htmlFor="type">Appointment Type</Label>
                    <Input
                      id="type"
                      value={requestForm.type}
                      onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
                      placeholder="Individual Therapy, Family Therapy, etc."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason for Visit</Label>
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
                      {submitting ? "Submitting..." : "Submit Request"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Appointments */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming appointments scheduled</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="font-medium">{appointment.provider_name}</span>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(appointment.appointment_date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(appointment.appointment_time)} ({appointment.duration} min)
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{appointment.type}</p>
                          {appointment.notes && <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Appointments</h2>
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No past appointments</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <span className="font-medium">{appointment.provider_name}</span>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(appointment.appointment_date)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTime(appointment.appointment_time)} ({appointment.duration} min)
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{appointment.type}</p>
                          {appointment.notes && <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>}
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
