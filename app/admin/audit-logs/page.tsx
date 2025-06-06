"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuthProtection } from "@/components/auth-protection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Shield, Search, Download, Eye, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AuditLog {
  id: string
  user_id: string
  user_name: string
  action: string
  resource: string
  resource_id?: string
  details?: any
  ip_address: string
  user_agent: string
  created_at: string
  severity: "low" | "medium" | "high" | "critical"
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    loadAuditLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [auditLogs, searchTerm, actionFilter, severityFilter])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)

      // Mock data for demo
      const mockLogs: AuditLog[] = [
        {
          id: "AL-001",
          user_id: "admin-1",
          user_name: "Adrian Knight",
          action: "user_signin",
          resource: "auth",
          ip_address: "192.168.1.100",
          user_agent: "Mozilla/5.0...",
          created_at: "2024-02-15T10:30:00Z",
          severity: "low",
        },
        {
          id: "AL-002",
          user_id: "admin-1",
          user_name: "Adrian Knight",
          action: "update",
          resource: "patient",
          resource_id: "patient-123",
          details: { changes: { status: "active" }, patient_name: "John Smith" },
          ip_address: "192.168.1.100",
          user_agent: "Mozilla/5.0...",
          created_at: "2024-02-15T11:15:00Z",
          severity: "medium",
        },
        {
          id: "AL-003",
          user_id: "admin-2",
          user_name: "Demo Admin",
          action: "delete",
          resource: "document",
          resource_id: "doc-456",
          details: { document_name: "sensitive_file.pdf" },
          ip_address: "192.168.1.101",
          user_agent: "Mozilla/5.0...",
          created_at: "2024-02-15T14:45:00Z",
          severity: "high",
        },
        {
          id: "AL-004",
          user_id: "admin-1",
          user_name: "Adrian Knight",
          action: "failed_login",
          resource: "auth",
          details: { reason: "invalid_password", attempts: 3 },
          ip_address: "192.168.1.200",
          user_agent: "Mozilla/5.0...",
          created_at: "2024-02-15T16:20:00Z",
          severity: "critical",
        },
      ]

      setAuditLogs(mockLogs)
    } catch (error) {
      console.error("Error loading audit logs:", error)
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = auditLogs

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ip_address.includes(searchTerm),
      )
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter((log) => log.severity === severityFilter)
    }

    setFilteredLogs(filtered)
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      user_signin: "bg-blue-100 text-blue-800 border-blue-200",
      user_signout: "bg-gray-100 text-gray-800 border-gray-200",
      create: "bg-green-100 text-green-800 border-green-200",
      update: "bg-yellow-100 text-yellow-800 border-yellow-200",
      delete: "bg-red-100 text-red-800 border-red-200",
      failed_login: "bg-red-100 text-red-800 border-red-200",
    }

    return (
      <Badge className={actionColors[action] || "bg-gray-100 text-gray-800 border-gray-200"}>
        {action.replace(/_/g, " ").toUpperCase()}
      </Badge>
    )
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

  const exportLogs = () => {
    toast({
      title: "Export Started",
      description: "Audit logs export will be available shortly",
    })
  }

  if (loading) {
    return (
      <AuthProtection requiredRole="super_admin">
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </AdminLayout>
      </AuthProtection>
    )
  }

  return (
    <AuthProtection requiredRole="super_admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Shield className="h-8 w-8 mr-3 text-red-600" />
                Audit Logs
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Security audit trail and system activity monitoring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Restricted Access</h3>
                <p className="text-sm text-red-700 mt-1">
                  This page contains sensitive security information. Access is logged and monitored.
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by user, action, resource, or IP address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Actions</option>
                  <option value="user_signin">Sign In</option>
                  <option value="user_signout">Sign Out</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="failed_login">Failed Login</option>
                </select>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Audit Trail ({filteredLogs.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{formatDateTime(log.created_at)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.user_name}</p>
                          <p className="text-sm text-gray-600 font-mono">{log.user_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.resource}</p>
                          {log.resource_id && <p className="text-sm text-gray-600 font-mono">{log.resource_id}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ip_address}</TableCell>
                      <TableCell>{getSeverityBadge(log.severity)}</TableCell>
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
    </AuthProtection>
  )
}
