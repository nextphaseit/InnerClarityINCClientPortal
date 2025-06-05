"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { AlertCircle, CalendarIcon, Check, Clock, X } from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, isSameDay } from "date-fns"
import { TelehealthSession } from "@/components/telehealth-session"

interface TimeSlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  isAvailable: boolean
  provider: string
}

interface Appointment {
  id: string
  date: string
  time: string
  provider: string
  status: "confirmed" | "pending" | "cancelled" | "no-show"
  type: string
  meetingLink?: string
}

export default function AppointmentsPage() {
  const { user } = usePatientAuth()
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const router = useRouter()

  // Find the next upcoming appointment for telehealth
  const upcomingAppointment =
    appointments.length > 0
      ? appointments.find(
          (app) =>
            app.status === "confirmed" && new Date(app.date) >= new Date() && app.type.toLowerCase().includes("video"),
        )
      : null

  // Convert the upcoming appointment to the format expected by TelehealthSession
  const telehealthAppointment = upcomingAppointment
    ? {
        id: upcomingAppointment.id,
        date: upcomingAppointment.date,
        startTime: upcomingAppointment.time.split(" - ")[0],
        endTime: upcomingAppointment.time.split(" - ")[1],
        provider: upcomingAppointment.provider,
        type: "video",
        status: upcomingAppointment.status,
        meetingLink: upcomingAppointment.meetingLink || "https://teams.microsoft.com/l/meetup-join/sample-meeting-link",
      }
    : null

  useEffect(() => {
    if (!user) {
      router.push("/portal/auth/signin")
      return
    }
    loadAppointmentsAndSlots()
  }, [user, router, currentWeekStart])

  const loadAppointmentsAndSlots = async () => {
    setLoading(true)
    setError("")

    try {
      // Demo data for available slots
      const weekDays = eachDayOfInterval({
        start: currentWeekStart,
        end: endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
      })

      const mockTimeSlots: TimeSlot[] = []
      const providers = ["Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown"]

      weekDays.forEach((day) => {
        // Skip weekends
        if (day.getDay() === 0 || day.getDay() === 6) return

        // Morning slots
        for (let hour = 9; hour < 12; hour++) {
          const isAvailable = Math.random() > 0.3 // 70% chance of being available
          mockTimeSlots.push({
            id: `${format(day, "yyyy-MM-dd")}-${hour}:00`,
            date: day,
            startTime: `${hour}:00`,
            endTime: `${hour}:30`,
            isAvailable,
            provider: providers[Math.floor(Math.random() * providers.length)],
          })
          mockTimeSlots.push({
            id: `${format(day, "yyyy-MM-dd")}-${hour}:30`,
            date: day,
            startTime: `${hour}:30`,
            endTime: `${hour + 1}:00`,
            isAvailable: Math.random() > 0.3,
            provider: providers[Math.floor(Math.random() * providers.length)],
          })
        }

        // Afternoon slots
        for (let hour = 13; hour < 17; hour++) {
          mockTimeSlots.push({
            id: `${format(day, "yyyy-MM-dd")}-${hour}:00`,
            date: day,
            startTime: `${hour}:00`,
            endTime: `${hour}:30`,
            isAvailable: Math.random() > 0.3,
            provider: providers[Math.floor(Math.random() * providers.length)],
          })
          mockTimeSlots.push({
            id: `${format(day, "yyyy-MM-dd")}-${hour}:30`,
            date: day,
            startTime: `${hour}:30`,
            endTime: `${hour + 1}:00`,
            isAvailable: Math.random() > 0.3,
            provider: providers[Math.floor(Math.random() * providers.length)],
          })
        }
      })

      setAvailableSlots(mockTimeSlots)

      // Mock appointments - add a video appointment that's coming up soon
      const today = new Date()
      const fifteenMinutesFromNow = new Date(today.getTime() + 15 * 60000)
      const formattedUpcomingDate = format(fifteenMinutesFromNow, "yyyy-MM-dd")
      const upcomingHour = fifteenMinutesFromNow.getHours()
      const upcomingMinute = fifteenMinutesFromNow.getMinutes() < 30 ? "00" : "30"
      const nextHour = upcomingMinute === "00" ? upcomingHour : upcomingHour + 1
      const nextMinute = upcomingMinute === "00" ? "30" : "00"

      const mockAppointments: Appointment[] = [
        {
          id: "video-soon",
          date: formattedUpcomingDate,
          time: `${upcomingHour}:${upcomingMinute} - ${nextHour}:${nextMinute}`,
          provider: "Dr. Smith",
          status: "confirmed",
          type: "Video Consultation",
          meetingLink: "https://teams.microsoft.com/l/meetup-join/sample-meeting-link",
        },
        {
          id: "1",
          date: format(addDays(new Date(), 3), "yyyy-MM-dd"),
          time: "10:00 - 10:30",
          provider: "Dr. Johnson",
          status: "confirmed",
          type: "Check-up",
        },
        {
          id: "2",
          date: format(addDays(new Date(), 10), "yyyy-MM-dd"),
          time: "14:30 - 15:00",
          provider: "Dr. Williams",
          status: "pending",
          type: "Follow-up",
        },
      ]

      setAppointments(mockAppointments)
    } catch (error) {
      console.error("Error loading appointments:", error)
      setError("Unable to load appointments. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedSlot || !user) return

    setBookingLoading(true)
    setMessage("")
    setError("")

    try {
      // In a real app, we would save to Supabase here
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      // Add the new appointment to the list
      const newAppointment: Appointment = {
        id: `new-${Date.now()}`,
        date: format(selectedSlot.date, "yyyy-MM-dd"),
        time: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
        provider: selectedSlot.provider,
        status: "pending",
        type: "New Appointment",
      }

      setAppointments([...appointments, newAppointment])

      // Mark the slot as unavailable
      setAvailableSlots(
        availableSlots.map((slot) => (slot.id === selectedSlot.id ? { ...slot, isAvailable: false } : slot)),
      )

      setSelectedSlot(null)
      setMessage("Appointment requested successfully! Awaiting confirmation.")
    } catch (error) {
      console.error("Error booking appointment:", error)
      setError("Unable to book appointment. Please try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  const getSlotsForDate = (date: Date | undefined) => {
    if (!date) return []
    return availableSlots.filter((slot) => isSameDay(slot.date, date))
  }

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-600">Schedule and manage your appointments</p>
        </div>

        {/* Telehealth Session Card */}
        <div className="mb-8">
          <TelehealthSession appointment={telehealthAppointment} />
        </div>

        {error && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">{message}</div>
        )}

        <Tabs defaultValue="book" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="book">Book Appointment</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="md:col-span-1 backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Select Date
                  </CardTitle>
                  <CardDescription>Choose a date for your appointment</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                  />
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                      Previous Week
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextWeek}>
                      Next Week
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Available Slots */}
              <Card className="md:col-span-2 backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <Clock className="h-5 w-5 mr-2" />
                    Available Time Slots
                  </CardTitle>
                  <CardDescription>
                    {selectedDate
                      ? `Select a time slot for ${format(selectedDate, "EEEE, MMMM d, yyyy")}`
                      : "Please select a date first"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {getSlotsForDate(selectedDate).length > 0 ? (
                          getSlotsForDate(selectedDate).map((slot) => (
                            <div
                              key={slot.id}
                              className={`
                                p-3 rounded-lg border transition-all cursor-pointer
                                ${
                                  selectedSlot?.id === slot.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300"
                                }
                                ${!slot.isAvailable && "opacity-50 cursor-not-allowed"}
                              `}
                              onClick={() => {
                                if (slot.isAvailable) {
                                  setSelectedSlot(slot)
                                }
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                {slot.isAvailable ? (
                                  <Badge className="bg-green-500">Available</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500 border-gray-300">
                                    Booked
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">{slot.provider}</div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-8 text-gray-500">
                            No available slots for this date. Please select another date.
                          </div>
                        )}
                      </div>

                      {selectedSlot && (
                        <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                          <h3 className="font-medium text-blue-800">Selected Appointment</h3>
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Date:</span>{" "}
                              {format(selectedSlot.date, "EEEE, MMMM d, yyyy")}
                            </div>
                            <div>
                              <span className="text-gray-500">Time:</span> {selectedSlot.startTime} -{" "}
                              {selectedSlot.endTime}
                            </div>
                            <div>
                              <span className="text-gray-500">Provider:</span> {selectedSlot.provider}
                            </div>
                          </div>
                          <Button
                            onClick={handleBookAppointment}
                            disabled={bookingLoading}
                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                          >
                            {bookingLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Booking...
                              </>
                            ) : (
                              "Book This Appointment"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Please select a date to see available slots.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-slate-800">Your Appointments</CardTitle>
                <CardDescription>View and manage your upcoming appointments</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-4 border rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                            <span className="font-medium">
                              {new Date(appointment.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-600" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.provider} • {appointment.type}
                          </div>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center">
                          <Badge
                            className={`
                              ${appointment.status === "confirmed" ? "bg-green-500" : ""}
                              ${appointment.status === "pending" ? "bg-amber-500" : ""}
                              ${appointment.status === "cancelled" ? "bg-red-500" : ""}
                              ${appointment.status === "no-show" ? "bg-red-500" : ""}
                            `}
                          >
                            {appointment.status === "confirmed" && <Check className="h-3 w-3 mr-1" />}
                            {appointment.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {appointment.status === "cancelled" && <X className="h-3 w-3 mr-1" />}
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                          <Button variant="ghost" size="sm" className="ml-2">
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    You don't have any upcoming appointments. Book one now!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
