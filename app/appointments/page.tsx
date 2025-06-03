"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Calendar, Clock, Video, MapPin, Plus, Edit, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

export default function AppointmentsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/auth/signin")
      return
    }

    if (user.role === "admin") {
      router.push("/admin/appointments")
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

  // Mock data - in a real app, this would come from your API
  const appointments = [
    {
      id: "1",
      date: new Date("2024-01-15T14:00:00"),
      provider: "Dr. Sarah Johnson",
      type: "Therapy Session",
      status: "confirmed",
      location: "Virtual",
      meetingLink: "https://meet.innerclarity.com/session-123",
      notes: "Follow-up on anxiety management techniques",
    },
    {
      id: "2",
      date: new Date("2024-01-22T10:30:00"),
      provider: "Dr. Michael Chen",
      type: "Initial Consultation",
      status: "confirmed",
      location: "123 Wellness St, Suite 200",
      notes: "New patient intake and assessment",
    },
    {
      id: "3",
      date: new Date("2024-01-08T16:00:00"),
      provider: "Dr. Sarah Johnson",
      type: "Therapy Session",
      status: "completed",
      location: "Virtual",
      notes: "Discussed coping strategies and homework assignments",
    },
  ]

  const upcomingAppointments = appointments.filter((apt) => apt.status !== "completed")
  const pastAppointments = appointments.filter((apt) => apt.status === "completed")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your therapy sessions and consultations.</p>
          </div>
          <Button asChild>
            <Link href="/appointments/book">
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Appointments</h2>

          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-6">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-l-4 border-l-clarity-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{appointment.type}</h3>
                            <p className="text-gray-600 dark:text-gray-400">with {appointment.provider}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-clarity-green-50 text-clarity-green-700 border-clarity-green-200"
                          >
                            {appointment.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{appointment.date.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>
                              {appointment.date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.location === "Virtual" ? (
                              <Video className="h-4 w-4 text-gray-400" />
                            ) : (
                              <MapPin className="h-4 w-4 text-gray-400" />
                            )}
                            <span>{appointment.location}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {appointment.meetingLink && (
                          <Button asChild size="sm">
                            <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer">
                              <Video className="mr-2 h-4 w-4" />
                              Join Session
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming appointments</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Schedule your next therapy session or consultation.
                </p>
                <Button asChild>
                  <Link href="/appointments/book">
                    <Plus className="mr-2 h-4 w-4" />
                    Book Your First Appointment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Past Appointments</h2>

          {pastAppointments.length > 0 ? (
            <div className="grid gap-4">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{appointment.type}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {appointment.provider} • {appointment.date.toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">{appointment.status}</Badge>
                        </div>

                        {appointment.notes && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{appointment.notes}</p>
                        )}
                      </div>

                      <Button variant="outline" size="sm">
                        View Summary
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No past appointments to display.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">Appointment Privacy</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All appointment information is confidential and protected under HIPAA regulations. Virtual sessions
                  use end-to-end encryption.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
