import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock billing data for testing
    const invoices = [
      {
        id: "1",
        invoiceId: "INV-1001",
        date: "2025-05-25",
        amount: "$150.00",
        status: "Paid",
        description: "Therapy Session - Dr. Taylor Smith",
        dueDate: "2025-06-25",
      },
      {
        id: "2",
        invoiceId: "INV-1002",
        date: "2025-06-01",
        amount: "$200.00",
        status: "Unpaid",
        description: "Initial Consultation - Dr. Alexis Archer",
        dueDate: "2025-07-01",
      },
      {
        id: "3",
        invoiceId: "INV-1003",
        date: "2025-05-15",
        amount: "$150.00",
        status: "Overdue",
        description: "Therapy Session - Dr. Morgan Lee",
        dueDate: "2025-06-15",
      },
      {
        id: "4",
        invoiceId: "INV-1004",
        date: "2025-05-10",
        amount: "$175.00",
        status: "Paid",
        description: "Assessment - Dr. Morgan Lee",
        dueDate: "2025-06-10",
      },
    ]

    // Calculate summary data
    const totalUnpaid = invoices
      .filter((inv) => inv.status === "Unpaid" || inv.status === "Overdue")
      .reduce((sum, inv) => sum + Number.parseFloat(inv.amount.replace("$", "")), 0)

    return NextResponse.json({
      success: true,
      invoices: invoices,
      summary: {
        totalInvoices: invoices.length,
        totalUnpaid: `$${totalUnpaid.toFixed(2)}`,
        overdueCount: invoices.filter((inv) => inv.status === "Overdue").length,
      },
    })
  } catch (error) {
    console.error("Error fetching billing data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
