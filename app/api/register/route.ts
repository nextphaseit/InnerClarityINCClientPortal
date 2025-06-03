import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Mock user database - replace with real database in production
const users: Array<{
  id: string
  fullName: string
  email: string
  password: string
  dateOfBirth?: string
  role: "patient" | "admin"
  tenantId?: string
  createdAt: string
  emailVerified: boolean
}> = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, password, dateOfBirth } = body

    // Validation
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Full name, email, and password are required" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    const passwordValidation = {
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    if (!Object.values(passwordValidation).every(Boolean)) {
      return NextResponse.json(
        { error: "Password must contain uppercase, lowercase, number, and special character" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      dateOfBirth: dateOfBirth || undefined,
      role: "patient" as const,
      createdAt: new Date().toISOString(),
      emailVerified: false, // In production, implement email verification
    }

    // Store user (in production, save to database)
    users.push(newUser)

    // Log registration for audit purposes
    console.log("New user registered:", {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      timestamp: newUser.createdAt,
    })

    // Return success (don't include password in response)
    const { password: _, ...userResponse } = newUser

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: userResponse,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 })
  }
}

// Export users for use in auth (in production, this would be database queries)
export { users }
