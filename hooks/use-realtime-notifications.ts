"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/toast-provider"
import { useAuth } from "@/components/auth-provider"

interface RealtimeNotificationOptions {
  enabled?: boolean
  playSound?: boolean
}

export function useRealtimeNotifications(options: RealtimeNotificationOptions = {}) {
  const { enabled = true, playSound = true } = options
  const { user } = useAuth()
  const { addToast } = useToast()
  const channelsRef = useRef<any[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize notification sound
  useEffect(() => {
    if (playSound && typeof window !== "undefined") {
      audioRef.current = new Audio("/notification-sound.mp3")
      audioRef.current.volume = 0.3
    }
  }, [playSound])

  const playNotificationSound = () => {
    if (playSound && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.log("Could not play notification sound:", error)
      })
    }
  }

  useEffect(() => {
    // Only subscribe if user is admin and realtime is enabled
    if (!enabled || !user || user.role !== "admin") {
      return
    }

    console.log("🔔 Setting up realtime notifications for admin:", user.email)

    // Subscribe to appointments table
    const appointmentsChannel = supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
        },
        async (payload) => {
          console.log("📅 New appointment request:", payload)

          try {
            // Fetch patient details
            const { data: patientData } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", payload.new.patient_id)
              .single()

            const patientName = patientData?.full_name || "Unknown Patient"

            addToast({
              type: "info",
              title: "New Appointment Request",
              message: `${patientName} has requested an appointment`,
              duration: 7000,
            })

            playNotificationSound()
          } catch (error) {
            console.error("Error processing appointment notification:", error)
          }
        },
      )
      .subscribe()

    // Subscribe to form_responses table
    const formsChannel = supabase
      .channel("forms-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "form_responses",
        },
        async (payload) => {
          console.log("📝 New form submission:", payload)

          try {
            // Fetch patient details
            const { data: patientData } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", payload.new.client_id)
              .single()

            const patientName = patientData?.full_name || "Unknown Patient"
            const formType = payload.new.form_type || "Unknown Form"

            addToast({
              type: "success",
              title: "New Form Submission",
              message: `${patientName} submitted a ${formType}`,
              duration: 7000,
            })

            playNotificationSound()
          } catch (error) {
            console.error("Error processing form notification:", error)
          }
        },
      )
      .subscribe()

    // Subscribe to documents table
    const documentsChannel = supabase
      .channel("documents-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "documents",
        },
        async (payload) => {
          console.log("📄 New document upload:", payload)

          try {
            // Fetch patient details
            const { data: patientData } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", payload.new.client_id)
              .single()

            const patientName = patientData?.full_name || "Unknown Patient"
            const fileName = payload.new.original_name || "Unknown File"

            addToast({
              type: "warning",
              title: "New Document Upload",
              message: `${patientName} uploaded ${fileName}`,
              duration: 7000,
            })

            playNotificationSound()
          } catch (error) {
            console.error("Error processing document notification:", error)
          }
        },
      )
      .subscribe()

    // Store channel references for cleanup
    channelsRef.current = [appointmentsChannel, formsChannel, documentsChannel]

    // Cleanup function
    return () => {
      console.log("🔕 Cleaning up realtime subscriptions")
      channelsRef.current.forEach((channel) => {
        if (channel) {
          supabase.removeChannel(channel)
        }
      })
      channelsRef.current = []
    }
  }, [enabled, user, addToast, playSound])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      channelsRef.current.forEach((channel) => {
        if (channel) {
          supabase.removeChannel(channel)
        }
      })
    }
  }, [])
}
