import { NextResponse } from "next/server"

// Mock data for messages
const mockMessages = []

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
