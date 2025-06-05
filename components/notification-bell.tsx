"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bell,
  X,
  Clock,
  AlertTriangle,
  MessageCircle,
  Calendar,
  FileText,
  CreditCard,
  Upload,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { usePatientNotifications, type PatientNotification } from "@/hooks/use-patient-notifications"
import { cn } from "@/lib/utils"
import Link from "next/link"

const notificationIcons = {
  appointment: Calendar,
  message: MessageCircle,
  form: FileText,
  document: Upload,
  billing: CreditCard,
  reminder: Heart,
}

const priorityColors = {
  urgent: "text-red-600 bg-red-50 border-red-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  medium: "text-blue-600 bg-blue-50 border-blue-200",
  low: "text-gray-600 bg-gray-50 border-gray-200",
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString()
}

interface NotificationItemProps {
  notification: PatientNotification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onClose: () => void
}

function NotificationItem({ notification, onMarkAsRead, onDismiss, onClose }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type]

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
    onClose()
  }

  const content = (
    <div
      className={cn(
        "flex items-start space-x-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer",
        notification.isRead ? "bg-white border-gray-200" : priorityColors[notification.priority],
        !notification.isRead && "shadow-sm",
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          notification.isRead ? "bg-gray-100" : "bg-white/80",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn("text-sm font-medium truncate", notification.isRead ? "text-gray-700" : "text-gray-900")}>
              {notification.title}
            </p>
            <p className={cn("text-sm mt-1 line-clamp-2", notification.isRead ? "text-gray-500" : "text-gray-700")}>
              {notification.message}
            </p>
          </div>

          <div className="flex items-center space-x-2 ml-2">
            {notification.priority === "urgent" && <AlertTriangle className="h-4 w-4 text-red-500" />}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-100"
              onClick={(e) => {
                e.stopPropagation()
                onDismiss(notification.id)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(notification.createdAt)}</span>
          </div>

          {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
        </div>
      </div>
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    )
  }

  return content
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, dismissNotification } =
    usePatientNotifications()

  // Animate bell when new notifications arrive
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const urgentNotifications = notifications.filter((n) => n.priority === "urgent" && !n.isRead)
  const recentNotifications = notifications.slice(0, 10) // Show last 10 notifications

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className={cn("relative p-2 hover:bg-slate-700/50 transition-all duration-200", isAnimating && "animate-pulse")}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell
          className={cn("h-5 w-5 text-slate-300", unreadCount > 0 && "text-white", isAnimating && "animate-bounce")}
        />

        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className={cn(
              "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold",
              urgentNotifications.length > 0 && "animate-pulse bg-red-600",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Urgent notifications banner */}
          {urgentNotifications.length > 0 && (
            <div className="bg-red-50 border-b border-red-200 p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {urgentNotifications.length} urgent notification{urgentNotifications.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {/* Notifications list */}
          <ScrollArea className="flex-1 max-h-96">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">You'll see important updates here</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {recentNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDismiss={dismissNotification}
                      onClose={() => setIsOpen(false)}
                    />
                    {index < recentNotifications.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="border-t border-gray-200 p-3">
              <Link
                href="/portal/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
