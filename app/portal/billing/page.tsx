"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import {
  CreditCard,
  Download,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Receipt,
  Settings,
} from "lucide-react"

interface Invoice {
  id: string
  invoice_number?: string
  date: string
  description: string
  amount: number
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled"
  due_date?: string
  paid_date?: string
  created_at?: string
}

interface Payment {
  id: string
  amount: number
  status: string
  description: string
  created_at: string
  stripe_payment_intent_id?: string
}

interface AutopaySettings {
  id: string
  is_active: boolean
  billing_cycle: string
  next_payment_date?: string
  stripe_customer_id?: string
}

export default function BillingPage() {
  const { user } = usePatientAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [autopayLoading, setAutopayLoading] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [autopaySettings, setAutopaySettings] = useState<AutopaySettings | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Check for success/cancel parameters
  useEffect(() => {
    const successParam = searchParams.get("success")
    const canceledParam = searchParams.get("canceled")
    const autopayParam = searchParams.get("autopay")

    if (successParam === "true") {
      setSuccess("Payment completed successfully!")
      // Remove the parameter from URL
      router.replace("/portal/billing")
    } else if (canceledParam === "true") {
      setError("Payment was canceled. Please try again if needed.")
      router.replace("/portal/billing")
    } else if (autopayParam === "setup") {
      setSuccess("Autopay setup completed!")
      router.replace("/portal/billing")
    }
  }, [searchParams, router])

  useEffect(() => {
    if (!user) {
      router.push("/portal/auth/signin")
      return
    }
    loadBillingData()
  }, [user, router])

  const loadBillingData = async () => {
    setLoading(true)
    setError("")

    try {
      if (isSupabaseConfigured() && user?.id) {
        // Load real data from Supabase with fallback column names
        console.log("Loading billing data for user:", user.id)

        // Try to load invoices with both patient_id and client_id for compatibility
        const invoicesQuery = supabase
          .from("invoices")
          .select("*")
          .or(`patient_id.eq.${user.id},client_id.eq.${user.id}`)
          .order("created_at", { ascending: false })

        const paymentsQuery = supabase
          .from("payments")
          .select("*")
          .eq("patient_id", user.id)
          .order("created_at", { ascending: false })

        const autopayQuery = supabase.from("autopay_settings").select("*").eq("patient_id", user.id).single()

        const [invoicesResult, paymentsResult, autopayResult] = await Promise.all([
          invoicesQuery,
          paymentsQuery,
          autopayQuery,
        ])

        console.log("Invoices result:", invoicesResult)
        console.log("Payments result:", paymentsResult)
        console.log("Autopay result:", autopayResult)

        if (invoicesResult.error && invoicesResult.error.code !== "PGRST116") {
          console.error("Invoices error:", invoicesResult.error)
          throw new Error(`Failed to load invoices: ${invoicesResult.error.message}`)
        }

        if (paymentsResult.error && paymentsResult.error.code !== "PGRST116") {
          console.error("Payments error:", paymentsResult.error)
          // Don't throw error for payments, just log it
          console.warn("Payments table might not exist, using empty array")
        }

        // Process invoices data
        const invoicesData = (invoicesResult.data || []).map((invoice: any) => ({
          ...invoice,
          date: invoice.created_at || invoice.date,
          invoice_number: invoice.invoice_number || `INV-${invoice.id.slice(0, 8)}`,
        }))

        setInvoices(invoicesData)
        setPayments(paymentsResult.data || [])
        setAutopaySettings(autopayResult.data)
      } else {
        console.log("Loading mock data (Supabase not configured or no user)")
        loadMockData()
      }
    } catch (error) {
      console.error("Error loading billing data:", error)
      setError(`Unable to load billing information: ${error instanceof Error ? error.message : "Unknown error"}`)
      // Fallback to mock data
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    console.log("Loading mock billing data")
    const mockInvoices: Invoice[] = [
      {
        id: "1",
        invoice_number: "INV-2024-001",
        date: "2024-01-15",
        description: "Individual Therapy Session - Dr. Sarah Johnson",
        amount: 150.0,
        status: "paid",
        paid_date: "2024-01-20",
      },
      {
        id: "2",
        invoice_number: "INV-2024-002",
        date: "2024-01-29",
        description: "Group Therapy Session - Anxiety Management",
        amount: 75.0,
        status: "pending",
        due_date: "2024-02-15",
      },
      {
        id: "3",
        invoice_number: "INV-2024-003",
        date: "2024-02-05",
        description: "Psychological Assessment - Dr. Michael Chen",
        amount: 300.0,
        status: "overdue",
        due_date: "2024-02-20",
      },
    ]

    const mockPayments: Payment[] = [
      {
        id: "1",
        amount: 150.0,
        status: "succeeded",
        description: "Payment for INV-2024-001",
        created_at: "2024-01-20T10:30:00Z",
      },
    ]

    setInvoices(mockInvoices)
    setPayments(mockPayments)
    setAutopaySettings({
      id: "1",
      is_active: false,
      billing_cycle: "monthly",
    })
  }

  const handlePayNow = async (invoice: Invoice) => {
    if (!user?.id) return

    setPaymentLoading(true)
    setError("")

    try {
      const response = await fetch("/api/create-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: invoice.amount,
          description: invoice.description,
          invoiceId: invoice.invoice_number || invoice.id,
          patientId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error) {
      console.error("Error creating payment session:", error)
      setError("Failed to initiate payment. Please try again.")
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleSetupAutopay = async () => {
    if (!user?.id) return

    setAutopayLoading(true)
    setError("")

    try {
      const response = await fetch("/api/setup-autopay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: user.id,
          billingCycle: "monthly",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to setup autopay")
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No portal URL received")
      }
    } catch (error) {
      console.error("Error setting up autopay:", error)
      setError("Failed to setup autopay. Please try again.")
    } finally {
      setAutopayLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const calculateTotals = () => {
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const paidAmount = invoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const unpaidAmount = invoices
      .filter((invoice) => invoice.status === "pending" || invoice.status === "overdue")
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
        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Demo Mode Alert */}
        {!isSupabaseConfigured() && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Demo Mode:</strong> This page is showing mock data. Stripe integration requires proper environment
              configuration.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Billing & Payments</h1>
          <p className="mt-2 text-slate-600">Manage your invoices, payments, and autopay settings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              <p className="text-xs text-muted-foreground">All time billing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(unpaidAmount)}</div>
              <p className="text-xs text-muted-foreground">Requires payment</p>
              {unpaidAmount > 0 && (
                <Button
                  size="sm"
                  className="mt-2 w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    const firstUnpaidInvoice = invoices.find(
                      (inv) => inv.status === "pending" || inv.status === "overdue",
                    )
                    if (firstUnpaidInvoice) {
                      handlePayNow(firstUnpaidInvoice)
                    }
                  }}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Pay Now
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Autopay Status</CardTitle>
              <Zap className={`h-4 w-4 ${autopaySettings?.is_active ? "text-green-600" : "text-gray-400"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{autopaySettings?.is_active ? "Active" : "Inactive"}</div>
              <p className="text-xs text-muted-foreground">
                {autopaySettings?.is_active ? "Automatic payments enabled" : "Manual payments only"}
              </p>
              <Button
                size="sm"
                variant={autopaySettings?.is_active ? "outline" : "default"}
                className="mt-2 w-full"
                onClick={handleSetupAutopay}
                disabled={autopayLoading}
              >
                {autopayLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                {autopaySettings?.is_active ? "Manage Autopay" : "Setup Autopay"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Invoices
                </CardTitle>
                <CardDescription>View and pay your medical service invoices</CardDescription>
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
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4 font-mono text-sm">{invoice.invoice_number}</td>
                            <td className="py-4 px-4 text-sm text-gray-600">{formatDate(invoice.date)}</td>
                            <td className="py-4 px-4 text-sm">{invoice.description}</td>
                            <td className="py-4 px-4 text-sm font-semibold">{formatCurrency(invoice.amount)}</td>
                            <td className="py-4 px-4">{getStatusBadge(invoice.status)}</td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                                {(invoice.status === "pending" || invoice.status === "overdue") && (
                                  <Button
                                    size="sm"
                                    onClick={() => handlePayNow(invoice)}
                                    disabled={paymentLoading}
                                    className="bg-teal-600 hover:bg-teal-700"
                                  >
                                    {paymentLoading ? (
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
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-mono text-sm text-gray-600">{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-500">{formatDate(invoice.date)}</p>
                          </div>
                          {getStatusBadge(invoice.status)}
                        </div>

                        <p className="text-sm mb-3">{invoice.description}</p>

                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">{formatCurrency(invoice.amount)}</span>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {(invoice.status === "pending" || invoice.status === "overdue") && (
                              <Button
                                size="sm"
                                onClick={() => handlePayNow(invoice)}
                                disabled={paymentLoading}
                                className="bg-teal-600 hover:bg-teal-700"
                              >
                                {paymentLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <CreditCard className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {invoice.due_date && invoice.status !== "paid" && (
                          <p className="text-xs text-gray-500 mt-2">Due: {formatDate(invoice.due_date)}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {invoices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No invoices found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Payment History
                </CardTitle>
                <CardDescription>View your payment transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            payment.status === "succeeded" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {payment.status === "succeeded" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(payment.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500 capitalize">{payment.status}</p>
                      </div>
                    </div>
                  ))}

                  {payments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No payments found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Secure payments powered by Stripe</CardDescription>
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
                  <li>• Apple Pay & Google Pay</li>
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
