import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

// Auth0 Management API setup
const auth0Domain = process.env.AUTH0_DOMAIN
const auth0ClientId = process.env.AUTH0_CLIENT_ID
const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET

async function getAuth0ManagementToken() {
  const response = await fetch(`https://${auth0Domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: auth0ClientId,
      client_secret: auth0ClientSecret,
      audience: `https://${auth0Domain}/api/v2/`,
      grant_type: "client_credentials",
    }),
  })

  const data = await response.json()
  return data.access_token
}

async function createAuth0User(email: string, password: string, name: string) {
  const token = await getAuth0ManagementToken()

  const response = await fetch(`https://${auth0Domain}/api/v2/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      name,
      connection: "Username-Password-Authentication",
      email_verified: false,
      verify_email: true,
    }),
  })

  return await response.json()
}

async function checkSuperAdminAccess(session: any) {
  if (!session?.user?.email) {
    return false
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role, status")
    .eq("email", session.user.email)
    .eq("status", "active")
    .single()

  return adminUser?.role === "super_admin"
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(await checkSuperAdminAccess(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminUsers, error } = await supabase
      .from("admin_users")
      .select(`
        id,
        full_name,
        email,
        role,
        status,
        created_at,
        last_login,
        created_by,
        creator:admin_users!created_by(full_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching admin users:", error)
      return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 })
    }

    return NextResponse.json({ users: adminUsers })
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(await checkSuperAdminAccess(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fullName, email, temporaryPassword, role } = await request.json()

    // Validate input
    if (!fullName || !email || !temporaryPassword || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!["admin", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if email already exists
    const { data: existingUser } = await supabase.from("admin_users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Get current user ID for created_by
    const { data: currentUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", session.user.email)
      .single()

    // Create user in Auth0
    let auth0UserId = null
    try {
      const auth0User = await createAuth0User(email, temporaryPassword, fullName)
      auth0UserId = auth0User.user_id
    } catch (auth0Error) {
      console.error("Auth0 user creation failed:", auth0Error)
      // Continue without Auth0 user - they can be created later
    }

    // Create user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from("admin_users")
      .insert({
        full_name: fullName,
        email,
        role,
        status: "active",
        auth0_user_id: auth0UserId,
        created_by: currentUser?.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating admin user:", insertError)
      return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
    }

    // TODO: Send welcome email with login instructions
    // This would integrate with your email service (SendGrid, etc.)

    return NextResponse.json({
      message: "Admin user created successfully",
      user: newUser,
    })
  } catch (error) {
    console.error("Error in POST /api/admin/users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
