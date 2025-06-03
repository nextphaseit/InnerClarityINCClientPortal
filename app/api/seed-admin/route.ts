import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Mock database for admin users
const adminUsers: Array<{
  id: string
  name: string
  email: string
  passwordHash: string
  role: string
  tenantId: string
  tenantName: string
  authProvider: string
  dateCreated: string
}> = []

export async function GET() {
  try {
    // Check if admin already exists
    const adminExists = adminUsers.some((user) => user.email === "admin@innerclarityinc.com" && user.role === "admin")

    if (adminExists) {
      return NextResponse.json({
        success: false,
        message: "Admin user already exists",
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash("Admin@1234", 12)

    // Create default admin
    const defaultAdmin = {
      id: `admin-${Date.now()}`,
      name: "Adrian Knight",
      email: "admin@innerclarityinc.com",
      passwordHash,
      role: "admin",
      tenantId: "inner-clarity-main",
      tenantName: "Inner Clarity - Main Office",
      authProvider: "microsoft",
      dateCreated: new Date().toISOString(),
    }

    // Add to mock database
    adminUsers.push(defaultAdmin)

    // Log creation (without sensitive data)
    console.log("Default admin user created:", {
      id: defaultAdmin.id,
      email: defaultAdmin.email,
      name: defaultAdmin.name,
      role: defaultAdmin.role,
      tenantId: defaultAdmin.tenantId,
      authProvider: defaultAdmin.authProvider,
      dateCreated: defaultAdmin.dateCreated,
    })

    return NextResponse.json({
      success: true,
      message: "Default admin user created successfully",
      admin: {
        name: defaultAdmin.name,
        email: defaultAdmin.email,
        role: defaultAdmin.role,
        tenantId: defaultAdmin.tenantId,
        tenantName: defaultAdmin.tenantName,
        authProvider: defaultAdmin.authProvider,
      },
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create admin user",
      },
      { status: 500 },
    )
  }
}
