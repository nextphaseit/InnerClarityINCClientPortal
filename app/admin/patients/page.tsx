"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users, Search, Plus, MoreHorizontal, Edit, Mail, Ban, CheckCircle, Filter, Download, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Patient {
  id: string
  full_name: string
  email: string
  phone?: string
  date_of_birth?: string
  status: "active" | "inactive" | "suspended"
  created_at: string
  last_login?: string
  avatar_url?: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    status: "active" as const,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    filterPatients()
  }, [patients, searchTerm, statusFilter])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "patient")
        .order("created_at", { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error("Error loading patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterPatients = () => {
    let filtered = patients

    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((patient) => patient.status === statusFilter)
    }

    setFilteredPatients(filtered)
  }

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setEditForm({
      full_name: patient.full_name,
      email: patient.email,
      phone: patient.phone || "",
      status: patient.status,
    })
    setIsEditModalOpen(true)
  }

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return

    try {
      const { error } = await supabase.from("profiles").update(editForm).eq("id", selectedPatient.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Patient updated successfully",
      })

      setIsEditModalOpen(false)
      loadPatients()
    } catch (error) {
      console.error("Error updating patient:", error)
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (patientId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", patientId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Patient status updated to ${newStatus}`,
      })

      loadPatients()
    } catch (error) {
      console.error("Error updating patient status:", error)
      toast({
        title: "Error",
        description: "Failed to update patient status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patients</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage patient profiles and account status</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Patients ({filteredPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={patient.avatar_url || "/placeholder.svg"} alt={patient.full_name} />
                          <AvatarFallback>{patient.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{patient.full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone || "—"}</TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell>{formatDate(patient.created_at)}</TableCell>
                    <TableCell>{patient.last_login ? formatDate(patient.last_login) : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          {patient.status === "active" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(patient.id, "suspended")}
                              className="text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend Account
                            </DropdownMenuItem>
                          )}
                          {patient.status === "suspended" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(patient.id, "active")}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Patient Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>Update patient information and account status.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleUpdatePatient}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
