"use client"

import { useState } from "react"
import {
  Bell,
  Search,
  Calendar,
  MessageCircle,
  FileText,
  CreditCard,
  Upload,
  Heart,
  AlertTriangle,
  Clock,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface NotificationCardProps {
  notification: PatientNotification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}

function NotificationCard({ notification, onMarkAsRead, onDismiss }: NotificationCardProps) {
  const Icon = notificationIcons[notification.type]

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }

  const content = (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer",
        notification.isRead ? "bg-white border-gray-200" : priorityColors[notification.priority],
        !notification.isRead && "shadow-sm",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              notification.isRead ? "bg-gray-100" : "bg-white/80",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className={cn("text-sm font-medium", notification.isRead ? "text-gray-700" : "text-gray-900")}>
                    {notification.title}
                  </h3>
                  {notification.priority === "urgent" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                </div>
                <p className={cn("text-sm mt-1", notification.isRead ? "text-gray-500" : "text-gray-700")}>
                  {notification.message}
                </p>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkAsRead()
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Mark read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDismiss(notification.id)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(notification.createdAt)}</span>
              </div>

              <Badge variant="outline" className="text-xs">
                {notification.type}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, dismissNotification } =
    usePatientNotifications()

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || notification.type === filterType
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority

    return matchesSearch && matchesType && matchesPriority
  })

  const unreadNotifications = filteredNotifications.filter((n) => !n.isRead)
  const readNotifications = filteredNotifications.filter((n) => n.isRead)
  const urgentNotifications = filteredNotifications.filter((n) => n.priority === "urgent")

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-lg text-gray-600 mt-4">Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated with important information</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} className="bg-blue-600 hover:bg-blue-700">
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Urgent notifications banner */}
      {urgentNotifications.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Urgent Notifications</h3>
                <p className="text-sm text-red-700">
                  You have {urgentNotifications.length} urgent notification{urgentNotifications.length > 1 ? "s" : ""}{" "}
                  that need immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="form">Forms</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({filteredNotifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
          <TabsTrigger value="read">Read ({readNotifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm || filterType !== "all" || filterPriority !== "all"
                    ? "Try adjusting your filters"
                    : "You'll see important updates here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDismiss={dismissNotification}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No unread notifications</p>
                <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            unreadNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDismiss={dismissNotification}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          {readNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No read notifications</p>
              </CardContent>
            </Card>
          ) : (
            readNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDismiss={dismissNotification}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
