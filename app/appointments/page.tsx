"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Calendar, Clock, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Appointment {
  id: string
  date: string
  time: string
  provider: string
  status: "Upcoming" | "Completed" | "Canceled"
  type?: string
}

export default function MyAppointmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/appointments")

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status} ${response.statusText}`)
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError)
        throw new Error("Invalid response format")
      }

      // Check if data has the expected structure
      if (!data || !Array.isArray(data.appointments)) {
        // Use a default empty array if appointments is missing or not an array
        setAppointments([])
        console.warn("Appointments data is missing or invalid, using empty array")
      } else {
        setAppointments(data.appointments || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching appointments")
      console.error("Error fetching appointments:", err)
      // Set appointments to empty array on error
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "Canceled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const formatTime = (timeString: string) => {
    try {
      return timeString || "N/A"
    } catch (error) {
      console.error("Error formatting time:", error)
      return "N/A"
    }
  }

  const handleReschedule = (appointmentId: string) => {
    try {
      router.push(`/appointments/book?reschedule=${appointmentId}`)
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback to window.location if router fails
      window.location.href = `/appointments/book?reschedule=${appointmentId}`
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your upcoming and past appointments</p>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg rounded-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-t-xl">
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              /* Loading State */
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading appointments...</p>
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Error loading appointments</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  <Button onClick={() => fetchAppointments()} className="mt-4" variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : appointments.length === 0 ? (
              /* Empty State */
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You don't have any appointments scheduled at this time.
                  </p>
                </div>
              </div>
            ) : (
              /* Appointments Table/List */
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                            Date
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-blue-600" />
                            Time
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-blue-600" />
                            Provider
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment, index) => (
                        <tr
                          key={appointment.id}
                          className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            index === appointments.length - 1 ? "border-b-0" : ""
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatDate(appointment.date)}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-gray-700 dark:text-gray-300">{formatTime(appointment.time)}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-gray-700 dark:text-gray-300">{appointment.provider}</div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </td>
                          <td className="py-4 px-6">
                            {appointment.status === "Upcoming" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReschedule(appointment.id)}
                                className="text-clarity-blue-600 border-clarity-blue-200 hover:bg-clarity-blue-50"
                              >
                                Reschedule
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <Calendar className="mr-1 h-4 w-4" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="mr-1 h-4 w-4" />
                              {formatTime(appointment.time)}
                            </div>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </div>
                        <div className="flex items-center text-gray-900 dark:text-white">
                          <User className="mr-2 h-4 w-4 text-blue-600" />
                          <span className="font-medium">{appointment.provider}</span>
                        </div>
                        {appointment.type && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{appointment.type}</div>
                        )}
                        {appointment.status === "Upcoming" && (
                          <div className="mt-3 flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReschedule(appointment.id)}
                              className="text-clarity-blue-600 border-clarity-blue-200 hover:bg-clarity-blue-50"
                            >
                              Reschedule
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
