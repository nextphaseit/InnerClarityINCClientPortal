"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PortalNavigation } from "@/components/portal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Monitor, MapPin, Clock, AlertTriangle, CheckCircle, Smartphone } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface SecurityEvent {
  id: string
  user_id: string
  event_type: "login" | "logout" | "password_change" | "profile_update" | "document_upload" | "form_submission"
  ip_address: string
  user_agent: string
  location?: string
  timestamp: string
  status: "success" | "failed" | "suspicious"
  details?: string
}

export default function SecurityPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Mock security events data
  const mockSecurityEvents: SecurityEvent[] = [
    {
      id: "1",
      user_id: "user-id",
      event_type: "login",
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "New York, NY",
      timestamp: "2024-02-10T09:30:00Z",
      status: "success",
      details: "Successful login via email/password",
    },
    {
      id: "2",
      user_id: "user-id",
      event_type: "profile_update",
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "New York, NY",
      timestamp: "2024-02-10T10:15:00Z",
      status: "success",
      details: "Updated emergency contact information",
    },
    {
      id: "3",
      user_id: "user-id",
      event_type: "document_upload",
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "New York, NY",
      timestamp: "2024-02-09T14:22:00Z",
      status: "success",
      details: "Uploaded insurance card document",
    },
    {
      id: "4",
      user_id: "user-id",
      event_type: "login",
      ip_address: "10.0.0.50",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      location: "New York, NY",
      timestamp: "2024-02-08T18:45:00Z",
      status: "success",
      details: "Mobile login via Safari",
    },
    {
      id: "5",
      user_id: "user-id",
      event_type: "login",
      ip_address: "203.0.113.45",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "Unknown Location",
      timestamp: "2024-02-07T23:15:00Z",
      status: "failed",
      details: "Failed login attempt - incorrect password",
    },
    {
      id: "6",
      user_id: "user-id",
      event_type: "form_submission",
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "New York, NY",
      timestamp: "2024-02-07T16:30:00Z",
      status: "success",
      details: "Submitted HIPAA consent form",
    },
  ]

  useEffect(() => {
    checkAuthAndLoadSecurityEvents()
  }, [])

  const checkAuthAndLoadSecurityEvents = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // In a real app, load from Supabase
      // const { data, error } = await supabase
      //   .from('audit_logs')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .order('timestamp', { ascending: false })
      //   .limit(50)

      setSecurityEvents(mockSecurityEvents)
    } catch (error) {
      console.error("Error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (eventType: SecurityEvent["event_type"]) => {
    switch (eventType) {
      case "login":
      case "logout":
        return <Shield className="h-4 w-4" />
      case "password_change":
        return <AlertTriangle className="h-4 w-4" />
      case "profile_update":
        return <CheckCircle className="h-4 w-4" />
      case "document_upload":
        return <Monitor className="h-4 w-4" />
      case "form_submission":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: SecurityEvent["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "suspicious":
        return <Badge className="bg-yellow-100 text-yellow-800">Suspicious</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getDeviceType = (userAgent: string) => {
    if (userAgent.includes("iPhone") || userAgent.includes("Android")) {
      return { type: "Mobile", icon: <Smartphone className="h-4 w-4" /> }
    }
    return { type: "Desktop", icon: <Monitor className="h-4 w-4" /> }
  }

  const formatEventType = (eventType: SecurityEvent["event_type"]) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getSecuritySummary = () => {
    const last30Days = securityEvents.filter(
      (event) => new Date(event.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    )

    const successfulLogins = last30Days.filter(
      (event) => event.event_type === "login" && event.status === "success",
    ).length

    const failedLogins = last30Days.filter((event) => event.event_type === "login" && event.status === "failed").length

    const uniqueLocations = new Set(last30Days.map((event) => event.location).filter(Boolean)).size

    return { successfulLogins, failedLogins, uniqueLocations, totalEvents: last30Days.length }
  }

  const summary = getSecuritySummary()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PortalNavigation />

      <div className="lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Security & Activity</h1>
            <p className="text-slate-600">Monitor your account security and login activity</p>
          </div>

          {/* Security Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Logins</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{summary.successfulLogins}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{summary.failedLogins}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Locations</CardTitle>
                <MapPin className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{summary.uniqueLocations}</div>
                <p className="text-xs text-muted-foreground">Unique locations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
                <Shield className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">{summary.totalEvents}</div>
                <p className="text-xs text-muted-foreground">All events</p>
              </CardContent>
            </Card>
          </div>

          {/* Security Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium">Login Notifications</h3>
                    <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your account activity and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => {
                  const device = getDeviceType(event.user_agent)

                  return (
                    <div key={event.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0 mt-1">{getEventIcon(event.event_type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900">{formatEventType(event.event_type)}</h3>
                          {getStatusBadge(event.status)}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(event.timestamp)}
                            </div>
                            <div className="flex items-center">
                              {device.icon}
                              <span className="ml-1">{device.type}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location}
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-gray-500">IP: {event.ip_address}</div>

                          {event.details && <div className="text-xs bg-gray-100 p-2 rounded mt-2">{event.details}</div>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
