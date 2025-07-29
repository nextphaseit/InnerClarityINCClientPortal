import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Mock user database - in production, replace with real database
const users: Array<{
  id: string
  name: string
  email: string
  passwordHash: string
  role: "patient" | "admin"
  tenantId?: string
  dateRegistered: string
}> = [
  {
    id: "admin-1",
    name: "Dr. Sarah Johnson",
    email: "admin@innerclarity.org",
    passwordHash: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "admin",
    tenantId: "inner-clarity",
    dateRegistered: "2024-01-01T00:00:00Z",
  },
  {
    id: "patient-1",
    name: "Jayda Smith",
    email: "jayda@innerclarity.org",
    passwordHash: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "patient",
    tenantId: "inner-clarity",
    dateRegistered: "2024-01-15T00:00:00Z",
  },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, tenantId } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Validate password strength
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
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password securely
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "patient" as const,
      tenantId: tenantId || "inner-clarity",
      dateRegistered: new Date().toISOString(),
    }

    // Store user in mock database
    users.push(newUser)

    // Log registration (without sensitive data)
    console.log("New user registered:", {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenantId: newUser.tenantId,
      timestamp: newUser.dateRegistered,
    })

    return NextResponse.json({ message: "Account created successfully" }, { status: 200 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Export users for NextAuth
export { users }
