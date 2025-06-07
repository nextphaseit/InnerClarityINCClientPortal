import { type NextRequest, NextResponse } from "next/server"

// Mock clients data with tenant information
const mockClients = [
  {
    id: "client-1",
    name: "Jayda Smith",
    email: "jayda@innerclarity.org",
    dateRegistered: "2024-01-15",
    tenantId: "inner-clarity",
    status: "Active",
  },
  {
    id: "client-2",
    name: "Michael Johnson",
    email: "michael.j@innerclarity.org",
    dateRegistered: "2024-01-20",
    tenantId: "inner-clarity",
    status: "Active",
  },
  {
    id: "client-3",
    name: "Sarah Wilson",
    email: "sarah.w@innerclarity.org",
    dateRegistered: "2024-02-01",
    tenantId: "inner-clarity",
    status: "Active",
  },
  {
    id: "client-4",
    name: "David Brown",
    email: "david.b@otherorg.com",
    dateRegistered: "2024-01-10",
    tenantId: "other-org",
    status: "Active",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    // Return empty array if tenantId is missing
    if (!tenantId) {
      return NextResponse.json([])
    }

    // Filter clients by tenantId
    const filteredClients = mockClients.filter((client) => client.tenantId === tenantId)

    return NextResponse.json(filteredClients, { status: 200 })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { name, email, phone, notes } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, and phone are required" },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    // Mock client creation (in production, save to database)
    const newClient = {
      id: `client-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      notes: notes?.trim() || "",
      status: "active",
      dateRegistered: new Date().toISOString().split("T")[0],
      tenantId: "inner-clarity", // In production, get from session
    }

    // Log the received data (in production, save to database)
    console.log("New client created:", newClient)

    return NextResponse.json({
      success: true,
      message: "Client created successfully",
      data: newClient,
    })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
