import { NextResponse } from "next/server"

// Mock data for billing
const mockInvoices = [
  {
    id: "inv-001",
    invoiceNumber: "INV-1001",
    date: "2025-05-25",
    amount: 150.0,
    description: "Therapy Session with Dr. Alexis Archer",
    status: "paid",
    dueDate: "2025-06-10",
    paidDate: "2025-05-28",
    downloadUrl: "/api/invoices/INV-1001/download",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-1002",
    date: "2025-06-01",
    amount: 200.0,
    description: "Initial Consultation with Dr. Taylor Smith",
    status: "unpaid",
    dueDate: "2025-06-15",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-1003",
    date: "2025-05-15",
    amount: 75.0,
    description: "Copay for Medication Management",
    status: "overdue",
    dueDate: "2025-05-30",
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-1004",
    date: "2025-04-20",
    amount: 150.0,
    description: "Therapy Session with Dr. Morgan Lee",
    status: "paid",
    dueDate: "2025-05-05",
    paidDate: "2025-04-25",
    downloadUrl: "/api/invoices/INV-1004/download",
  },
]

// Calculate summary information
const calculateSummary = () => {
  const totalUnpaid = mockInvoices
    .filter((inv) => inv.status === "unpaid" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0)

  const overdueCount = mockInvoices.filter((inv) => inv.status === "overdue").length

  return {
    totalInvoices: mockInvoices.length,
    totalUnpaid,
    overdueCount,
  }
}

export async function GET() {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const summary = calculateSummary()

    return NextResponse.json({
      success: true,
      invoices: mockInvoices,
      summary,
    })
  } catch (error) {
    console.error("Error in billing API:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch billing information" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields for payment
    if (!body.invoiceId) {
      return NextResponse.json({ success: false, error: "Invoice ID is required" }, { status: 400 })
    }

    // In a real app, you would process the payment or create a payment intent
    // For this mock API, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
    })
  } catch (error) {
    console.error("Error in billing POST API:", error)
    return NextResponse.json({ success: false, error: "Failed to process payment" }, { status: 500 })
  }
}
