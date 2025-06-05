"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { usePatientAuth } from "@/components/patient-auth-provider"

export interface PatientNotification {
  id: string
  type: "appointment" | "message" | "form" | "document" | "billing" | "reminder"
  title: string
  message: string
  priority: "low" | "medium" | "high" | "urgent"
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  metadata?: Record<string, any>
}

export function usePatientNotifications() {
  const [notifications, setNotifications] = useState<PatientNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isDemo } = usePatientAuth()

  // Mock notifications for demo mode
  const mockNotifications: PatientNotification[] = [
    {
      id: "notif-001",
      type: "appointment",
      title: "Upcoming Appointment Reminder",
      message: "You have an appointment with Dr. Smith tomorrow at 2:00 PM",
      priority: "high",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      actionUrl: "/portal/appointments",
      metadata: { appointmentId: "apt-001" },
    },
    {
      id: "notif-002",
      type: "message",
      title: "New Message from Dr. Johnson",
      message: "Your test results are ready for review",
      priority: "medium",
      isRead: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      actionUrl: "/portal/messages",
      metadata: { messageId: "msg-002" },
    },
    {
      id: "notif-003",
      type: "form",
      title: "Health Assessment Due",
      message: "Please complete your weekly health assessment",
      priority: "medium",
      isRead: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      actionUrl: "/portal/forms",
      metadata: { formId: "form-001" },
    },
    {
      id: "notif-004",
      type: "billing",
      title: "Payment Reminder",
      message: "Your payment of $150 is due in 3 days",
      priority: "high",
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      actionUrl: "/portal/billing",
      metadata: { invoiceId: "inv-001" },
    },
    {
      id: "notif-005",
      type: "document",
      title: "Insurance Card Required",
      message: "Please upload your updated insurance card",
      priority: "medium",
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      actionUrl: "/portal/documents",
      metadata: { documentType: "insurance" },
    },
    {
      id: "notif-006",
      type: "reminder",
      title: "Medication Reminder",
      message: "Don't forget to take your evening medication",
      priority: "low",
      isRead: true,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      actionUrl: "/portal/health-log",
      metadata: { medicationId: "med-001" },
    },
  ]

  const loadNotifications = async () => {
    if (isDemo) {
      // Use mock data in demo mode
      setNotifications(mockNotifications)
      const unread = mockNotifications.filter((n) => !n.isRead).length
      setUnreadCount(unread)
      setIsLoading(false)
      return
    }

    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    try {
      // In a real implementation, you would fetch from Supabase
      // For now, we'll use mock data but structure it for real implementation
      const realNotifications: PatientNotification[] = []

      // Check for upcoming appointments
      const { data: appointments } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", user.id)
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .lte("scheduled_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())

      appointments?.forEach((apt) => {
        realNotifications.push({
          id: `apt-${apt.id}`,
          type: "appointment",
          title: "Upcoming Appointment",
          message: `You have an appointment scheduled for ${new Date(apt.scheduled_at).toLocaleDateString()}`,
          priority: "high",
          isRead: false,
          createdAt: new Date(apt.created_at),
          actionUrl: "/portal/appointments",
          metadata: { appointmentId: apt.id },
        })
      })

      // Check for unread messages
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", user.id)
        .eq("sender_role", "staff")
        .eq("is_read", false)

      messages?.forEach((msg) => {
        realNotifications.push({
          id: `msg-${msg.id}`,
          type: "message",
          title: "New Message",
          message: msg.subject || "You have a new message",
          priority: "medium",
          isRead: false,
          createdAt: new Date(msg.created_at),
          actionUrl: "/portal/messages",
          metadata: { messageId: msg.id },
        })
      })

      // Check for pending forms
      const { data: forms } = await supabase
        .from("form_responses")
        .select("*")
        .eq("patient_id", user.id)
        .eq("status", "draft")

      forms?.forEach((form) => {
        realNotifications.push({
          id: `form-${form.id}`,
          type: "form",
          title: "Incomplete Form",
          message: `Please complete your ${form.form_type} form`,
          priority: "medium",
          isRead: false,
          createdAt: new Date(form.created_at),
          actionUrl: "/portal/forms",
          metadata: { formId: form.id },
        })
      })

      // Check for overdue invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("*")
        .eq("patient_id", user.id)
        .eq("status", "pending")
        .lt("due_date", new Date().toISOString())

      invoices?.forEach((invoice) => {
        realNotifications.push({
          id: `inv-${invoice.id}`,
          type: "billing",
          title: "Overdue Payment",
          message: `Payment of $${invoice.amount} is overdue`,
          priority: "urgent",
          isRead: false,
          createdAt: new Date(invoice.created_at),
          actionUrl: "/portal/billing",
          metadata: { invoiceId: invoice.id },
        })
      })

      // Sort by priority and date
      const sortedNotifications = realNotifications.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setNotifications(sortedNotifications)
      const unread = sortedNotifications.filter((n) => !n.isRead).length
      setUnreadCount(unread)
    } catch (error) {
      console.error("Error loading notifications:", error)
      // Fallback to mock data on error
      setNotifications(mockNotifications)
      const unread = mockNotifications.filter((n) => !n.isRead).length
      setUnreadCount(unread)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))

    if (!isDemo && user) {
      // In real implementation, update the database
      try {
        // Update notification read status in database
        console.log(`Marking notification ${notificationId} as read`)
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)

    if (!isDemo && user) {
      try {
        // Update all notifications as read in database
        console.log("Marking all notifications as read")
      } catch (error) {
        console.error("Error marking all notifications as read:", error)
      }
    }
  }

  const dismissNotification = async (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))

    const notification = notifications.find((n) => n.id === notificationId)
    if (notification && !notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    if (!isDemo && user) {
      try {
        // Remove notification from database
        console.log(`Dismissing notification ${notificationId}`)
      } catch (error) {
        console.error("Error dismissing notification:", error)
      }
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user, isDemo])

  // Set up real-time subscription for new notifications
  useEffect(() => {
    if (isDemo || !user) return

    const channel = supabase
      .channel(`patient-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
          filter: `patient_id=eq.${user.id}`,
        },
        () => loadNotifications(),
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `patient_id=eq.${user.id}`,
        },
        () => loadNotifications(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "invoices",
          filter: `patient_id=eq.${user.id}`,
        },
        () => loadNotifications(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, isDemo])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refreshNotifications: loadNotifications,
  }
}
