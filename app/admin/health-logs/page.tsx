"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Activity, Heart, Thermometer, Weight, TrendingUp } from "lucide-react"
import { AuthProtection } from "@/components/auth-protection"

interface HealthLog {
  id: string
  patientName: string
  metricType: "blood_pressure" | "heart_rate" | "temperature" | "weight" | "glucose"
  value: string
  unit: string
  recordedAt: string
  status: "normal" | "high" | "low" | "critical"
  notes?: string
}

export default function AdminHealthLogsPage() {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockHealthLogs: HealthLog[] = [
      {
        id: "HL-001",
        patientName: "John Doe",
        metricType: "blood_pressure",
        value: "120/80",
        unit: "mmHg",
        recordedAt: "2024-01-15T08:00:00Z",
        status: "normal",
      },
      {
        id: "HL-002",
        patientName: "Jane Smith",
        metricType: "heart_rate",
        value: "95",
        unit: "bpm",
        recordedAt: "2024-01-15T09:30:00Z",
        status: "high",
        notes: "Patient reported feeling anxious",
      },
      {
        id: "HL-003",
        patientName: "Bob Johnson",
        metricType: "temperature",
        value: "98.6",
        unit: "°F",
        recordedAt: "2024-01-15T10:15:00Z",
        status: "normal",
      },
      {
        id: "HL-004",
        patientName: "Alice Brown",
        metricType: "glucose",
        value: "180",
        unit: "mg/dL",
        recordedAt: "2024-01-15T11:00:00Z",
        status: "high",
        notes: "Post-meal reading",
      },
    ]

    setTimeout(() => {
      setHealthLogs(mockHealthLogs)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredLogs = healthLogs.filter(
    (log) =>
      log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.metricType.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const criticalLogs = healthLogs.filter((log) => log.status === "critical")
  const abnormalLogs = healthLogs.filter((log) => log.status === "high" || log.status === "low")
  const todayLogs = healthLogs.filter((log) => {
    const logDate = new Date(log.recordedAt).toDateString()
    const today = new Date().toDateString()
    return logDate === today
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return <Badge className="bg-green-100 text-green-800">Normal</Badge>
      case "high":
        return <Badge className="bg-yellow-100 text-yellow-800">High</Badge>
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case "blood_pressure":
        return <Activity className="h-4 w-4" />
      case "heart_rate":
        return <Heart className="h-4 w-4" />
      case "temperature":
        return <Thermometer className="h-4 w-4" />
      case "weight":
        return <Weight className="h-4 w-4" />
      case "glucose":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatMetricType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
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
          <h1 className="text-3xl font-bold">Health Logs</h1>
          <p className="text-gray-600">Monitor patient health metrics and vital signs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayLogs.length}</div>
              <p className="text-xs text-muted-foreground">Recorded today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalLogs.length}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abnormal Readings</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{abnormalLogs.length}</div>
              <p className="text-xs text-muted-foreground">Outside normal range</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(healthLogs.map((log) => log.patientName)).size}</div>
              <p className="text-xs text-muted-foreground">Being monitored</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search health logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export Data</Button>
            <Button>Add Manual Entry</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Health Logs</CardTitle>
            <CardDescription>Patient vital signs and health metrics monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recorded</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.patientName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMetricIcon(log.metricType)}
                        {formatMetricType(log.metricType)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">
                        {log.value} {log.unit}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{new Date(log.recordedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {log.notes ? (
                        <span className="text-sm text-gray-600">{log.notes}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Flag
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
