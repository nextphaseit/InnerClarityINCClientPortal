"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, UserX, RotateCcw } from "lucide-react"
import { CreateAdminUserModal } from "@/components/create-admin-user-modal"
import { EditAdminUserModal } from "@/components/edit-admin-user-modal"
import { useToast } from "@/hooks/use-toast"

interface AdminUser {
  id: string
  full_name: string
  email: string
  role: "admin" | "super_admin"
  status: "active" | "disabled" | "pending"
  created_at: string
  last_login?: string
  creator?: { full_name: string }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      fetchUsers()
    }
  }, [status])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch admin users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin user created successfully",
        })
        fetchUsers()
        setCreateModalOpen(false)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create admin user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "Failed to create admin user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async (userData: any) => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin user updated successfully",
        })
        fetchUsers()
        setEditModalOpen(false)
        setSelectedUser(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update admin user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update admin user",
        variant: "destructive",
      })
    }
  }

  const handleDisableUser = async (userId: string) => {
    if (!confirm("Are you sure you want to disable this admin user?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Admin user disabled successfully",
        })
        fetchUsers()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to disable admin user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error disabling user:", error)
      toast({
        title: "Error",
        description: "Failed to disable admin user",
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "disabled":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be logged in to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin User Management</h1>
          <p className="text-gray-600 mt-2">Manage administrator accounts and permissions</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Admin User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription>View and manage all administrator accounts in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Created</th>
                  <th className="text-left py-3 px-4 font-semibold">Last Login</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name}</div>
                        {user.creator && (
                          <div className="text-sm text-gray-500">Created by {user.creator.full_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{user.email}</td>
                    <td className="py-3 px-4">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === "super_admin" ? "Super Admin" : "Admin"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setEditModalOpen(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisableUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement password reset
                            toast({
                              title: "Feature Coming Soon",
                              description: "Password reset functionality will be available soon",
                            })
                          }}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="text-center py-8 text-gray-500">No admin users found</div>}
          </div>
        </CardContent>
      </Card>

      <CreateAdminUserModal open={createModalOpen} onOpenChange={setCreateModalOpen} onSubmit={handleCreateUser} />

      {selectedUser && (
        <EditAdminUserModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSubmit={handleEditUser}
          user={selectedUser}
        />
      )}
    </div>
  )
}
