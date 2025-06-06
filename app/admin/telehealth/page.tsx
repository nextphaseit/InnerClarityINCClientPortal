"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Video, Calendar, Clock, Users } from "lucide-react"
import { AuthProtection } from "@/components/auth-protection"

interface TelehealthSession {
  id: string
  patientName: string
  scheduledTime: string
  duration: number
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  sessionType: "consultation" | "follow-up" | "therapy"
  meetingLink?: string
}

export default function AdminTelehealthPage() {
  const [sessions, setSessions] = useState<TelehealthSession[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockSessions: TelehealthSession[] = [
      {
        id: "TH-001",
        patientName: "John Doe",
        scheduledTime: "2024-01-15T10:00:00Z",
        duration: 30,
        status: "scheduled",
        sessionType: "consultation",
        meetingLink: "https://meet.example.com/session-1",
      },
      {
        id: "TH-002",
        patientName: "Jane Smith",
        scheduledTime: "2024-01-15T14:00:00Z",
        duration: 45,
        status: "in-progress",
        sessionType: "therapy",
        meetingLink: "https://meet.example.com/session-2",
      },
      {
        id: "TH-003",
        patientName: "Bob Johnson",
        scheduledTime: "2024-01-14T16:00:00Z",
        duration: 30,
        status: "completed",
        sessionType: "follow-up",
      },
    ]

    setTimeout(() => {
      setSessions(mockSessions)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredSessions = sessions.filter(
    (session) =>
      session.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const todaySessions = sessions.filter((session) => {
    const sessionDate = new Date(session.scheduledTime).toDateString()
    const today = new Date().toDateString()
    return sessionDate === today
  })

  const activeSessions = sessions.filter((session) => session.status === "in-progress")
  const upcomingSessions = sessions.filter((session) => session.status === "scheduled")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "in-progress":
        return <Badge className="bg-green-100 text-green-800">In Progress</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getSessionTypeBadge = (type: string) => {
    switch (type) {
      case "consultation":
        return <Badge variant="outline">Consultation</Badge>
      case "follow-up":
        return <Badge variant="outline">Follow-up</Badge>
      case "therapy":
        return <Badge variant="outline">Therapy</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AuthProtection requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Telehealth Sessions</h1>
          <p className="text-gray-600">Manage virtual appointments and video consultations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySessions.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Video className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeSessions.length}</div>
              <p className="text-xs text-muted-foreground">Sessions in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingSessions.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(sessions.map((s) => s.patientName)).size}</div>
              <p className="text-xs text-muted-foreground">Unique patients served</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
            <Button>
              <Video className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Telehealth Sessions</CardTitle>
            <CardDescription>Manage virtual appointments and video consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Scheduled Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.id}</TableCell>
                    <TableCell>{session.patientName}</TableCell>
                    <TableCell>{new Date(session.scheduledTime).toLocaleString()}</TableCell>
                    <TableCell>{session.duration} min</TableCell>
                    <TableCell>{getSessionTypeBadge(session.sessionType)}</TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {session.status === "scheduled" && (
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                        )}
                        {session.status === "in-progress" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Video className="h-4 w-4 mr-1" />
                            Active
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Edit
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
    </AuthProtection>
  )
}
