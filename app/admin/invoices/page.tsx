"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Receipt, DollarSign, TrendingUp, Users, Search, Plus, Download, Eye, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Invoice {
  id: string
  invoice_number: string
  patient_name: string
  patient_email: string
  amount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  due_date: string
  created_at: string
  services: string[]
  payment_method?: string
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    overdueCount: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadInvoicesData()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const loadInvoicesData = async () => {
    try {
      setLoading(true)

      // Mock data for demo
      const mockInvoices: Invoice[] = [
        {
          id: "INV-001",
          invoice_number: "INV-2024-001",
          patient_name: "John Smith",
          patient_email: "john.smith@email.com",
          amount: 15000, // $150.00 in cents
          status: "paid",
          due_date: "2024-01-15",
          created_at: "2024-01-01",
          services: ["Individual Therapy Session", "Assessment"],
          payment_method: "Credit Card",
        },
        {
          id: "INV-002",
          invoice_number: "INV-2024-002",
          patient_name: "Jane Doe",
          patient_email: "jane.doe@email.com",
          amount: 7500, // $75.00 in cents
          status: "sent",
          due_date: "2024-02-15",
          created_at: "2024-01-15",
          services: ["Group Therapy Session"],
        },
        {
          id: "INV-003",
          invoice_number: "INV-2024-003",
          patient_name: "Robert Wilson",
          patient_email: "robert.wilson@email.com",
          amount: 30000, // $300.00 in cents
          status: "overdue",
          due_date: "2024-01-30",
          created_at: "2024-01-10",
          services: ["Psychological Assessment", "Report"],
        },
        {
          id: "INV-004",
          invoice_number: "INV-2024-004",
          patient_name: "Mary Johnson",
          patient_email: "mary.johnson@email.com",
          amount: 12000, // $120.00 in cents
          status: "draft",
          due_date: "2024-02-20",
          created_at: "2024-02-01",
          services: ["Couples Therapy Session"],
        },
      ]

      setInvoices(mockInvoices)

      // Calculate stats
      const totalRevenue = mockInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)

      const pendingAmount = mockInvoices
        .filter((inv) => ["sent", "overdue"].includes(inv.status))
        .reduce((sum, inv) => sum + inv.amount, 0)

      const overdueCount = mockInvoices.filter((inv) => inv.status === "overdue").length

      setStats({
        totalInvoices: mockInvoices.length,
        totalRevenue,
        pendingAmount,
        overdueCount,
      })
    } catch (error) {
      console.error("Error loading invoices data:", error)
      toast({
        title: "Error",
        description: "Failed to load invoices data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.patient_email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Sent</Badge>
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage patient invoices</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Receipt className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalInvoices}</p>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <TrendingUp className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
                  <p className="text-sm text-gray-600">Pending Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices by patient name, email, or invoice number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Invoices ({filteredInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.patient_name}</p>
                        <p className="text-sm text-gray-600">{invoice.patient_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">{invoice.services.join(", ")}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {invoice.status === "draft" && (
                          <Button variant="outline" size="sm">
                            <Send className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                        )}
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
