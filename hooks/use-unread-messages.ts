"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface UseUnreadMessagesProps {
  user: User | null
  userRole: "patient" | "admin"
}

export function useUnreadMessages({ user, userRole }: UseUnreadMessagesProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    // Initial fetch of unread messages
    fetchUnreadCount()

    // Set up real-time subscription
    const channel = supabase
      .channel(`unread-messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: userRole === "patient" ? `patient_id=eq.${user.id},sender_role=eq.staff` : `sender_role=eq.patient`,
        },
        (payload) => {
          console.log("New message received:", payload)
          // Increment unread count for new messages
          if (payload.new && !payload.new.is_read) {
            setUnreadCount((prev) => prev + 1)
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: userRole === "patient" ? `patient_id=eq.${user.id},sender_role=eq.staff` : `sender_role=eq.patient`,
        },
        (payload) => {
          console.log("Message updated:", payload)
          // Handle read status changes
          if (payload.old && payload.new) {
            const wasUnread = !payload.old.is_read
            const isNowRead = payload.new.is_read

            if (wasUnread && isNowRead) {
              setUnreadCount((prev) => Math.max(0, prev - 1))
            } else if (!wasUnread && !isNowRead) {
              setUnreadCount((prev) => prev + 1)
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, userRole])

  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      let query = supabase.from("messages").select("id", { count: "exact" }).eq("is_read", false)

      if (userRole === "patient") {
        query = query.eq("patient_id", user.id).eq("sender_role", "staff")
      } else {
        query = query.eq("sender_role", "patient")
      }

      const { count, error } = await query

      if (error) {
        console.error("Error fetching unread messages:", error)
        return
      }

      setUnreadCount(count || 0)
    } catch (error) {
      console.error("Error fetching unread messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase.from("messages").update({ is_read: true }).eq("id", messageId)

      if (error) {
        console.error("Error marking message as read:", error)
      }
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      let query = supabase.from("messages").update({ is_read: true }).eq("is_read", false)

      if (userRole === "patient") {
        query = query.eq("patient_id", user.id).eq("sender_role", "staff")
      } else {
        query = query.eq("sender_role", "patient")
      }

      const { error } = await query

      if (error) {
        console.error("Error marking all messages as read:", error)
      } else {
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking all messages as read:", error)
    }
  }

  return {
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshCount: fetchUnreadCount,
  }
}
