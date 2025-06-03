import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-custom"

export async function GET() {
  try {
    // Check if user is authenticated
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock appointments data - in production, this would come from your database
    const appointments = [
      {
        id: "1",
        date: "2024-01-15",
        time: "2:00 PM",
        provider: "Dr. Sarah Johnson",
        status: "Upcoming",
        type: "Therapy Session",
      },
      {
        id: "2",
        date: "2024-01-22",
        time: "10:30 AM",
        provider: "Dr. Michael Chen",
        status: "Upcoming",
        type: "Initial Consultation",
      },
      {
        id: "3",
        date: "2024-01-08",
        time: "4:00 PM",
        provider: "Dr. Sarah Johnson",
        status: "Completed",
        type: "Therapy Session",
      },
      {
        id: "4",
        date: "2023-12-20",
        time: "11:00 AM",
        provider: "Dr. Emily Rodriguez",
        status: "Completed",
        type: "Assessment",
      },
      {
        id: "5",
        date: "2023-12-15",
        time: "3:30 PM",
        provider: "Dr. Michael Chen",
        status: "Canceled",
        type: "Follow-up",
      },
    ]

    // Filter appointments based on user role if needed
    // For now, return all appointments for the authenticated user

    return NextResponse.json({
      success: true,
      appointments: appointments,
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
