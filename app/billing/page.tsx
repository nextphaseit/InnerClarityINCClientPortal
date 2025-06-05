"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Download,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Shield,
  Clock,
  FileText,
  Loader2,
} from "lucide-react"

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  amount: number
  description: string
  status: "paid" | "unpaid" | "overdue"
  dueDate: string
  paidDate?: string
  downloadUrl?: string
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payingInvoice, setPayingInvoice] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }

    if (session?.user) {
      fetchInvoices()
    }
  }, [session, status, router])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Mock data for now - replace with actual API call
      const mockInvoices: Invoice[] = [
        {
          id: "1",
          invoiceNumber: "INV-2024-001",
          date: "2024-01-15",
          amount: 150.0,
          description: "Therapy Session - January 2024",
          status: "paid",
          dueDate: "2024-01-30",
          paidDate: "2024-01-20",
          downloadUrl: "/invoices/inv-2024-001.pdf",
        },
        {
          id: "2",
          invoiceNumber: "INV-2024-002",
          date: "2024-02-15",
          amount: 150.0,
          description: "Therapy Session - February 2024",
          status: "unpaid",
          dueDate: "2024-02-28",
        },
      ]

      setInvoices(mockInvoices)
    } catch (err) {
      console.error("Error fetching invoices:", err)
      setError("Failed to load billing information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayNow = async (invoiceId: string, amount: number) => {
    try {
      setPayingInvoice(invoiceId)

      const response = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId,
          amount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment session")
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (err) {
      console.error("Error creating payment session:", err)
      alert("Unable to process payment. Please try again.")
    } finally {
      setPayingInvoice(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "unpaid":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "unpaid":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Show loading state while session is loading
  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading billing information...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your billing information.</p>
              <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const totalUnpaid = invoices
    .filter((invoice) => invoice.status === "unpaid" || invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  const overdueCount = invoices.filter((invoice) => invoice.status === "overdue").length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Payments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">View and manage your invoices and payment history.</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">Error</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchInvoices} className="ml-auto">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(totalUnpaid)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{invoices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`bg-gradient-to-br ${
              overdueCount > 0
                ? "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20"
                : "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                {overdueCount > 0 ? (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${
                      overdueCount > 0 ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"
                    }`}
                  >
                    Overdue Invoices
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      overdueCount > 0 ? "text-red-900 dark:text-red-100" : "text-green-900 dark:text-green-100"
                    }`}
                  >
                    {overdueCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Invoices</span>
              <Button variant="outline" size="sm" onClick={fetchInvoices}>
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any invoices at this time. New invoices will appear here when available.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(invoice.date)}</p>
                        </div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1 capitalize">{invoice.status}</span>
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{invoice.description}</p>

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(invoice.amount)}
                        </span>
                        <div className="flex space-x-2">
                          {(invoice.status === "unpaid" || invoice.status === "overdue") && (
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(invoice.id, invoice.amount)}
                              disabled={payingInvoice === invoice.id}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {payingInvoice === invoice.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Pay Now
                                </>
                              )}
                            </Button>
                          )}
                          {invoice.downloadUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={invoice.downloadUrl} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* HIPAA Notice */}
        <Card className="mt-8 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Secure Billing</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  All payment information is encrypted and processed securely through Stripe. Billing records are
                  maintained according to HIPAA requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
