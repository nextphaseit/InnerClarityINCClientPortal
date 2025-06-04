"use client"

// Mark as dynamic to prevent static rendering issues
export const dynamic = "force-dynamic"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { Shield, Search, Download, Filter, AlertTriangle, CheckCircle, Eye } from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils"

export default function AdminAuditPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/auth/signin")
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-clarity-blue-500"></div>
      </div>
    )
  }

  // Mock audit logs data
  const auditLogs = [
    {
      id: "1",
      timestamp: "2024-01-15T14:30:00Z",
      user: "Dr. Sarah Johnson",
      action: "Viewed client record",
      resource: "John Smith - Patient File",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0.0.0",
      status: "success",
      details: "Accessed patient medical history",
    },
    {
      id: "2",
      timestamp: "2024-01-15T14:25:00Z",
      user: "Jane Doe",
      action: "Document upload",
      resource: "Insurance Card",
      ipAddress: "192.168.1.105",
      userAgent: "Safari 17.0",
      status: "success",
      details: "Uploaded insurance verification document",
    },
    {
      id: "3",
      timestamp: "2024-01-15T14:20:00Z",
      user: "Admin System",
      action: "Failed login attempt",
      resource: "Authentication System",
      ipAddress: "203.0.113.45",
      userAgent: "Unknown",
      status: "warning",
      details: "Multiple failed login attempts detected",
    },
    {
      id: "4",
      timestamp: "2024-01-15T14:15:00Z",
      user: "Dr. Michael Chen",
      action: "Message sent",
      resource: "Patient Communication",
      ipAddress: "192.168.1.102",
      userAgent: "Firefox 121.0",
      status: "success",
      details: "Sent secure message to patient",
    },
    {
      id: "5",
      timestamp: "2024-01-15T14:10:00Z",
      user: "Robert Wilson",
      action: "Appointment scheduled",
      resource: "Scheduling System",
      ipAddress: "192.168.1.110",
      userAgent: "Chrome 120.0.0.0",
      status: "success",
      details: "Scheduled therapy session for Jan 22",
    },
  ]

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === "all" || log.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const stats = {
    totalLogs: auditLogs.length,
    successfulActions: auditLogs.filter((log) => log.status === "success").length,
    warnings: auditLogs.filter((log) => log.status === "warning").length,
    errors: auditLogs.filter((log) => log.status === "error").length,
  }

  const handleExportLogs = async () => {
    setIsExporting(true)

    try {
      const response = await fetch("/api/audit/export")

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "audit-logs.csv"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        console.log("Audit logs exported successfully")
      } else {
        console.error("Failed to export audit logs")
      }
    } catch (error) {
      console.error("Error exporting audit logs:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Monitor system access and maintain HIPAA compliance.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportLogs}
            disabled={isExporting}
            aria-label="Export audit logs as CSV file"
            className="bg-clarity-blue-600 hover:bg-clarity-blue-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Logs"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-clarity-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLogs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successfulActions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.warnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Errors</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.errors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs by user, action, or resource..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail ({filteredLogs.length} entries)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getStatusColor(log.status)}>
                        {getStatusIcon(log.status)}
                        <span className="ml-1">{log.status}</span>
                      </Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>User:</strong> {log.user}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>Resource:</strong> {log.resource}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>IP Address:</strong> {log.ipAddress}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>Time:</strong> {formatDate(log.timestamp)} at {formatTime(log.timestamp)}
                        </p>
                      </div>
                    </div>

                    {log.details && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <strong>Details:</strong> {log.details}
                      </p>
                    )}
                  </div>

                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HIPAA Compliance Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">HIPAA Audit Compliance</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All system access is logged and retained for compliance purposes. Audit logs are encrypted and
                  tamper-proof to meet HIPAA requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
