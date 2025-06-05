"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, User } from "lucide-react"
import { usePatientAuth } from "@/hooks/use-patient-auth"

interface TimeSlot {
  id: string
  date: string
  time: string
  provider: string
  duration: number
  type: string
  available: boolean
  bookedBy?: string
}

interface Appointment {
  id: string
  patient_id: string
  provider_name: string
  date: string
  time: string
  type: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
}

export default function AppointmentsPage() {
  const { user } = usePatientAuth()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [selectedWeek, setSelectedWeek] = useState(0) // 0 = this week, 1 = next week, etc.
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/portal/auth/signin")
      return
    }
    loadAppointmentData()
  }, [user, router, selectedWeek])

  const loadAppointmentData = async () => {
    try {
      // Generate mock time slots for the selected week
      const mockSlots = generateMockTimeSlots(selectedWeek)
      setTimeSlots(mockSlots)

      if (isSupabaseConfigured() && user) {
        // Load real appointments from Supabase
        const { data: appointments } = await supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", user.id)
          .order("date", { ascending: true })

        setMyAppointments(appointments || [])
      } else {
        // Mock appointments for demo
        const mockAppointments: Appointment[] = [
          {
            id: "1",
            patient_id: user?.id || "demo",
            provider_name: "Dr. Sarah Johnson",
            date: "2024-12-20",
            time: "10:00",
            type: "Individual Therapy",
            status: "scheduled",
            notes: "Follow-up session",
          },
        ]
        setMyAppointments(mockAppointments)
      }
    } catch (error) {
      console.error("Error loading appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockTimeSlots = (weekOffset: number): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + weekOffset * 7)

    // Generate slots for 5 weekdays
    for (let day = 0; day < 5; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + day)

      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue

      const dateStr = currentDate.toISOString().split("T")[0]

      // Generate time slots from 9 AM to 5 PM
      const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

      times.forEach((time, index) => {
        const isBooked = Math.random() < 0.3 // 30% chance of being booked
        slots.push({
          id: `${dateStr}-${time}`,
          date: dateStr,
          time,
          provider: index % 2 === 0 ? "Dr. Sarah Johnson" : "Dr. Michael Chen",
          duration: 60,
          type: "Individual Therapy",
          available: !isBooked,
          bookedBy: isBooked ? "Another Patient" : undefined,
        })
      })
    }

    return slots
  }

  const handleBookSlot = async (slot: TimeSlot) => {
    if (!user || !slot.available) return

    setBooking(slot.id)
    setMessage("")

    try {
      if (isSupabaseConfigured()) {
        // Book appointment in Supabase
        const { error } = await supabase.from("appointments").insert({
          patient_id: user.id,
          provider_name: slot.provider,
          date: slot.date,
          time: slot.time,
          type: slot.type,
          status: "scheduled",
          duration: slot.duration,
        })

        if (error) throw error
      }

      // Update local state
      setTimeSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, available: false, bookedBy: "You" } : s)))

      setMessage(`Appointment booked successfully for ${formatDate(slot.date)} at ${formatTime(slot.time)}!`)

      // Reload appointments
      await loadAppointmentData()
    } catch (error) {
      console.error("Error booking appointment:", error)
      setMessage("Error booking appointment. Please try again.")
    } finally {
      setBooking(null)
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

  const getWeekLabel = (offset: number) => {
    if (offset === 0) return "This Week"
    if (offset === 1) return "Next Week"
    return `${offset} Weeks Ahead`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // Group slots by date
  const slotsByDate = timeSlots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = []
      acc[slot.date].push(slot)
      return acc
    },
    {} as Record<string, TimeSlot[]>,
  )

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Available Appointments</h1>
          <p className="text-slate-600">Select an available time slot to book your appointment</p>
        </div>

        {!isSupabaseConfigured() && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Demo Mode:</strong> This page is showing mock appointment slots for demonstration purposes.
            </AlertDescription>
          </Alert>
        )}

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("Error")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Week Navigation */}
        <div className="flex space-x-2 mb-6">
          {[0, 1, 2, 3].map((week) => (
            <Button
              key={week}
              variant={selectedWeek === week ? "default" : "outline"}
              onClick={() => setSelectedWeek(week)}
              className={selectedWeek === week ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              {getWeekLabel(week)}
            </Button>
          ))}
        </div>

        {/* My Upcoming Appointments */}
        {myAppointments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                My Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled therapy sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center space-x-4">
                      <User className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{appointment.provider_name}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(appointment.date)} at {formatTime(appointment.time)}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {appointment.status === "scheduled" ? "Scheduled" : appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Time Slots */}
        <div className="space-y-6">
          {Object.entries(slotsByDate).map(([date, slots]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {formatDate(date)}
                </CardTitle>
                <CardDescription>
                  {slots.filter((s) => s.available).length} of {slots.length} slots available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        slot.available
                          ? "border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer"
                          : "border-red-200 bg-red-50 cursor-not-allowed opacity-75"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{formatTime(slot.time)}</span>
                        </div>
                        {slot.available ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-1">{slot.provider}</p>
                      <p className="text-sm text-gray-500 mb-3">
                        {slot.type} ({slot.duration} min)
                      </p>

                      {slot.available ? (
                        <Button
                          onClick={() => handleBookSlot(slot)}
                          disabled={booking === slot.id}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                          size="sm"
                        >
                          {booking === slot.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Booking...
                            </>
                          ) : (
                            "Book Appointment"
                          )}
                        </Button>
                      ) : (
                        <div className="text-center">
                          <Badge variant="destructive" className="text-xs">
                            {slot.bookedBy === "You" ? "Booked by You" : "Unavailable"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Questions about booking appointments or need to reschedule?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Booking Information</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Appointments can be booked up to 4 weeks in advance</li>
                  <li>• Each session is 60 minutes long</li>
                  <li>• Please arrive 10 minutes early for your appointment</li>
                  <li>• Cancellations must be made 24 hours in advance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Contact Support</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: appointments@innerclarity.com</p>
                  <p>Hours: Mon-Fri 8AM-6PM EST</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
