"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PortalNavigation } from "@/components/portal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, User, Plus } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  duration: number
  provider: string
  type: string
  status: "scheduled" | "completed" | "cancelled"
}

export default function CalendarPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Mock calendar events
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Individual Therapy",
      date: "2024-02-15",
      time: "10:00",
      duration: 60,
      provider: "Dr. Sarah Johnson",
      type: "Individual Therapy",
      status: "scheduled",
    },
    {
      id: "2",
      title: "Group Therapy",
      date: "2024-02-20",
      time: "14:00",
      duration: 90,
      provider: "Dr. Emily Rodriguez",
      type: "Group Therapy",
      status: "scheduled",
    },
    {
      id: "3",
      title: "Follow-up Session",
      date: "2024-02-28",
      time: "11:30",
      duration: 60,
      provider: "Dr. Sarah Johnson",
      type: "Individual Therapy",
      status: "scheduled",
    },
  ]

  useEffect(() => {
    checkAuthAndLoadEvents()
  }, [])

  const checkAuthAndLoadEvents = async () => {
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
      //   .gte('appointment_date', new Date().toISOString().split('T')[0])

      setEvents(mockEvents)
    } catch (error) {
      console.error("Error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return events.filter((event) => event.date === dateString)
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

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const days = getDaysInMonth(currentDate)
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Calendar</h1>
              <p className="text-slate-600">View your upcoming appointments and sessions</p>
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Request Appointment
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {dayNames.map((day) => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      if (!day) {
                        return <div key={index} className="p-2 h-24"></div>
                      }

                      const dayEvents = getEventsForDate(day)
                      const isCurrentDay = isToday(day)
                      const isSelectedDay = isSelected(day)

                      return (
                        <div
                          key={day.toISOString()}
                          onClick={() => setSelectedDate(day)}
                          className={`p-2 h-24 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                            isCurrentDay ? "bg-teal-50 border-teal-200" : ""
                          } ${isSelectedDay ? "bg-blue-50 border-blue-200" : ""}`}
                        >
                          <div
                            className={`text-sm font-medium mb-1 ${isCurrentDay ? "text-teal-700" : "text-gray-900"}`}
                          >
                            {day.getDate()}
                          </div>

                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className="text-xs bg-teal-100 text-teal-800 px-1 py-0.5 rounded truncate"
                                title={`${event.title} - ${formatTime(event.time)}`}
                              >
                                {formatTime(event.time)}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Date Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    {selectedDate
                      ? selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })
                      : "Select a Date"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    selectedDateEvents.length > 0 ? (
                      <div className="space-y-4">
                        {selectedDateEvents.map((event) => (
                          <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900">{event.title}</h3>
                              <Badge className="bg-teal-100 text-teal-800">{event.status}</Badge>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                {formatTime(event.time)} ({event.duration} min)
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                {event.provider}
                              </div>
                              <div className="text-xs bg-gray-100 px-2 py-1 rounded">{event.type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No appointments scheduled</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Click on a date to view appointments</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your next scheduled sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events
                      .filter((event) => new Date(event.date) >= new Date())
                      .slice(0, 3)
                      .map((event) => (
                        <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.date).toLocaleDateString()} at {formatTime(event.time)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
