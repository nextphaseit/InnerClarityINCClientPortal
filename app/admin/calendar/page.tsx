"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Clock, Users } from "lucide-react"
import { AuthProtection } from "@/components/auth-protection"

interface CalendarEvent {
  id: string
  title: string
  patientName: string
  startTime: string
  endTime: string
  type: "appointment" | "telehealth" | "consultation"
  status: "scheduled" | "confirmed" | "cancelled"
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockEvents: CalendarEvent[] = [
      {
        id: "CAL-001",
        title: "Regular Checkup",
        patientName: "John Doe",
        startTime: "2024-01-15T09:00:00Z",
        endTime: "2024-01-15T09:30:00Z",
        type: "appointment",
        status: "confirmed",
      },
      {
        id: "CAL-002",
        title: "Therapy Session",
        patientName: "Jane Smith",
        startTime: "2024-01-15T14:00:00Z",
        endTime: "2024-01-15T15:00:00Z",
        type: "telehealth",
        status: "scheduled",
      },
      {
        id: "CAL-003",
        title: "Follow-up Consultation",
        patientName: "Bob Johnson",
        startTime: "2024-01-16T10:00:00Z",
        endTime: "2024-01-16T10:30:00Z",
        type: "consultation",
        status: "confirmed",
      },
    ]

    setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 1000)
  }, [])

  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.startTime).toDateString()
    const today = new Date().toDateString()
    return eventDate === today
  })

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.startTime)
    const today = new Date()
    return eventDate > today
  })

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "appointment":
        return <Badge className="bg-blue-100 text-blue-800">Appointment</Badge>
      case "telehealth":
        return <Badge className="bg-green-100 text-green-800">Telehealth</Badge>
      case "consultation":
        return <Badge className="bg-purple-100 text-purple-800">Consultation</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthProtection requiredRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-gray-600">Manage appointments and schedule</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{"Today's Events"}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayEvents.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">Future appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(events.map((e) => e.patientName)).size}</div>
              <p className="text-xs text-muted-foreground">Unique patients</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {"Today's Schedule"}
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No events scheduled for today</p>
              ) : (
                todayEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{event.title}</span>
                        {getEventTypeBadge(event.type)}
                      </div>
                      <p className="text-sm text-gray-600">{event.patientName}</p>
                      <p className="text-sm text-gray-500">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(event.status)}
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Next scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{event.title}</span>
                      {getEventTypeBadge(event.type)}
                    </div>
                    <p className="text-sm text-gray-600">{event.patientName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.startTime).toLocaleDateString()} at {formatTime(event.startTime)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(event.status)}
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && <p className="text-gray-500 text-center py-4">No upcoming events</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProtection>
  )
}
