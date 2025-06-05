"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, Clock, User, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface TelehealthSessionProps {
  appointment: {
    id: string
    date: Date | string
    startTime: string
    endTime: string
    provider: string
    type: string
    meetingLink?: string
    status: "scheduled" | "completed" | "cancelled" | "no-show"
  } | null
}

export function TelehealthSession({ appointment }: TelehealthSessionProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [canJoin, setCanJoin] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!appointment || appointment.type !== "video" || appointment.status !== "scheduled") {
      return
    }

    const calculateTimeRemaining = () => {
      const now = new Date()
      const appointmentDate = new Date(appointment.date)
      const [hours, minutes] = appointment.startTime.split(":").map(Number)

      appointmentDate.setHours(hours, minutes, 0, 0)

      // Time until appointment in milliseconds
      const timeUntil = appointmentDate.getTime() - now.getTime()

      // Can join if within 15 minutes before start time
      const fifteenMinutesInMs = 15 * 60 * 1000
      const canJoinNow = timeUntil <= fifteenMinutesInMs && timeUntil > -3600000 // Allow joining up to 1 hour after start

      setCanJoin(canJoinNow)

      // Only set time remaining if it's in the future
      if (timeUntil > 0) {
        setTimeRemaining(timeUntil)
      } else {
        setTimeRemaining(0)
      }
    }

    // Calculate immediately
    calculateTimeRemaining()

    // Update every minute
    const interval = setInterval(calculateTimeRemaining, 60000)

    return () => clearInterval(interval)
  }, [appointment])

  const handleJoinSession = async () => {
    if (!appointment || !canJoin) return

    setLoading(true)

    try {
      // Log the session join to Supabase
      await supabase.from("appointment_logs").insert({
        appointment_id: appointment.id,
        action: "joined_telehealth",
        timestamp: new Date().toISOString(),
      })

      setHasJoined(true)

      // Open the meeting link in a new tab
      if (appointment.meetingLink) {
        window.open(appointment.meetingLink, "_blank")
      }
    } catch (error) {
      console.error("Error logging telehealth join:", error)
    } finally {
      setLoading(false)
    }
  }

  // Format the remaining time as minutes
  const formatRemainingTime = (ms: number) => {
    const minutes = Math.ceil(ms / 60000)
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`
  }

  if (!appointment) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="mr-2 h-5 w-5 text-blue-600" />
            Telehealth Session
          </CardTitle>
          <CardDescription>No upcoming appointments found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 text-gray-500">
            <Calendar className="mr-2 h-5 w-5" />
            <p>No scheduled telehealth sessions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isVideoAppointment = appointment.type === "video"
  const isPastAppointment = new Date(appointment.date) < new Date() && !canJoin

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5 text-blue-600" />
              Telehealth Session
            </CardTitle>
            <CardDescription>Your upcoming video appointment</CardDescription>
          </div>
          <Badge
            className={`
              ${appointment.status === "scheduled" ? "bg-green-500" : ""}
              ${appointment.status === "completed" ? "bg-blue-500" : ""}
              ${appointment.status === "cancelled" ? "bg-red-500" : ""}
              ${appointment.status === "no-show" ? "bg-amber-500" : ""}
            `}
          >
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-blue-600" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">{formatDate(appointment.date)}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-blue-600" />
              <span className="font-medium">Time:</span>
              <span className="ml-2">
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <User className="mr-2 h-4 w-4 text-blue-600" />
              <span className="font-medium">Provider:</span>
              <span className="ml-2">{appointment.provider}</span>
            </div>
            <div className="flex items-center text-sm">
              <Video className="mr-2 h-4 w-4 text-blue-600" />
              <span className="font-medium">Type:</span>
              <span className="ml-2">
                {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Session
              </span>
            </div>
          </div>
        </div>

        {isVideoAppointment ? (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">Video Session Status</h3>

            {canJoin ? (
              <div className="space-y-3">
                <p className="text-blue-700">Your telehealth session is ready to join!</p>
                <Button onClick={handleJoinSession} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {loading ? "Connecting..." : hasJoined ? "Rejoin Video Session" : "Join Video Session"}
                </Button>
              </div>
            ) : isPastAppointment ? (
              <div className="flex items-center text-amber-700">
                <AlertCircle className="mr-2 h-4 w-4" />
                This session has already passed.
              </div>
            ) : (
              <div className="text-blue-700">
                <p>
                  Your session will be available to join in{" "}
                  <span className="font-semibold">
                    {timeRemaining !== null ? formatRemainingTime(timeRemaining) : "..."}
                  </span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center text-gray-700">
              <AlertCircle className="mr-2 h-4 w-4" />
              No active telehealth session for this appointment.
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        {isVideoAppointment && <p>Please ensure your camera and microphone are working before joining the session.</p>}
      </CardFooter>
    </Card>
  )
}
