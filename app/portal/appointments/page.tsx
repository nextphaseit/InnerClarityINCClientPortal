"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, User, ArrowLeft, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Appointment {
  id: string
  date: string
  time: string
  type: string
  status: "confirmed" | "completed" | "cancelled" | "pending"
  provider: string
  notes?: string
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    date: "2024-06-10",
    time: "10:00 AM",
    type: "Therapy Session",
    status: "confirmed",
    provider: "Dr. Sarah Johnson",
    notes: "Initial consultation",
  },
  {
    id: "2",
    date: "2024-06-17",
    time: "2:30 PM",
    type: "Follow-up Session",
    status: "confirmed",
    provider: "Dr. Sarah Johnson",
  },
  {
    id: "3",
    date: "2024-06-24",
    time: "11:00 AM",
    type: "Group Therapy",
    status: "pending",
    provider: "Dr. Michael Chen",
  },
  {
    id: "4",
    date: "2024-05-27",
    time: "3:00 PM",
    type: "Therapy Session",
    status: "completed",
    provider: "Dr. Sarah Johnson",
    notes: "Progress review completed",
  },
  {
    id: "5",
    date: "2024-05-20",
    time: "10:30 AM",
    type: "Initial Assessment",
    status: "completed",
    provider: "Dr. Sarah Johnson",
  },
  {
    id: "6",
    date: "2024-05-13",
    time: "1:00 PM",
    type: "Therapy Session",
    status: "cancelled",
    provider: "Dr. Michael Chen",
    notes: "Rescheduled by patient",
  },
]

const getStatusIcon = (status: Appointment["status"]) => {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "completed":
      return <CheckCircle className="h-5 w-5 text-blue-500" />
    case "cancelled":
      return <XCircle className="h-5 w-5 text-red-500" />
    case "pending":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />
  }
}

const getStatusColor = (status: Appointment["status"]) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "completed":
      return "bg-blue-100 text-blue-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [appointments] = useState<Appointment[]>(mockAppointments)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("🔐 Checking Supabase authentication...")

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("❌ Auth error:", error)
        router.push("/auth/login")
        return
      }

      if (!user) {
        console.log("❌ No authenticated user found")
        router.push("/auth/login")
        return
      }

      console.log("✅ User authenticated:", user.email)
      setUser(user)
    } catch (error) {
      console.error("❌ Unexpected auth error:", error)
      router.push("/auth/login")
    } finally {
      setIsLoading(false)
    }
  }

  // Separate upcoming and past appointments
  const today = new Date()
  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date)
    return aptDate >= today && apt.status !== "completed" && apt.status !== "cancelled"
  })

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.date)
    return aptDate < today || apt.status === "completed" || apt.status === "cancelled"
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/portal/dashboard"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600">Welcome back, {user?.email}. Here are your scheduled appointments.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-teal-600" />
              Upcoming Appointments
            </h2>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No upcoming appointments</p>
                <p className="text-gray-400 text-sm mt-2">Contact your provider to schedule your next session</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{appointment.type}</h3>
                        <div className="flex items-center text-gray-600 text-sm space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(appointment.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.provider}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded">{appointment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-gray-600" />
              Past Appointments
            </h2>

            {pastAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No past appointments</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pastAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{appointment.type}</h3>
                        <div className="flex items-center text-gray-600 text-sm space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(appointment.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm mt-1">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.provider}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded">{appointment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium">
              Schedule New Appointment
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              View Calendar
            </button>
            <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Contact Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
