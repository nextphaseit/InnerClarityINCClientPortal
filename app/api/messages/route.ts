import { NextResponse } from "next/server"

// Mock data for messages
const mockMessages = [
  {
    id: "msg-001",
    subject: "Welcome to Inner Clarity",
    body: "Welcome to Inner Clarity! We're excited to have you join our community. This secure messaging system allows you to communicate directly with your healthcare providers in a HIPAA-compliant environment.\n\nPlease feel free to reach out if you have any questions or concerns about your care.",
    from: "Admin",
    to: "Patient",
    date: "2025-06-01T14:30:00Z",
    status: "read",
    isFromAdmin: true,
  },
  {
    id: "msg-002",
    subject: "Upcoming Appointment Reminder",
    body: "This is a friendly reminder about your upcoming appointment with Dr. Alexis Archer on June 10th at 10:30 AM.\n\nPlease arrive 10 minutes early to complete any necessary paperwork. If you need to reschedule, please let us know at least 24 hours in advance.",
    from: "Dr. Alexis Archer",
    to: "Patient",
    date: "2025-06-03T09:15:00Z",
    status: "unread",
    isFromAdmin: true,
  },
  {
    id: "msg-003",
    subject: "Insurance Verification Complete",
    body: "We've completed the verification of your insurance coverage. Your plan covers 80% of therapy sessions after your deductible of $500 has been met.\n\nPlease let us know if you have any questions about your coverage or billing.",
    from: "Billing Department",
    to: "Patient",
    date: "2025-05-28T11:45:00Z",
    status: "read",
    isFromAdmin: true,
  },
  {
    id: "msg-004",
    subject: "Therapy Resources",
    body: "Based on our recent session, I'm sharing some resources that might be helpful for your anxiety management:\n\n1. Mindfulness meditation guide\n2. Progressive muscle relaxation technique\n3. Recommended reading: 'The Anxiety and Worry Workbook'\n\nPlease review these before our next session so we can discuss any questions you might have.",
    from: "Dr. Taylor Smith",
    to: "Patient",
    date: "2025-05-25T16:20:00Z",
    status: "read",
    isFromAdmin: true,
  },
]

export async function GET() {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return NextResponse.json({
      success: true,
      messages: mockMessages,
    })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.subject || !body.body) {
      return NextResponse.json({ success: false, error: "Subject and body are required" }, { status: 400 })
    }

    // Create a new message (in a real app, this would be saved to a database)
    const newMessage = {
      id: `msg-${Date.now()}`,
      subject: body.subject,
      body: body.body,
      from: "Patient",
      to: body.to || "Admin",
      date: new Date().toISOString(),
      status: "read",
      isFromAdmin: false,
    }

    // In a real app, you would save this to a database
    // For this mock API, we'll just return success

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    })
  } catch (error) {
    console.error("Error in messages POST API:", error)
    return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 })
  }
}
