import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase } from "@/lib/supabase"

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(await checkSuperAdminAccess(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fullName, email, role, status } = await request.json()
    const userId = params.id

    // Validate input
    if (!fullName || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 })
    }

    if (!["admin", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    if (status && !["active", "disabled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update user in Supabase
    const updateData: any = {
      full_name: fullName,
      email,
      role,
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updateData.status = status
    }

    const { data: updatedUser, error } = await supabase
      .from("admin_users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating admin user:", error)
      return NextResponse.json({ error: "Failed to update admin user" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Admin user updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error in PUT /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !(await checkSuperAdminAccess(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = params.id

    // Soft delete by setting status to disabled
    const { error } = await supabase
      .from("admin_users")
      .update({
        status: "disabled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error disabling admin user:", error)
      return NextResponse.json({ error: "Failed to disable admin user" }, { status: 500 })
    }

    return NextResponse.json({ message: "Admin user disabled successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
