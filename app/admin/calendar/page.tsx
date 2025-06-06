"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CalendarDays, Clock, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CalendarEvent {
  id: string
  title: string
  patient_name?: string
  provider_name: string
  start_time: string
  end_time: string
  type: "appointment" | "meeting" | "break" | "blocked"
  status: "confirmed" | "tentative" | "cancelled"
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week")
  const { toast } = useToast()

  useEffect(() => {
    loadCalendarData()
  }, [currentDate])

  const loadCalendarData = async () => {
    try {
      setLoading(true)

      // Mock data for demo
      const mockEvents: CalendarEvent[] = [
        {
          id: "CAL-001",
          title: "Therapy Session",
          patient_name: "John Smith",
          provider_name: "Dr. Sarah Johnson",
          start_time: "2024-02-15T10:00:00Z",
          end_time: "2024-02-15T11:00:00Z",
          type: "appointment",
          status: "confirmed",
        },
        {
          id: "CAL-002",
          title: "Team Meeting",
          provider_name: "All Staff",
          start_time: "2024-02-15T12:00:00Z",
          end_time: "2024-02-15T13:00:00Z",
          type: "meeting",
          status: "confirmed",
        },
        {
          id: "CAL-003",
          title: "Group Therapy",
          patient_name: "Multiple Patients",
          provider_name: "Dr. Michael Chen",
          start_time: "2024-02-15T14:00:00Z",
          end_time: "2024-02-15T15:30:00Z",
          type: "appointment",
          status: "confirmed",
        },
      ]

      setEvents(mockEvents)
    } catch (error) {
      console.error("Error loading calendar data:", error)
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "appointment":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Appointment</Badge>
      case "meeting":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Meeting</Badge>
      case "break":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Break</Badge>
      case "blocked":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Blocked</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>
      case "tentative":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Tentative</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage appointments and schedule</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button variant={viewMode === "day" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("day")}>
                Day
              </Button>
              <Button variant={viewMode === "week" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("week")}>
                Week
              </Button>
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                Month
              </Button>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  ...(viewMode === "day" && { day: "numeric" }),
                })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid Placeholder */}
            <div className="grid grid-cols-7 gap-4 mb-6">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium text-gray-600 p-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => (
                <div key={i} className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50">
                  <div className="text-sm text-gray-600">{(i % 31) + 1}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2" />
              Upcoming Events ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(event.start_time)} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{event.provider_name}</span>
                        {event.patient_name && (
                          <>
                            <span>•</span>
                            <span>{event.patient_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getEventTypeBadge(event.type)}
                    {getStatusBadge(event.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
