"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, DollarSign, TrendingUp, Users, Download, Eye, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Invoice {
  id: string
  patient_name: string
  patient_email: string
  amount: number
  status: "paid" | "pending" | "overdue" | "cancelled"
  due_date: string
  created_at: string
  services: string
}

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    totalInvoices: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)

      // Mock data for demo
      const mockInvoices: Invoice[] = [
        {
          id: "INV-001",
          patient_name: "John Smith",
          patient_email: "john.smith@email.com",
          amount: 15000, // $150.00 in cents
          status: "paid",
          due_date: "2024-01-15",
          created_at: "2024-01-01",
          services: "Individual Therapy Session",
        },
        {
          id: "INV-002",
          patient_name: "Jane Doe",
          patient_email: "jane.doe@email.com",
          amount: 7500, // $75.00 in cents
          status: "pending",
          due_date: "2024-02-15",
          created_at: "2024-01-15",
          services: "Group Therapy Session",
        },
        {
          id: "INV-003",
          patient_name: "Robert Wilson",
          patient_email: "robert.wilson@email.com",
          amount: 30000, // $300.00 in cents
          status: "overdue",
          due_date: "2024-01-30",
          created_at: "2024-01-10",
          services: "Psychological Assessment",
        },
      ]

      setInvoices(mockInvoices)

      // Calculate stats
      const totalRevenue = mockInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)

      const pendingAmount = mockInvoices
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + inv.amount, 0)

      const overdueAmount = mockInvoices
        .filter((inv) => inv.status === "overdue")
        .reduce((sum, inv) => sum + inv.amount, 0)

      setStats({
        totalRevenue,
        pendingAmount,
        overdueAmount,
        totalInvoices: mockInvoices.length,
      })
    } catch (error) {
      console.error("Error loading billing data:", error)
      toast({
        title: "Error",
        description: "Failed to load billing data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amountInCents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amountInCents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Invoices</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage patient billing and payment tracking</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalInvoices}</p>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Recent Invoices ({invoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.patient_name}</p>
                        <p className="text-sm text-gray-600">{invoice.patient_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.services}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
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
