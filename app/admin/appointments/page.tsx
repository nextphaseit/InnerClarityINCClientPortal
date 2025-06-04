"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Calendar, Clock, Plus, Filter, Users, Video, MapPin, Shield } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"

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

  // Use our custom auth hook which handles client/server rendering safely
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      console.log("Unauthorized access to admin appointments page")
      router.push("/auth/signin")
      return
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-clarity-blue-500"></div>
      </div>
    )
  }

  // Show unauthorized message if no user or wrong role
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
          <Button className="mt-4" onClick={() => router.push("/auth/signin")}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // Mock appointments data
  const appointments = [
    {
      id: "1",
      time: "09:00 AM",
      client: "John Smith",
      provider: "Dr. Sarah Johnson",
      type: "Therapy Session",
      status: "confirmed",
      location: "Virtual",
      duration: 50,
    },
    {
      id: "2",
      time: "10:30 AM",
      client: "Jane Doe",
      provider: "Dr. Michael Chen",
      type: "Initial Consultation",
      status: "confirmed",
      location: "Office - Room 201",
      duration: 60,
    },
    {
      id: "3",
      time: "02:00 PM",
      client: "Robert Wilson",
      provider: "Dr. Sarah Johnson",
      type: "Follow-up",
      status: "pending",
      location: "Virtual",
      duration: 30,
    },
    {
      id: "4",
      time: "03:30 PM",
      client: "Lisa Anderson",
      provider: "Dr. Emily Rodriguez",
      type: "Assessment",
      status: "confirmed",
      location: "Office - Room 103",
      duration: 90,
    },
  ]

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
    totalToday: appointments.length,
    confirmed: appointments.filter((apt) => apt.status === "confirmed").length,
    pending: appointments.filter((apt) => apt.status === "pending").length,
    virtual: appointments.filter((apt) => apt.location === "Virtual").length,
  }

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAppointment),
      })

      if (response.ok) {
        console.log("Appointment scheduled successfully")
        setNewAppointment({ patientName: "", provider: "", datetime: "", status: "Upcoming" })
        setIsScheduleModalOpen(false)
        // Refresh appointments list here if needed
      } else {
        console.error("Failed to schedule appointment")
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error)
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

        {/* Date Selector and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                />
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing appointments for {formatDate(selectedDate)}
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
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">{appointment.time}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{appointment.duration}min</p>
                    </div>
                    <div className="h-12 w-px bg-gray-200 dark:bg-gray-700"></div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{appointment.client}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.type} with {appointment.provider}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {appointment.location === "Virtual" ? (
                          <Video className="h-3 w-3 text-gray-400" />
                        ) : (
                          <MapPin className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-500">{appointment.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
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
                    {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
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
