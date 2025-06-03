import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock appointments data for testing
    const appointments = [
      {
        id: "1",
        date: "2025-06-10",
        time: "10:30 AM",
        provider: "Dr. Alexis Archer",
        status: "Upcoming",
        type: "Therapy Session",
      },
      {
        id: "2",
        date: "2025-05-20",
        time: "2:00 PM",
        provider: "Dr. Taylor Smith",
        status: "Completed",
        type: "Initial Consultation",
      },
      {
        id: "3",
        date: "2025-06-15",
        time: "3:30 PM",
        provider: "Dr. Alexis Archer",
        status: "Upcoming",
        type: "Follow-up Session",
      },
      {
        id: "4",
        date: "2025-05-10",
        time: "11:00 AM",
        provider: "Dr. Morgan Lee",
        status: "Completed",
        type: "Assessment",
      },
    ]

    return NextResponse.json({
      success: true,
      appointments: appointments,
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
