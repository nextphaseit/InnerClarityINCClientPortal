"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { CreditCard, Download, DollarSign, Calendar, AlertCircle, CheckCircle, Shield } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function BillingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
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

  // Mock billing data
  const currentBalance = 150.0
  const nextPaymentDue = new Date("2024-01-20")

  const invoices = [
    {
      id: "INV-001",
      date: "2024-01-08",
      description: "Therapy Session - Dr. Sarah Johnson",
      amount: 150.0,
      status: "pending",
      dueDate: "2024-01-20",
    },
    {
      id: "INV-002",
      date: "2023-12-15",
      description: "Initial Consultation - Dr. Sarah Johnson",
      amount: 200.0,
      status: "paid",
      paidDate: "2023-12-20",
    },
    {
      id: "INV-003",
      date: "2023-11-20",
      description: "Therapy Session - Dr. Sarah Johnson",
      amount: 150.0,
      status: "paid",
      paidDate: "2023-11-25",
    },
  ]

  const paymentMethods = [
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your payments, invoices, and billing information.
          </p>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(currentBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Payment Due</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDate(nextPaymentDue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-clarity-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">•••• {paymentMethods[0]?.last4}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Invoices</span>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{invoice.id}</h4>
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1">{invoice.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(invoice.date)}
                        {invoice.status === "pending" && ` • Due ${formatDate(invoice.dueDate)}`}
                        {invoice.status === "paid" && invoice.paidDate && ` • Paid ${formatDate(invoice.paidDate)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</p>
                      <div className="flex space-x-1 mt-2">
                        {invoice.status === "pending" && <Button size="sm">Pay Now</Button>}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Payment Methods</span>
                <Button variant="outline" size="sm">
                  Add New
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {method.brand} •••• {method.last4}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && <Badge variant="outline">Default</Badge>}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Payment */}
              {currentBalance > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Outstanding Balance</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pay your current balance of {formatCurrency(currentBalance)}
                      </p>
                    </div>
                    <Button>Pay {formatCurrency(currentBalance)}</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">Secure Billing</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All payment information is encrypted and processed securely. Billing records are maintained according
                  to HIPAA requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
