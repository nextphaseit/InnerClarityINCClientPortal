"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

export function usePendingNotifications() {
  const [pendingCount, setPendingCount] = useState(0)
  const { user } = useAuth()

  const loadPendingCount = async () => {
    if (!user || user.role !== "admin") return

    try {
      // Count pending appointments
      const { count: appointmentCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")

      // Count unreviewed forms
      const { count: formCount } = await supabase
        .from("form_responses")
        .select("*", { count: "exact", head: true })
        .eq("status", "submitted")

      // Count unreviewed documents
      const { count: documentCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("status", "uploaded")

      const total = (appointmentCount || 0) + (formCount || 0) + (documentCount || 0)
      setPendingCount(total)
    } catch (error) {
      console.error("Error loading pending notifications:", error)
    }
  }

  useEffect(() => {
    loadPendingCount()
  }, [user])

  // Set up realtime subscription to update count
  useEffect(() => {
    if (!user || user.role !== "admin") return

    const channel = supabase
      .channel("pending-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => loadPendingCount(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "form_responses",
        },
        () => loadPendingCount(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "documents",
        },
        () => loadPendingCount(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return { pendingCount, refreshCount: loadPendingCount }
}
