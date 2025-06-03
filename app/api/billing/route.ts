import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Mock invoice data - replace with actual database queries
const mockInvoices = [
  {
    id: "inv_001",
    invoiceNumber: "INV-2024-001",
    date: "2024-01-15",
    amount: 15000, // $150.00 in cents
    description: "Therapy Session - Dr. Sarah Johnson",
    status: "unpaid",
    dueDate: "2024-02-15",
    downloadUrl: "/api/invoices/inv_001/download",
  },
  {
    id: "inv_002",
    invoiceNumber: "INV-2024-002",
    date: "2024-01-08",
    amount: 20000, // $200.00 in cents
    description: "Initial Consultation - Dr. Sarah Johnson",
    status: "paid",
    dueDate: "2024-02-08",
    paidDate: "2024-01-10",
    downloadUrl: "/api/invoices/inv_002/download",
  },
  {
    id: "inv_003",
    invoiceNumber: "INV-2023-045",
    date: "2023-12-20",
    amount: 15000, // $150.00 in cents
    description: "Therapy Session - Dr. Sarah Johnson",
    status: "overdue",
    dueDate: "2024-01-20",
    downloadUrl: "/api/invoices/inv_003/download",
  },
  {
    id: "inv_004",
    invoiceNumber: "INV-2023-044",
    date: "2023-12-15",
    amount: 15000, // $150.00 in cents
    description: "Therapy Session - Dr. Sarah Johnson",
    status: "paid",
    dueDate: "2024-01-15",
    paidDate: "2023-12-18",
    downloadUrl: "/api/invoices/inv_004/download",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // In a real application, you would:
    // 1. Query your database for invoices belonging to the authenticated user
    // 2. Filter by user ID from session
    // 3. Apply any query parameters for filtering/pagination

    // For now, return mock data
    const userInvoices = mockInvoices.map((invoice) => ({
      ...invoice,
      // Convert cents to dollars for display
      amount: invoice.amount / 100,
    }))

    // Log the request for audit purposes
    console.log(`Billing data requested by user: ${session.user.email}`)

    return NextResponse.json({
      success: true,
      invoices: userInvoices,
      total: userInvoices.length,
      totalUnpaid: userInvoices
        .filter((inv) => inv.status === "unpaid" || inv.status === "overdue")
        .reduce((sum, inv) => sum + inv.amount, 0),
    })
  } catch (error) {
    console.error("Error fetching billing data:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch billing information",
      },
      { status: 500 },
    )
  }
}

// Handle invoice creation (for admin use)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow admin users to create invoices
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { clientId, amount, description, dueDate } = body

    // Validate required fields
    if (!clientId || !amount || !description || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In a real application, you would:
    // 1. Create the invoice in your database
    // 2. Generate a unique invoice number
    // 3. Send notification to the client
    // 4. Log the action for audit purposes

    const newInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      date: new Date().toISOString().split("T")[0],
      amount: amount / 100, // Convert cents to dollars
      description,
      status: "unpaid",
      dueDate,
      clientId,
    }

    console.log(`Invoice created by admin: ${session.user.email} for client: ${clientId}`)

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      message: "Invoice created successfully",
    })
  } catch (error) {
    console.error("Error creating invoice:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create invoice",
      },
      { status: 500 },
    )
  }
}
