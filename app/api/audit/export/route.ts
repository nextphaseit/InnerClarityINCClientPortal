import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock audit logs data
    const auditLogs = [
      {
        timestamp: "2024-01-15T14:30:00Z",
        user: "Dr. Sarah Johnson",
        action: "Viewed client record",
        description: "Accessed John Smith patient file",
        ipAddress: "192.168.1.100",
        status: "success",
      },
      {
        timestamp: "2024-01-15T14:25:00Z",
        user: "Jane Doe",
        action: "Document upload",
        description: "Uploaded insurance verification document",
        ipAddress: "192.168.1.105",
        status: "success",
      },
      {
        timestamp: "2024-01-15T14:20:00Z",
        user: "Admin System",
        action: "Failed login attempt",
        description: "Multiple failed login attempts detected from IP 203.0.113.45",
        ipAddress: "203.0.113.45",
        status: "warning",
      },
      {
        timestamp: "2024-01-15T14:15:00Z",
        user: "Dr. Michael Chen",
        action: "Message sent",
        description: "Sent secure message to patient Robert Wilson",
        ipAddress: "192.168.1.102",
        status: "success",
      },
      {
        timestamp: "2024-01-15T14:10:00Z",
        user: "Robert Wilson",
        action: "Appointment scheduled",
        description: "Scheduled therapy session for Jan 22, 2024",
        ipAddress: "192.168.1.110",
        status: "success",
      },
    ]

    // Convert to CSV format
    const csvHeader = "Timestamp,User,Action,Description,IP Address,Status\n"
    const csvRows = auditLogs
      .map(
        (log) =>
          `"${log.timestamp}","${log.user}","${log.action}","${log.description}","${log.ipAddress}","${log.status}"`,
      )
      .join("\n")

    const csvContent = csvHeader + csvRows

    // Create response with CSV content
    const response = new NextResponse(csvContent)

    // Set headers for file download
    response.headers.set("Content-Type", "text/csv")
    response.headers.set("Content-Disposition", 'attachment; filename="audit-logs.csv"')
    response.headers.set("Cache-Control", "no-cache")

    return response
  } catch (error) {
    console.error("Error exporting audit logs:", error)
    return NextResponse.json({ success: false, error: "Failed to export audit logs" }, { status: 500 })
  }
}
