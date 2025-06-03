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
    const { patientName, provider, datetime, status } = body

    if (!patientName || !provider || !datetime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: patientName, provider, and datetime are required" },
        { status: 400 },
      )
    }

    // Validate datetime format
    const appointmentDate = new Date(datetime)
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid datetime format" }, { status: 400 })
    }

    // Check if appointment is in the past
    if (appointmentDate < new Date()) {
      return NextResponse.json({ success: false, error: "Cannot schedule appointments in the past" }, { status: 400 })
    }

    // Create a new appointment (in a real app, this would be saved to a database)
    const newAppointment = {
      id: `apt-${Date.now()}`,
      patientName: patientName.trim(),
      provider: provider.trim(),
      datetime: datetime,
      status: status || "Upcoming",
      type: "Scheduled Appointment",
      createdAt: new Date().toISOString(),
    }

    // Log the appointment (in production, save to database)
    console.log("New appointment scheduled:", newAppointment)

    return NextResponse.json({
      success: true,
      message: "Appointment scheduled successfully",
      data: newAppointment,
    })
  } catch (error) {
    console.error("Error in appointments POST API:", error)
    return NextResponse.json({ success: false, error: "Failed to schedule appointment" }, { status: 500 })
  }
}
