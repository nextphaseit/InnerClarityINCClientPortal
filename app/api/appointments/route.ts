import { NextResponse } from "next/server"

// Mock data for appointments
const mockAppointments = [
  {
    id: "apt-001",
    date: "2025-06-10",
    time: "10:30 AM",
    provider: "Dr. Alexis Archer",
    status: "Upcoming",
    type: "Therapy Session",
  },
  {
    id: "apt-002",
    date: "2025-05-20",
    time: "2:00 PM",
    provider: "Dr. Taylor Smith",
    status: "Completed",
    type: "Initial Consultation",
  },
  {
    id: "apt-003",
    date: "2025-06-15",
    time: "11:00 AM",
    provider: "Dr. Morgan Lee",
    status: "Upcoming",
    type: "Follow-up",
  },
  {
    id: "apt-004",
    date: "2025-05-05",
    time: "3:30 PM",
    provider: "Dr. Alexis Archer",
    status: "Completed",
    type: "Therapy Session",
  },
]

export async function GET() {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return NextResponse.json({
      success: true,
      appointments: mockAppointments,
    })
  } catch (error) {
    console.error("Error in appointments API:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.date || !body.time || !body.provider || !body.type) {
      return NextResponse.json({ success: false, error: "Missing required appointment information" }, { status: 400 })
    }

    // Create a new appointment (in a real app, this would be saved to a database)
    const newAppointment = {
      id: `apt-${Date.now()}`,
      date: body.date,
      time: body.time,
      provider: body.provider,
      status: "Upcoming",
      type: body.type,
    }

    // In a real app, you would save this to a database
    // For this mock API, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully",
      data: newAppointment,
    })
  } catch (error) {
    console.error("Error in appointments POST API:", error)
    return NextResponse.json({ success: false, error: "Failed to book appointment" }, { status: 500 })
  }
}
