import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-custom"

export async function GET() {
  try {
    // Check if user is authenticated
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock messages data - in production, this would come from your database
    const messages = [
      {
        id: "1",
        subject: "Welcome to Inner Clarity",
        body: "Welcome to our secure messaging system. We're here to support you on your mental health journey. Please don't hesitate to reach out if you have any questions or concerns.",
        from: "Dr. Sarah Johnson",
        to: user.name,
        date: "2024-01-10T14:30:00Z",
        status: "unread",
        isFromAdmin: true,
      },
      {
        id: "2",
        subject: "Appointment Confirmation",
        body: "This is to confirm your upcoming appointment on January 15th at 2:00 PM. Please arrive 10 minutes early for check-in. If you need to reschedule, please let us know at least 24 hours in advance.",
        from: "Inner Clarity Admin",
        to: user.name,
        date: "2024-01-08T10:15:00Z",
        status: "read",
        isFromAdmin: true,
      },
      {
        id: "3",
        subject: "Insurance Verification Complete",
        body: "Good news! Your insurance has been successfully verified and your coverage is active. You can now schedule appointments with full coverage benefits. If you have any questions about your benefits, please don't hesitate to ask.",
        from: "Billing Department",
        to: user.name,
        date: "2024-01-05T16:45:00Z",
        status: "read",
        isFromAdmin: true,
      },
      {
        id: "4",
        subject: "Thank you for your feedback",
        body: "Thank you for completing the session feedback form. Your input helps us provide better care. Based on your feedback, we'll continue to focus on the anxiety management techniques that have been working well for you.",
        from: "Dr. Sarah Johnson",
        to: user.name,
        date: "2024-01-03T11:20:00Z",
        status: "read",
        isFromAdmin: true,
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

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, body, to } = await request.json()

    // Validate required fields
    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 })
    }

    // In production, save the message to your database
    const newMessage = {
      id: Date.now().toString(),
      subject,
      body,
      from: user.name,
      to: to || "Admin",
      date: new Date().toISOString(),
      status: "sent",
      isFromAdmin: false,
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send notification to admin/provider
    // 3. Log the action for audit purposes

    console.log("New message sent:", newMessage)

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
