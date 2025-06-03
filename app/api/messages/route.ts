import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock messages data for testing
    const messages = [
      {
        id: "1",
        date: "2025-06-01",
        from: "Admin",
        subject: "Welcome to Inner Clarity",
        status: "Read",
        body: "Welcome to our secure messaging system. We're here to support you on your mental health journey.",
      },
      {
        id: "2",
        date: "2025-06-03",
        from: "Admin",
        subject: "Upcoming Appointment Reminder",
        status: "Unread",
        body: "This is a reminder about your upcoming appointment on June 10th at 10:30 AM with Dr. Alexis Archer.",
      },
      {
        id: "3",
        date: "2025-05-28",
        from: "Dr. Taylor Smith",
        subject: "Session Follow-up",
        status: "Read",
        body: "Thank you for attending your session. Please continue with the exercises we discussed.",
      },
      {
        id: "4",
        date: "2025-06-05",
        from: "Billing Department",
        subject: "Payment Confirmation",
        status: "Unread",
        body: "Your payment for invoice INV-1001 has been successfully processed.",
      },
    ]

    return NextResponse.json({
      success: true,
      messages: messages,
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Mock response for sending a new message
    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
