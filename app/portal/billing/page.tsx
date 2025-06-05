"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Download, DollarSign, Calendar, FileText, AlertTriangle } from "lucide-react"
import { usePatientAuth } from "@/hooks/use-patient-auth"

interface Invoice {
  id: string
  date: string
  description: string
  amount: number
  status: "Paid" | "Unpaid" | "Pending"
  dueDate?: string
  invoiceNumber: string
}

export default function PortalBillingPage() {
  const { user } = usePatientAuth()
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)
  const [configError, setConfigError] = useState(false)
  const router = useRouter()

  // Mock billing data for demo purposes
  const mockInvoices: Invoice[] = [
    {
      id: "1",
      date: "2024-01-15",
      description: "Individual Therapy Session - Dr. Sarah Johnson",
      amount: 150.0,
      status: "Paid",
      invoiceNumber: "INV-2024-001",
    },
    {
      id: "2",
      date: "2024-01-22",
      description: "Group Therapy Session - Anxiety Management",
      amount: 75.0,
      status: "Paid",
      invoiceNumber: "INV-2024-002",
    },
    {
      id: "3",
      date: "2024-01-29",
      description: "Individual Therapy Session - Dr. Sarah Johnson",
      amount: 150.0,
      status: "Unpaid",
      dueDate: "2024-02-15",
      invoiceNumber: "INV-2024-003",
    },
    {
      id: "4",
      date: "2024-02-05",
      description: "Psychological Assessment - Dr. Michael Chen",
      amount: 300.0,
      status: "Pending",
      dueDate: "2024-02-20",
      invoiceNumber: "INV-2024-004",
    },
    {
      id: "5",
      date: "2024-02-12",
      description: "Family Therapy Session - Dr. Emily Rodriguez",
      amount: 200.0,
      status: "Unpaid",
      dueDate: "2024-02-28",
      invoiceNumber: "INV-2024-005",
    },
  ]

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          router.push("/portal/auth/signin")
          return
        }

        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          setConfigError(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/portal/auth/signin")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [user, router])

  const handlePayNow = async (invoiceId: string, amount: number) => {
    setPaymentLoading(invoiceId)

    // Mock payment processing
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log(`Processing payment for invoice ${invoiceId}: $${amount}`)
      alert(`Payment of $${amount.toFixed(2)} processed successfully!`)
    } catch (error) {
      console.error("Payment failed:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setPaymentLoading(null)
    }
  }

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
      case "Unpaid":
        return <Badge variant="destructive">Unpaid</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateTotals = () => {
    const totalAmount = mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const paidAmount = mockInvoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const unpaidAmount = mockInvoices
      .filter((invoice) => invoice.status === "Unpaid")
      .reduce((sum, invoice) => sum + invoice.amount, 0)

    return { totalAmount, paidAmount, unpaidAmount }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const { totalAmount, paidAmount, unpaidAmount } = calculateTotals()

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Configuration Error Alert */}
        {configError && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Demo Mode:</strong> Supabase is not configured. This page is showing mock data for demonstration
              purposes. To enable full functionality, please configure your Supabase environment variables.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Billing & Payments</h1>
          <p className="mt-2 text-slate-600">Manage your invoices and payment history</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time billing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${unpaidAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Requires payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Invoice History
            </CardTitle>
            <CardDescription>View and manage your therapy session invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice #</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4 font-mono text-sm">{invoice.invoiceNumber}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{formatDate(invoice.date)}</td>
                        <td className="py-4 px-4 text-sm">{invoice.description}</td>
                        <td className="py-4 px-4 text-sm font-semibold">${invoice.amount.toFixed(2)}</td>
                        <td className="py-4 px-4">{getStatusBadge(invoice.status)}</td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            {invoice.status === "Unpaid" && (
                              <Button
                                size="sm"
                                onClick={() => handlePayNow(invoice.id, invoice.amount)}
                                disabled={paymentLoading === invoice.id}
                                className="bg-teal-600 hover:bg-teal-700"
                              >
                                {paymentLoading === invoice.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                ) : (
                                  <CreditCard className="h-4 w-4 mr-1" />
                                )}
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {mockInvoices.map((invoice) => (
                <Card key={invoice.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono text-sm text-gray-600">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>

                    <p className="text-sm mb-3">{invoice.description}</p>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">${invoice.amount.toFixed(2)}</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === "Unpaid" && (
                          <Button
                            size="sm"
                            onClick={() => handlePayNow(invoice.id, invoice.amount)}
                            disabled={paymentLoading === invoice.id}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            {paymentLoading === invoice.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {invoice.dueDate && invoice.status !== "Paid" && (
                      <p className="text-xs text-gray-500 mt-2">Due: {formatDate(invoice.dueDate)}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Questions about billing or need assistance with payments?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Accepted Payment Methods</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Credit Cards (Visa, MasterCard, American Express)</li>
                  <li>• Debit Cards</li>
                  <li>• HSA/FSA Cards</li>
                  <li>• Bank Transfer (ACH)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Billing Support</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Phone: (555) 123-4567</p>
                  <p>Email: billing@innerclarity.com</p>
                  <p>Hours: Mon-Fri 9AM-5PM EST</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
