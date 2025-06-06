"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Heart, TrendingUp, Users, Filter, Download, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HealthLog {
  id: string
  patient_name: string
  patient_email: string
  metric_type: string
  value: string
  unit: string
  recorded_at: string
  notes?: string
  status: "normal" | "attention" | "critical"
}

export default function AdminHealthLogsPage() {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLogs: 0,
    activePatients: 0,
    criticalAlerts: 0,
    todayLogs: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadHealthLogsData()
  }, [])

  const loadHealthLogsData = async () => {
    try {
      setLoading(true)

      // Mock data for demo
      const mockLogs: HealthLog[] = [
        {
          id: "HL-001",
          patient_name: "John Smith",
          patient_email: "john.smith@email.com",
          metric_type: "Blood Pressure",
          value: "120/80",
          unit: "mmHg",
          recorded_at: "2024-02-15T10:30:00Z",
          notes: "Normal reading, patient feeling well",
          status: "normal",
        },
        {
          id: "HL-002",
          patient_name: "Jane Doe",
          patient_email: "jane.doe@email.com",
          metric_type: "Heart Rate",
          value: "95",
          unit: "bpm",
          recorded_at: "2024-02-15T14:15:00Z",
          notes: "Slightly elevated, monitor closely",
          status: "attention",
        },
        {
          id: "HL-003",
          patient_name: "Robert Wilson",
          patient_email: "robert.wilson@email.com",
          metric_type: "Weight",
          value: "175",
          unit: "lbs",
          recorded_at: "2024-02-15T09:00:00Z",
          status: "normal",
        },
        {
          id: "HL-004",
          patient_name: "Mary Johnson",
          patient_email: "mary.johnson@email.com",
          metric_type: "Blood Sugar",
          value: "180",
          unit: "mg/dL",
          recorded_at: "2024-02-15T16:45:00Z",
          notes: "High reading, contact patient immediately",
          status: "critical",
        },
      ]

      setHealthLogs(mockLogs)

      // Calculate stats
      const today = new Date().toISOString().split("T")[0]
      const todayLogs = mockLogs.filter((log) => log.recorded_at.startsWith(today)).length

      setStats({
        totalLogs: mockLogs.length,
        activePatients: new Set(mockLogs.map((log) => log.patient_email)).size,
        criticalAlerts: mockLogs.filter((log) => log.status === "critical").length,
        todayLogs,
      })
    } catch (error) {
      console.error("Error loading health logs data:", error)
      toast({
        title: "Error",
        description: "Failed to load health logs data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "normal":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Normal</Badge>
      case "attention":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Attention</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
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

  const getMetricIcon = (metricType: string) => {
    switch (metricType.toLowerCase()) {
      case "blood pressure":
      case "heart rate":
        return <Heart className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Logs</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor patient health metrics and vitals</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalLogs}</p>
                  <p className="text-sm text-gray-600">Total Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.activePatients}</p>
                  <p className="text-sm text-gray-600">Active Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.todayLogs}</p>
                  <p className="text-sm text-gray-600">Today's Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Health Logs ({healthLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Recorded</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {healthLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.patient_name}</p>
                        <p className="text-sm text-gray-600">{log.patient_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getMetricIcon(log.metric_type)}
                        <span>{log.metric_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{log.value}</span>
                      <span className="text-sm text-gray-600 ml-1">{log.unit}</span>
                    </TableCell>
                    <TableCell>{formatDateTime(log.recorded_at)}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{log.notes || "—"}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
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
