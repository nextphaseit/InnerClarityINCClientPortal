"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Video, Users, Clock, Monitor, Settings, Play, PhoneCall } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TelehealthSession {
  id: string
  patient_name: string
  provider_name: string
  scheduled_time: string
  duration: number
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  meeting_link: string
  session_type: "video" | "audio"
}

export default function AdminTelehealthPage() {
  const [sessions, setSessions] = useState<TelehealthSession[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    scheduledToday: 0,
    completedToday: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadTelehealthData()
  }, [])

  const loadTelehealthData = async () => {
    try {
      setLoading(true)

      // Mock data for demo
      const mockSessions: TelehealthSession[] = [
        {
          id: "TH-001",
          patient_name: "John Smith",
          provider_name: "Dr. Sarah Johnson",
          scheduled_time: "2024-02-15T10:00:00Z",
          duration: 60,
          status: "scheduled",
          meeting_link: "https://meet.example.com/session-001",
          session_type: "video",
        },
        {
          id: "TH-002",
          patient_name: "Jane Doe",
          provider_name: "Dr. Michael Chen",
          scheduled_time: "2024-02-15T14:30:00Z",
          duration: 45,
          status: "in-progress",
          meeting_link: "https://meet.example.com/session-002",
          session_type: "video",
        },
        {
          id: "TH-003",
          patient_name: "Robert Wilson",
          provider_name: "Dr. Emily Davis",
          scheduled_time: "2024-02-15T16:00:00Z",
          duration: 30,
          status: "completed",
          meeting_link: "https://meet.example.com/session-003",
          session_type: "audio",
        },
      ]

      setSessions(mockSessions)

      // Calculate stats
      const today = new Date().toISOString().split("T")[0]
      const scheduledToday = mockSessions.filter(
        (s) => s.scheduled_time.startsWith(today) && s.status === "scheduled",
      ).length

      const completedToday = mockSessions.filter(
        (s) => s.scheduled_time.startsWith(today) && s.status === "completed",
      ).length

      setStats({
        totalSessions: mockSessions.length,
        activeSessions: mockSessions.filter((s) => s.status === "in-progress").length,
        scheduledToday,
        completedToday,
      })
    } catch (error) {
      console.error("Error loading telehealth data:", error)
      toast({
        title: "Error",
        description: "Failed to load telehealth data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>
      case "in-progress":
        return <Badge className="bg-green-100 text-green-800 border-green-200">In Progress</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleJoinSession = (sessionId: string, meetingLink: string) => {
    window.open(meetingLink, "_blank")
    toast({
      title: "Joining Session",
      description: "Opening telehealth session in new window",
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Telehealth Sessions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage virtual appointments and video sessions</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Video className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Monitor className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalSessions}</p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Play className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.activeSessions}</p>
                  <p className="text-sm text-gray-600">Active Now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.scheduledToday}</p>
                  <p className="text-sm text-gray-600">Scheduled Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.completedToday}</p>
                  <p className="text-sm text-gray-600">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Telehealth Sessions ({sessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.id}</TableCell>
                    <TableCell>{session.patient_name}</TableCell>
                    <TableCell>{session.provider_name}</TableCell>
                    <TableCell>{formatDateTime(session.scheduled_time)}</TableCell>
                    <TableCell>{session.duration} min</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {session.session_type === "video" ? (
                          <Video className="h-4 w-4 text-blue-600" />
                        ) : (
                          <PhoneCall className="h-4 w-4 text-green-600" />
                        )}
                        <span className="capitalize">{session.session_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {session.status === "scheduled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoinSession(session.id, session.meeting_link)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Join
                          </Button>
                        )}
                        {session.status === "in-progress" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoinSession(session.id, session.meeting_link)}
                          >
                            <Monitor className="h-3 w-3 mr-1" />
                            Monitor
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
