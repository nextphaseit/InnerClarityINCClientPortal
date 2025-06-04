import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface RegisterRequest {
  name: string
  email: string
  password: string
  dateOfBirth?: string
}

// Mock user database (in production, use a real database)
const users: Array<{
  id: string
  name: string
  email: string
  passwordHash: string
  role: "admin" | "patient"
  dateOfBirth?: string
  createdAt: Date
  authProvider: string
}> = []

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registration attempt started")

    // Parse request body with error handling
    let body: RegisterRequest
    try {
      const rawBody = await request.text()
      console.log("📄 Raw request body:", rawBody)

      if (!rawBody) {
        throw new Error("Empty request body")
      }

      body = JSON.parse(rawBody)
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: "Request body must be valid JSON",
        },
        { status: 400 },
      )
    }

    const { name, email, password, dateOfBirth } = body

    // Validate required fields
    if (!name || !email || !password) {
      console.error("❌ Missing required fields")
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Name, email, and password are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error("❌ Invalid email format:", email)
      return NextResponse.json(
        {
          error: "Invalid email format",
          details: "Please provide a valid email address",
        },
        { status: 400 },
      )
    }

    // Validate password strength
    const passwordValidation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    if (!Object.values(passwordValidation).every(Boolean)) {
      console.error("❌ Password does not meet requirements")
      return NextResponse.json(
        {
          error: "Password does not meet requirements",
          details: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      console.error("❌ User already exists:", email)
      return NextResponse.json(
        {
          error: "User already exists",
          details: "An account with this email address already exists",
        },
        { status: 409 },
      )
    }

    try {
      // Hash password
      console.log("🔐 Hashing password...")
      const passwordHash = await bcrypt.hash(password, 12)

      // Create user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: "patient" as const,
        dateOfBirth: dateOfBirth || undefined,
        createdAt: new Date(),
        authProvider: "credentials",
      }

      // Save user (in production, save to database)
      users.push(newUser)

      console.log("✅ User created successfully:", {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      })

      // Return success response (don't include sensitive data)
      return NextResponse.json(
        {
          success: true,
          message: "Account created successfully",
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
          },
        },
        { status: 201 },
      )
    } catch (hashError) {
      console.error("❌ Password hashing failed:", hashError)
      return NextResponse.json(
        {
          error: "Account creation failed",
          details: "Failed to process password securely",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Registration error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        details: "An unexpected error occurred during registration",
      },
      { status: 500 },
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
