import { NextResponse } from "next/server"

export async function POST(request: Request) {
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
      createdAt: new Date().toISOString(),
      provider: "Unassigned",
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

export async function GET() {
  // Return mock clients data for testing
  const mockClients = [
    {
      id: "client-1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      status: "active",
      provider: "Dr. Sarah Johnson",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "client-2",
      name: "Jane Doe",
      email: "jane.doe@email.com",
      phone: "(555) 234-5678",
      status: "active",
      provider: "Dr. Michael Chen",
      createdAt: "2024-01-02T00:00:00Z",
    },
  ]

  return NextResponse.json({
    success: true,
    clients: mockClients,
  })
}
