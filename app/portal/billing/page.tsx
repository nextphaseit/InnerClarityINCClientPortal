"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { AlertCircle, CreditCard, Download, FileText, Receipt, DollarSign, CheckCircle, Clock } from "lucide-react"

interface Invoice {
  id: string
  date: string
  amount: number
  description: string
  status: "paid" | "pending" | "overdue"
  pdfUrl?: string
}

interface InsuranceClaim {
  id: string
  date: string
  provider: string
  service: string
  amount: number
  status: "approved" | "pending" | "denied"
  claimNumber: string
}

interface PaymentMethod {
  id: string
  type: "card" | "bank"
  last4: string
  expiry?: string
  isDefault: boolean
}

export default function BillingPage() {
  const { user } = usePatientAuth()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [error, setError] = useState("")
  const router = useRouter()

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
      // Mock data for demo
      const mockInvoices: Invoice[] = [
        {
          id: "INV-2023-001",
          date: "2023-05-15",
          amount: 75.0,
          description: "Office Visit - General Checkup",
          status: "paid",
          pdfUrl: "#",
        },
        {
          id: "INV-2023-002",
          date: "2023-05-28",
          amount: 150.0,
          description: "Specialist Consultation",
          status: "pending",
          pdfUrl: "#",
        },
        {
          id: "INV-2023-003",
          date: "2023-04-10",
          amount: 45.0,
          description: "Lab Tests - Blood Work",
          status: "paid",
          pdfUrl: "#",
        },
        {
          id: "INV-2023-004",
          date: "2023-03-22",
          amount: 200.0,
          description: "Imaging - X-Ray",
          status: "overdue",
          pdfUrl: "#",
        },
      ]

      const mockClaims: InsuranceClaim[] = [
        {
          id: "CLM-2023-001",
          date: "2023-05-15",
          provider: "Primary Care Physician",
          service: "Office Visit",
          amount: 150.0,
          status: "approved",
          claimNumber: "INS-12345",
        },
        {
          id: "CLM-2023-002",
          date: "2023-05-28",
          provider: "Specialist",
          service: "Consultation",
          amount: 250.0,
          status: "pending",
          claimNumber: "INS-12346",
        },
        {
          id: "CLM-2023-003",
          date: "2023-04-10",
          provider: "Laboratory",
          service: "Blood Tests",
          amount: 75.0,
          status: "approved",
          claimNumber: "INS-12347",
        },
      ]

      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: "pm-1",
          type: "card",
          last4: "4242",
          expiry: "05/25",
          isDefault: true,
        },
        {
          id: "pm-2",
          type: "bank",
          last4: "9876",
          isDefault: false,
        },
      ]

      setInvoices(mockInvoices)
      setClaims(mockClaims)
      setPaymentMethods(mockPaymentMethods)
    } catch (error) {
      console.error("Error loading billing data:", error)
      setError("Unable to load billing information. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
      case "approved":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return <Badge className="bg-amber-500">Pending</Badge>
      case "overdue":
      case "denied":
        return <Badge className="bg-red-500">Overdue</Badge>
      default:
        return <Badge>{status}</Badge>
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
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Billing & Payments</h1>
          <p className="text-slate-600">Manage your invoices, insurance claims, and payment methods</p>
        </div>

        {error && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Summary Cards */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-slate-800">
                <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                Outstanding Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">$350.00</div>
              <p className="text-sm text-slate-500 mt-1">Due within 30 days</p>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Make a Payment</Button>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-slate-800">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Insurance Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">80%</div>
              <p className="text-sm text-slate-500 mt-1">In-network coverage</p>
              <div className="mt-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span>Deductible</span>
                  <span className="font-medium">$500 / $1,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Out-of-pocket max</span>
                  <span className="font-medium">$2,000 / $5,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-slate-800">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Next Payment Due
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">June 15, 2023</div>
              <p className="text-sm text-slate-500 mt-1">Invoice #INV-2023-002</p>
              <Button variant="outline" className="w-full mt-4">
                Set Up Auto-Pay
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invoices" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="insurance">Insurance Claims</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800">
                  <FileText className="h-5 w-5 mr-2" />
                  Invoices & Statements
                </CardTitle>
                <CardDescription>View and pay your medical bills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Invoice #</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-right py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{invoice.id}</td>
                          <td className="py-3 px-4">{formatDate(invoice.date)}</td>
                          <td className="py-3 px-4">{invoice.description}</td>
                          <td className="py-3 px-4">{formatCurrency(invoice.amount)}</td>
                          <td className="py-3 px-4">{getStatusBadge(invoice.status)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                              {invoice.status !== "paid" && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Pay
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurance">
            <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800">
                  <FileText className="h-5 w-5 mr-2" />
                  Insurance Claims
                </CardTitle>
                <CardDescription>Track your insurance claim status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Claim #</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Provider</th>
                        <th className="text-left py-3 px-4">Service</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map((claim) => (
                        <tr key={claim.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">{claim.claimNumber}</td>
                          <td className="py-3 px-4">{formatDate(claim.date)}</td>
                          <td className="py-3 px-4">{claim.provider}</td>
                          <td className="py-3 px-4">{claim.service}</td>
                          <td className="py-3 px-4">{formatCurrency(claim.amount)}</td>
                          <td className="py-3 px-4">{getStatusBadge(claim.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-800">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="p-4 border rounded-lg bg-white flex flex-col sm:flex-row sm:items-center justify-between"
                    >
                      <div className="flex items-center">
                        {method.type === "card" ? (
                          <CreditCard className="h-5 w-5 mr-3 text-blue-600" />
                        ) : (
                          <DollarSign className="h-5 w-5 mr-3 text-blue-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {method.type === "card" ? "Credit Card" : "Bank Account"} •••• {method.last4}
                          </div>
                          {method.expiry && <div className="text-sm text-slate-500">Expires {method.expiry}</div>}
                          {method.isDefault && (
                            <Badge variant="outline" className="mt-1 text-blue-600 border-blue-200 bg-blue-50">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        {!method.isDefault && (
                          <Button variant="outline" size="sm">
                            Set as Default
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
