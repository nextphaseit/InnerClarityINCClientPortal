import { type NextRequest, NextResponse } from "next/server"

// Authorized domains for password reset
const AUTHORIZED_DOMAINS = ["@innerclarity.org", "@innerclarityinc.com", "@nextphaseit.org"]

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate authorized domain
    const isAuthorized = AUTHORIZED_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain.toLowerCase()))

    if (!isAuthorized) {
      return NextResponse.json({ error: "Only authorized Inner Clarity staff can reset passwords" }, { status: 403 })
    }

    // Since we're using Microsoft Entra ID, we'll redirect users to Microsoft's password reset
    // In a real implementation, you might use Microsoft Graph API to trigger a password reset
    console.log(`🔐 Password reset requested for: ${email}`)

    // For now, we'll simulate sending an email with instructions
    // In production, you would integrate with Microsoft Graph API or send an email
    // with instructions to use Microsoft's self-service password reset

    return NextResponse.json({
      success: true,
      message: "Password reset instructions sent",
      email: email,
    })
  } catch (error) {
    console.error("❌ Password reset API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
