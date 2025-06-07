import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// Production-ready appointments data structure
interface Appointment {
  id: string
  patient: string
  provider: string
  datetime: string
  status: "Upcoming" | "Confirmed" | "Completed" | "Cancelled"
  tenantId: string
  type?: string
  notes?: string
}

// Mock data for development - replace with database in production
const mockAppointments: Appointment[] = [
  {
    id: "apt-001",
    patient: "Current User",
    provider: "Dr. Sarah Johnson",
    datetime: "2024-06-15T10:30:00Z",
    status: "Upcoming",
    tenantId: "inner-clarity",
    type: "Initial Consultation",
  },
  {
    id: "apt-002",
    patient: "Current User",
    provider: "Dr. Michael Chen",
    datetime: "2024-06-20T14:00:00Z",
    status: "Confirmed",
    tenantId: "inner-clarity",
    type: "Follow-up Session",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get tenant ID from token or headers
    const tenantId = token.tenantId || request.headers.get("X-Tenant-ID") || "inner-clarity"

    // In production, replace with actual database query
    // const appointments = await db.appointments.findMany({
    //   where: { tenantId, userId: token.sub },
    //   orderBy: { datetime: 'asc' }
    // })

    // Filter appointments by tenant and format for client
    const filteredAppointments = mockAppointments
      .filter((appointment) => appointment.tenantId === tenantId)
      .map((appointment) => ({
        id: appointment.id,
        date: appointment.datetime.split("T")[0],
        time: new Date(appointment.datetime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        provider: appointment.provider,
        status: appointment.status,
        type: appointment.type,
      }))

    return NextResponse.json(
      { success: true, appointments: filteredAppointments },
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments", appointments: [] },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 })
    }

    const { patientName, provider, datetime, type, notes } = body

    // Validate required fields
    if (!provider || !datetime) {
      return NextResponse.json({ success: false, error: "Provider and datetime are required" }, { status: 400 })
    }

    // Validate datetime
    const appointmentDate = new Date(datetime)
    if (isNaN(appointmentDate.getTime()) || appointmentDate < new Date()) {
      return NextResponse.json({ success: false, error: "Invalid or past datetime" }, { status: 400 })
    }

    // In production, save to database
    // const newAppointment = await db.appointments.create({
    //   data: {
    //     userId: token.sub,
    //     provider,
    //     datetime: appointmentDate,
    //     type,
    //     notes,
    //     tenantId: token.tenantId,
    //     status: 'Upcoming'
    //   }
    // })

    const newAppointment = {
      id: `apt-${Date.now()}`,
      patient: token.name || "Current User",
      provider: provider.trim(),
      datetime: appointmentDate.toISOString(),
      status: "Upcoming" as const,
      tenantId: token.tenantId || "inner-clarity",
      type: type?.trim(),
      notes: notes?.trim(),
      createdAt: new Date().toISOString(),
    }

    console.log("New appointment scheduled:", { id: newAppointment.id, provider, datetime })

    return NextResponse.json(
      { success: true, message: "Appointment scheduled successfully", data: newAppointment },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error scheduling appointment:", error)
    return NextResponse.json({ success: false, error: "Failed to schedule appointment" }, { status: 500 })
  }
}
