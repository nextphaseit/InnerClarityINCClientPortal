"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, Video, Phone, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

interface Appointment {
  id: string
  date: string
  time: string
  type: "in-person" | "telehealth" | "phone"
  provider: string
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  location?: string
  notes?: string
  duration: number
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status !== "loading") {
      if (!session) {
        router.push("/portal/auth/signin")
      } else if (session?.user) {
        loadAppointments()
      }
    }
  }, [session, status, router])

  const loadAppointments = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      setError("")

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", session.user.id)
        .order("date", { ascending: true })

      if (appointmentsError) {
        console.error("Error loading appointments:", appointmentsError)
        // Fallback to mock data for demo
        loadMockAppointments()
        return
      }

      if (appointmentsData && appointmentsData.length > 0) {
        // Transform the data to match our interface
        const formattedAppointments = appointmentsData.map((apt) => ({
          id: apt.id,
          date: apt.date,
          time: apt.time,
          type: apt.type || "in-person",
          provider: apt.provider_name || "Dr. Smith",
          status: apt.status || "scheduled",
          location: apt.location,
          notes: apt.notes,
          duration: apt.duration || 60,
        }))

        setAppointments(formattedAppointments)
      } else {
        // No appointments found, use mock data
        loadMockAppointments()
      }
    } catch (error) {
      console.error("Error loading appointments:", error)
      setError("Failed to load appointments")
      loadMockAppointments()
    } finally {
      setLoading(false)
    }
  }

  const loadMockAppointments = () => {
    const mockAppointments: Appointment[] = [
      {
        id: "apt-1",
        date: "2024-01-20",
        time: "10:00",
        type: "telehealth",
        provider: "Dr. Sarah Johnson",
        status: "scheduled",
        notes: "Follow-up session to discuss progress with anxiety management techniques",
        duration: 60,
      },
      {
        id: "apt-2",
        date: "2024-01-13",
        time: "14:30",
        type: "in-person",
        provider: "Dr. Sarah Johnson",
        status: "completed",
        location: "123 Wellness Center, Suite 200",
        notes: "Initial consultation completed. Discussed treatment plan and goals.",
        duration: 90,
      },
      {
        id: "apt-3",
        date: "2024-01-27",
        time: "11:00",
        type: "phone",
        provider: "Maria Rodriguez",
        status: "scheduled",
        notes: "Check-in call with patient coordinator",
        duration: 30,
      },
    ]

    setAppointments(mockAppointments)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      case "no-show":
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            No Show
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "telehealth":
        return <Video className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      case "in-person":
      default:
        return <MapPin className="h-4 w-4" />
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
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const isUpcoming = (date: string) => {
    return new Date(date) >= new Date()
  }

  const upcomingAppointments = appointments.filter((apt) => isUpcoming(apt.date) && apt.status === "scheduled")
  const pastAppointments = appointments.filter((apt) => !isUpcoming(apt.date) || apt.status !== "scheduled")

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    )
  }

  // Handle unauthenticated state
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your appointments.</p>
          <Button onClick={() => router.push("/portal/auth/signin")} className="bg-teal-600 hover:bg-teal-700">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-teal-600" />
            Appointments
          </h1>
          <p className="mt-2 text-slate-600">Manage your upcoming and past appointments</p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Schedule new appointments or manage existing ones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => router.push("/appointments/book")} className="bg-teal-600 hover:bg-teal-700">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule New Appointment
              </Button>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Reschedule Appointment
              </Button>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Contact Office
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-500 mb-6">Schedule your next appointment to continue your care.</p>
                <Button onClick={() => router.push("/appointments/book")} className="bg-teal-600 hover:bg-teal-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-teal-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(appointment.type)}
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.provider}</h3>
                          {getStatusBadge(appointment.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(appointment.time)} ({appointment.duration} minutes)
                          </div>
                        </div>

                        {appointment.location && (
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            {appointment.location}
                          </div>
                        )}

                        {appointment.notes && <p className="text-gray-600 text-sm">{appointment.notes}</p>}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {appointment.type === "telehealth" && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Video className="h-4 w-4 mr-2" />
                            Join Video Call
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                        <Button size="sm" variant="outline">
                          Cancel
                        </Button>
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
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Past Appointments</h2>
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">No past appointments to display.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getTypeIcon(appointment.type)}
                          <h3 className="text-lg font-semibold text-gray-900">{appointment.provider}</h3>
                          {getStatusBadge(appointment.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(appointment.time)} ({appointment.duration} minutes)
                          </div>
                        </div>

                        {appointment.location && (
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            {appointment.location}
                          </div>
                        )}

                        {appointment.notes && <p className="text-gray-600 text-sm">{appointment.notes}</p>}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Book Follow-up
                        </Button>
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
  )
}
