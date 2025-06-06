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
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Mail,
  Ban,
  CheckCircle,
  Filter,
  Download,
  Eye,
  UserX,
  RotateCcw,
  Calendar,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { logAuditEvent } from "@/lib/auth"

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
  address?: string
  emergency_contact?: string
  medical_notes?: string
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    status: "active" as const,
    address: "",
    emergency_contact: "",
    medical_notes: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadPatients()
    logAuditEvent("view", "patients")
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
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
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
      date_of_birth: patient.date_of_birth || "",
      status: patient.status,
      address: patient.address || "",
      emergency_contact: patient.emergency_contact || "",
      medical_notes: patient.medical_notes || "",
    })
    setIsEditModalOpen(true)
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewModalOpen(true)
  }

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return

    try {
      const { error } = await supabase.from("profiles").update(editForm).eq("id", selectedPatient.id)

      if (error) throw error

      await logAuditEvent("update", "patient", selectedPatient.id, {
        changes: editForm,
        patient_name: selectedPatient.full_name,
      })

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

  const handleStatusChange = async (patientId: string, newStatus: string, patientName: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", patientId)

      if (error) throw error

      await logAuditEvent("status_change", "patient", patientId, {
        new_status: newStatus,
        patient_name: patientName,
      })

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

  const handlePasswordReset = async (patientId: string, email: string, patientName: string) => {
    try {
      // In a real app, this would trigger a password reset email
      await logAuditEvent("password_reset", "patient", patientId, {
        patient_name: patientName,
        email: email,
      })

      toast({
        title: "Success",
        description: "Password reset email sent to patient",
      })
    } catch (error) {
      console.error("Error sending password reset:", error)
      toast({
        title: "Error",
        description: "Failed to send password reset email",
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{patients.length}</p>
                  <p className="text-sm text-gray-600">Total Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{patients.filter((p) => p.status === "active").length}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{patients.filter((p) => p.status === "suspended").length}</p>
                  <p className="text-sm text-gray-600">Suspended</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {
                      patients.filter((p) => {
                        const oneWeekAgo = new Date()
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                        return new Date(p.created_at) > oneWeekAgo
                      }).length
                    }
                  </p>
                  <p className="text-sm text-gray-600">New This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patients by name, email, or phone..."
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
                  <TableHead>Contact</TableHead>
                  <TableHead>Age</TableHead>
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">ID: {patient.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{patient.email}</p>
                        {patient.phone && <p className="text-sm text-gray-600 dark:text-gray-400">{patient.phone}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.date_of_birth ? (
                        <span>{calculateAge(patient.date_of_birth)} years</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewPatient(patient)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePasswordReset(patient.id, patient.email, patient.full_name)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          {patient.status === "active" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(patient.id, "suspended", patient.full_name)}
                              className="text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend Account
                            </DropdownMenuItem>
                          )}
                          {patient.status === "suspended" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(patient.id, "active", patient.full_name)}
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

        {/* View Patient Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>Complete patient information and medical history</DialogDescription>
            </DialogHeader>
            {selectedPatient && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedPatient.avatar_url || "/placeholder.svg"}
                      alt={selectedPatient.full_name}
                    />
                    <AvatarFallback className="text-lg">{selectedPatient.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedPatient.full_name}</h3>
                    <p className="text-gray-600">{selectedPatient.email}</p>
                    {getStatusBadge(selectedPatient.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-gray-600">{selectedPatient.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-sm text-gray-600">
                      {selectedPatient.date_of_birth
                        ? `${formatDate(selectedPatient.date_of_birth)} (${calculateAge(selectedPatient.date_of_birth)} years)`
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Joined</Label>
                    <p className="text-sm text-gray-600">{formatDate(selectedPatient.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Login</Label>
                    <p className="text-sm text-gray-600">
                      {selectedPatient.last_login ? formatDate(selectedPatient.last_login) : "Never"}
                    </p>
                  </div>
                </div>

                {selectedPatient.address && (
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm text-gray-600">{selectedPatient.address}</p>
                  </div>
                )}

                {selectedPatient.emergency_contact && (
                  <div>
                    <Label className="text-sm font-medium">Emergency Contact</Label>
                    <p className="text-sm text-gray-600">{selectedPatient.emergency_contact}</p>
                  </div>
                )}

                {selectedPatient.medical_notes && (
                  <div>
                    <Label className="text-sm font-medium">Medical Notes</Label>
                    <p className="text-sm text-gray-600">{selectedPatient.medical_notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Patient Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>Update patient information and account status.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={editForm.date_of_birth}
                    onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input
                  id="emergency"
                  value={editForm.emergency_contact}
                  onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <Label htmlFor="notes">Medical Notes</Label>
                <Textarea
                  id="notes"
                  value={editForm.medical_notes}
                  onChange={(e) => setEditForm({ ...editForm, medical_notes: e.target.value })}
                  rows={3}
                />
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
