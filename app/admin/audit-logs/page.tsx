"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Shield, AlertTriangle, Eye, Activity } from "lucide-react"
import { AuthProtection } from "@/components/auth-protection"

interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: "low" | "medium" | "high" | "critical"
}

export default function AdminAuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockAuditLogs: AuditLog[] = [
      {
        id: "AUDIT-001",
        userId: "user-123",
        userEmail: "admin@innerclarityinc.com",
        action: "LOGIN",
        resource: "admin_portal",
        details: "Successful admin login",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: "2024-01-15T09:00:00Z",
        severity: "low",
      },
      {
        id: "AUDIT-002",
        userId: "user-456",
        userEmail: "john.doe@email.com",
        action: "VIEW_PATIENT_RECORD",
        resource: "patient_data",
        details: "Accessed patient medical records",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        timestamp: "2024-01-15T10:30:00Z",
        severity: "medium",
      },
      {
        id: "AUDIT-003",
        userId: "user-789",
        userEmail: "admin@innerclarityinc.com",
        action: "DELETE_USER",
        resource: "user_management",
        details: "Deleted user account: jane.smith@email.com",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timestamp: "2024-01-15T11:15:00Z",
        severity: "high",
      },
      {
        id: "AUDIT-004",
        userId: "unknown",
        userEmail: "unknown",
        action: "FAILED_LOGIN",
        resource: "authentication",
        details: "Multiple failed login attempts detected",
        ipAddress: "203.0.113.1",
        userAgent: "curl/7.68.0",
        timestamp: "2024-01-15T12:00:00Z",
        severity: "critical",
      },
    ]

    setTimeout(() => {
      setAuditLogs(mockAuditLogs)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const todayLogs = auditLogs.filter((log) => {
    const logDate = new Date(log.timestamp).toDateString()
    const today = new Date().toDateString()
    return logDate === today
  })

  const criticalLogs = auditLogs.filter((log) => log.severity === "critical")
  const highSeverityLogs = auditLogs.filter((log) => log.severity === "high")
  const uniqueUsers = new Set(auditLogs.map((log) => log.userEmail)).size

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
      default:
        return <Badge>{severity}</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN") || action.includes("LOGOUT")) {
      return <Shield className="h-4 w-4" />
    }
    if (action.includes("VIEW") || action.includes("ACCESS")) {
      return <Eye className="h-4 w-4" />
    }
    if (action.includes("FAILED") || action.includes("ERROR")) {
      return <AlertTriangle className="h-4 w-4" />
    }
    return <Activity className="h-4 w-4" />
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-gray-600">Security monitoring and compliance tracking</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayLogs.length}</div>
              <p className="text-xs text-muted-foreground">Logged today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalLogs.length}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Severity</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{highSeverityLogs.length}</div>
              <p className="text-xs text-muted-foreground">Security events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">Unique users tracked</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Filter by Severity</Button>
            <Button variant="outline">Filter by Date</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Security Audit Trail</CardTitle>
            <CardDescription>Comprehensive logging of all system activities and security events</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.userEmail}</span>
                        <span className="text-xs text-gray-500">{log.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-mono text-sm">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.resource}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                    <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
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
