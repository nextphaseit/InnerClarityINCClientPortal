"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, DollarSign, FileText, Send, AlertCircle } from "lucide-react"
import { AuthProtection } from "@/components/auth-protection"

interface Invoice {
  id: string
  patientName: string
  amount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  dueDate: string
  createdAt: string
  description: string
  paymentMethod?: string
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockInvoices: Invoice[] = [
      {
        id: "INV-2024-001",
        patientName: "John Doe",
        amount: 150.0,
        status: "paid",
        dueDate: "2024-01-15",
        createdAt: "2024-01-01",
        description: "Regular consultation and checkup",
        paymentMethod: "Credit Card",
      },
      {
        id: "INV-2024-002",
        patientName: "Jane Smith",
        amount: 200.0,
        status: "sent",
        dueDate: "2024-01-20",
        createdAt: "2024-01-05",
        description: "Therapy session and follow-up",
      },
      {
        id: "INV-2024-003",
        patientName: "Bob Johnson",
        amount: 175.0,
        status: "overdue",
        dueDate: "2024-01-10",
        createdAt: "2023-12-28",
        description: "Specialized consultation",
      },
      {
        id: "INV-2024-004",
        patientName: "Alice Brown",
        amount: 125.0,
        status: "draft",
        dueDate: "2024-01-25",
        createdAt: "2024-01-15",
        description: "Initial assessment",
      },
    ]

    setTimeout(() => {
      setInvoices(mockInvoices)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalRevenue = invoices.filter((inv) => inv.status === "paid").reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingAmount = invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const overdueAmount = invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const draftCount = invoices.filter((inv) => inv.status === "draft").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-600">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-gray-600">Create, manage, and track patient invoices</p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From paid invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
              <Send className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${pendingAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${overdueAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Requires follow-up</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftCount}</div>
              <p className="text-xs text-muted-foreground">Ready to send</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">Send Reminders</Button>
          </div>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>Manage and track all patient invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.patientName}</TableCell>
                    <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
                    <TableCell className="font-mono">${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          new Date(invoice.dueDate) < new Date() && invoice.status !== "paid"
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {invoice.status === "draft" && (
                          <Button size="sm">
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        )}
                        {invoice.status === "overdue" && (
                          <Button variant="outline" size="sm" className="text-red-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Follow Up
                          </Button>
                        )}
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
