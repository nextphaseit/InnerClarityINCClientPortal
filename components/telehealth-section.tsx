"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Video, Clock } from "lucide-react"
import { format, differenceInMinutes } from "date-fns"

interface TelehealthAppointment {
  id: string
  startDateTime?: Date
  provider: string
  type: string
  meetingLink?: string
}

interface TelehealthSectionProps {
  upcomingAppointment?: TelehealthAppointment
  patientId?: string
}

export function TelehealthSection({ upcomingAppointment, patientId }: TelehealthSectionProps) {
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0)
  const [canJoin, setCanJoin] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!upcomingAppointment?.startDateTime) return

    const calculateTime = () => {
      const now = new Date()
      const appointmentTime = new Date(upcomingAppointment.startDateTime!)

      // Calculate minutes until start
      const minutesUntil = differenceInMinutes(appointmentTime, now)

      // Can join if within 15 minutes of start time
      const canJoinNow = minutesUntil <= 15 && minutesUntil > -30 // Can join up to 30 minutes after start

      setTimeUntilStart(minutesUntil)
      setCanJoin(canJoinNow)
    }

    // Initial calculation
    calculateTime()

    // Update every 30 seconds
    const interval = setInterval(calculateTime, 30000)
    return () => clearInterval(interval)
  }, [upcomingAppointment])

  const handleJoinMeeting = async () => {
    if (!upcomingAppointment?.meetingLink || !patientId) return

    setLoading(true)
    setError("")

    try {
      // Log the join event to Supabase
      if (patientId) {
        // In a production app, this would use a server-side function
        await supabase
          .from("telehealth_sessions")
          .insert({
            patient_id: patientId,
            appointment_id: upcomingAppointment.id,
            joined_at: new Date().toISOString(),
            status: "joined",
          })
          .single()
      }

      // Open the meeting in a new tab
      window.open(upcomingAppointment.meetingLink, "_blank")
    } catch (err) {
      console.error("Error logging telehealth join:", err)
      setError("Could not log session join. The meeting will still open.")
      // Still open the meeting even if logging fails
      window.open(upcomingAppointment?.meetingLink, "_blank")
    } finally {
      setLoading(false)
    }
  }

  // If no upcoming video appointment
  if (!upcomingAppointment) {
    return null // Don't render anything if no telehealth appointment
  }

  return (
    <Card className="mb-8 border-blue-100 bg-blue-50/60 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-blue-800">
          <Video className="h-5 w-5 mr-2" />
          Upcoming Telehealth Session
        </CardTitle>
        <CardDescription className="text-blue-600">
          Video appointment with {upcomingAppointment.provider}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Date & Time</div>
              <div className="font-medium">
                {upcomingAppointment.startDateTime &&
                  format(new Date(upcomingAppointment.startDateTime), "EEEE, MMMM d, yyyy • h:mm a")}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500">Appointment Type</div>
              <div className="font-medium">{upcomingAppointment.type}</div>
            </div>
          </div>

          {/* Status and Join Button */}
          <div className="p-4 rounded-lg bg-white border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {canJoin ? (
                <div className="flex items-center text-green-600">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse mr-2"></div>
                  <span className="font-medium">Ready to join</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {timeUntilStart > 0 ? (
                    <span>
                      You can join in {timeUntilStart} minute{timeUntilStart !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span>Session has started - you can still join</span>
                  )}
                </div>
              )}

              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <Button
              onClick={handleJoinMeeting}
              disabled={!canJoin || loading || !upcomingAppointment.meetingLink}
              className="bg-blue-600 hover:bg-blue-700 min-w-32"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Opening...
                </>
              ) : (
                <>Join Video Session</>
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            For the best experience, please ensure your camera and microphone are working before joining. Having
            technical issues?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Get help
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
