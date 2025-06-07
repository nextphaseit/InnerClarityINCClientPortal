"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import {
  CreditCard,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
  Settings,
  Calendar,
  TrendingUp,
  ExternalLink,
} from "lucide-react"

interface Payment {
  id: string
  amount: number
  currency: string
  status: "pending" | "paid" | "failed" | "canceled" | "refunded"
  description: string
  payment_method?: string
  stripe_payment_intent: string
  created_at: string
  updated_at: string
}

interface BillingSummary {
  totalPaid: number
  totalPending: number
  lastPaymentDate?: string
  paymentCount: number
  averagePayment: number
}

export default function BillingPage() {
  const { user, loading: authLoading } = usePatientAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [billingSummary, setBillingSummary] = useState<BillingSummary>({
    totalPaid: 0,
    totalPending: 0,
    paymentCount: 0,
    averagePayment: 0,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/portal/auth/signin")
      return
    }

    loadBillingData()
  }, [user, authLoading, router])

  const loadBillingData = async () => {
    if (!user?.id) return

    setLoading(true)
    setError("")

    try {
      if (isSupabaseConfigured()) {
        console.log("Loading billing data for patient:", user.id)

        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("patient_id", user.id)
          .order("created_at", { ascending: false })

        if (paymentsError) {
          console.error("Error fetching payments:", paymentsError)
          throw new Error(`Failed to load payment history: ${paymentsError.message}`)
        }

        console.log("Loaded payments:", paymentsData)
        setPayments(paymentsData || [])

        const summary = calculateBillingSummary(paymentsData || [])
        setBillingSummary(summary)
      } else {
        console.log("Supabase not configured")
        setError("Payment system is not configured. Please contact support.")
      }
    } catch (error) {
      console.error("Error loading billing data:", error)
      setError(error instanceof Error ? error.message : "Failed to load billing information")
    } finally {
      setLoading(false)
    }
  }

  const calculateBillingSummary = (payments: Payment[]): BillingSummary => {
    const paidPayments = payments.filter((p) => p.status === "paid")
    const pendingPayments = payments.filter((p) => p.status === "pending")

    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

    const lastPaymentDate = paidPayments.length > 0 ? paidPayments[0].created_at : undefined

    return {
      totalPaid,
      totalPending,
      lastPaymentDate,
      paymentCount: payments.length,
      averagePayment: payments.length > 0 ? totalPaid / paidPayments.length || 0 : 0,
    }
  }

  const handlePayNow = async (amount = 10000, description = "Medical Services Payment") => {
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
          amount: amount / 100,
          description,
          patientId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment session")
      }

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

  const handleOpenCustomerPortal = async () => {
    if (!user?.id) return

    setPortalLoading(true)
    setError("")

    try {
      console.log("🎫 Opening customer portal...")

      const response = await fetch("/api/create-customer-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create customer portal session")
      }

      if (data.url) {
        console.log("✅ Redirecting to customer portal:", data.url)
        window.location.href = data.url
      } else {
        throw new Error("No portal URL received")
      }
    } catch (error) {
      console.error("Error opening customer portal:", error)
      setError("Failed to open customer portal. Please try again.")
    } finally {
      setPortalLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Canceled
          </Badge>
        )
      case "refunded":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <TrendingUp className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amountInCents: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100)
  }

  const shortenPaymentIntent = (paymentIntent: string) => {
    return `${paymentIntent.slice(0, 8)}...${paymentIntent.slice(-4)}`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Billing & Payments</h1>
          <p className="mt-2 text-slate-600">Manage your payments and view billing history</p>
        </div>

        {/* Billing Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(billingSummary.totalPaid)}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(billingSummary.totalPending)}</div>
              <p className="text-xs text-muted-foreground">Pending payments</p>
              {billingSummary.totalPending > 0 && (
                <Button
                  size="sm"
                  className="mt-2 w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => handlePayNow(billingSummary.totalPending)}
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
              <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {billingSummary.lastPaymentDate ? formatDate(billingSummary.lastPaymentDate).split(",")[0] : "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                {billingSummary.lastPaymentDate ? "Most recent payment" : "No payments yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(billingSummary.averagePayment)}</div>
              <p className="text-xs text-muted-foreground">{billingSummary.paymentCount} total payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>Make a payment or manage your billing preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => handlePayNow()}
                disabled={paymentLoading}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {paymentLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Make a Payment
              </Button>

              <Button variant="outline" onClick={handleOpenCustomerPortal} disabled={portalLoading}>
                {portalLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Manage Payment Methods
              </Button>

              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Statements
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Payment History
            </CardTitle>
            <CardDescription>View your complete payment transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500 mb-6">You haven't made any payments yet.</p>
                <Button onClick={() => handlePayNow()} className="bg-teal-600 hover:bg-teal-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Make Your First Payment
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Payment ID</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm text-gray-600">{formatDate(payment.created_at)}</td>
                            <td className="py-4 px-4 text-sm">{payment.description}</td>
                            <td className="py-4 px-4 text-sm font-semibold">
                              {formatCurrency(payment.amount, payment.currency)}
                            </td>
                            <td className="py-4 px-4">{getStatusBadge(payment.status)}</td>
                            <td className="py-4 px-4 text-sm font-mono text-gray-500">
                              {shortenPaymentIntent(payment.stripe_payment_intent)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600 capitalize">
                              {payment.payment_method || "Card"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm text-gray-500">{formatDate(payment.created_at)}</p>
                            <p className="font-medium">{payment.description}</p>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-semibold">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">{payment.payment_method || "Card"}</span>
                        </div>

                        <div className="text-xs text-gray-400 font-mono">
                          ID: {shortenPaymentIntent(payment.stripe_payment_intent)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

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
                <Button variant="outline" size="sm" className="mt-3">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
