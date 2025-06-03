"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { Calendar, User, MapPin, Video, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BookAppointmentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedProvider, setSelectedProvider] = useState("")
  const [appointmentType, setAppointmentType] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
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

  // Mock data
  const providers = [
    { id: "1", name: "Dr. Sarah Johnson", specialty: "Clinical Psychologist" },
    { id: "2", name: "Dr. Michael Chen", specialty: "Psychiatrist" },
    { id: "3", name: "Dr. Emily Rodriguez", specialty: "Licensed Therapist" },
  ]

  const appointmentTypes = [
    { id: "therapy", name: "Therapy Session", duration: "50 minutes" },
    { id: "consultation", name: "Initial Consultation", duration: "60 minutes" },
    { id: "followup", name: "Follow-up", duration: "30 minutes" },
    { id: "assessment", name: "Assessment", duration: "90 minutes" },
  ]

  const availableTimes = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle appointment booking
    console.log("Booking appointment:", {
      date: selectedDate,
      time: selectedTime,
      provider: selectedProvider,
      type: appointmentType,
      location,
      notes,
    })
    // Redirect to appointments page
    router.push("/appointments")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Appointments
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book Appointment</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Schedule a new appointment with your healthcare provider.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Select Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your healthcare provider" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-gray-500">{provider.specialty}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Appointment Type */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-gray-500">{type.duration}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">Preferred Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Location Preference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose location type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">
                    <div className="flex items-center">
                      <Video className="mr-2 h-4 w-4" />
                      Virtual (Video Call)
                    </div>
                  </SelectItem>
                  <SelectItem value="office">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      In-Person (Office Visit)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific concerns or topics you'd like to discuss..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/appointments">Cancel</Link>
            </Button>
            <Button type="submit">Book Appointment</Button>
          </div>
        </form>
      </main>
    </div>
  )
}
