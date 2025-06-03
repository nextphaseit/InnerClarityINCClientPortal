import { type NextRequest, NextResponse } from "next/server"

// Mock appointments data with tenant information
const mockAppointments = [
  {
    id: "apt-1",
    patient: "Jayda Smith",
    provider: "Dr. Sarah Johnson",
    datetime: "2024-06-15T10:30:00",
    status: "Upcoming",
    tenantId: "inner-clarity",
  },
  {
    id: "apt-2",
    patient: "Michael Johnson",
    provider: "Dr. Michael Chen",
    datetime: "2024-06-16T14:00:00",
    status: "Confirmed",
    tenantId: "inner-clarity",
  },
  {
    id: "apt-3",
    patient: "Sarah Wilson",
    provider: "Dr. Sarah Johnson",
    datetime: "2024-06-10T09:00:00",
    status: "Completed",
    tenantId: "inner-clarity",
  },
  {
    id: "apt-4",
    patient: "External Patient",
    provider: "Dr. Other",
    datetime: "2024-06-12T11:00:00",
    status: "Upcoming",
    tenantId: "other-org",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    // Return 400 if tenantId is missing or invalid
    if (!tenantId) {
      return NextResponse.json({ error: "tenantId query parameter is required" }, { status: 400 })
    }

    // Filter appointments by tenantId
    const filteredAppointments = mockAppointments.filter((appointment) => appointment.tenantId === tenantId)

    return NextResponse.json(filteredAppointments, { status: 200 })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
      patient: patientName.trim(),
      provider: provider.trim(),
      datetime: datetime,
      status: status || "Upcoming",
      tenantId: "inner-clarity", // In production, get from session
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
