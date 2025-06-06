"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Video,
  MapPin,
  CalendarDays,
  AlertCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { logAuditEvent } from "@/lib/auth"

interface Appointment {
  id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  duration: number
  type: "in-person" | "virtual"
  status: "scheduled" | "confirmed" | "cancelled" | "completed" | "no-show"
  reason: string
  notes?: string
  provider_name?: string
  patient_profile?: {
    full_name: string
    email: string
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table")
  const [editForm, setEditForm] = useState({
    appointment_date: "",
    appointment_time: "",
    duration: 60,
    type: "in-person" as const,
    status: "scheduled" as const,
    reason: "",
    notes: "",
    provider_name: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadAppointments()
    logAuditEvent("view", "appointments")
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, typeFilter, dateFilter])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          patient_profile:profiles!appointments_patient_id_fkey(
            full_name,
            email
          )
        `)
        .order("appointment_date", { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error("Error loading appointments:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (searchTerm) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.patient_profile?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          appointment.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((appointment) => appointment.type === typeFilter)
    }

    if (dateFilter) {
      filtered = filtered.filter((appointment) => appointment.appointment_date.startsWith(dateFilter))
    }

    setFilteredAppointments(filtered)
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointmentId)

      if (error) throw error

      const appointment = appointments.find((a) => a.id === appointmentId)
      await logAuditEvent("status_change", "appointment", appointmentId, {
        new_status: newStatus,
        patient_name: appointment?.patient_profile?.full_name,
        appointment_date: appointment?.appointment_date,
      })

      toast({
        title: "Success",
        description: `Appointment ${newStatus}`,
      })

      loadAppointments()
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Scheduled</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Completed</Badge>
      case "no-show":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">No Show</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "virtual" ? (
      <Video className="h-4 w-4 text-blue-600" />
    ) : (
      <MapPin className="h-4 w-4 text-green-600" />
    )
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getAppointmentStats = () => {
    const today = new Date().toISOString().split("T")[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]

    return {
      total: appointments.length,
      today: appointments.filter((a) => a.appointment_date === today).length,
      tomorrow: appointments.filter((a) => a.appointment_date === tomorrowStr).length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      virtual: appointments.filter((a) => a.type === "virtual").length,
      pending: appointments.filter((a) => a.status === "scheduled").length,
    }
  }

  const stats = getAppointmentStats()

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appointments</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage patient appointments and scheduling</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                Calendar
              </Button>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xl font-bold">{stats.today}</p>
                  <p className="text-xs text-gray-600">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarDays className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-xl font-bold">{stats.tomorrow}</p>
                  <p className="text-xs text-gray-600">Tomorrow</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-xl font-bold">{stats.confirmed}</p>
                  <p className="text-xs text-gray-600">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Video className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-xl font-bold">{stats.virtual}</p>
                  <p className="text-xs text-gray-600">Virtual</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-gray-600">Pending</p>
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
                  placeholder="Search by patient, reason, or provider..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="no-show">No Show</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="in-person">In-Person</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        {viewMode === "table" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Appointments ({filteredAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {appointment.patient_profile?.full_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {appointment.patient_profile?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{formatDateTime(appointment.appointment_date, appointment.appointment_time)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.duration} minutes</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(appointment.type)}
                          <span className="capitalize">{appointment.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.reason}</TableCell>
                      <TableCell>{appointment.provider_name || "—"}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedAppointment(appointment)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Appointment
                            </DropdownMenuItem>
                            {appointment.status === "scheduled" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(appointment.id, "confirmed")}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </DropdownMenuItem>
                            )}
                            {["scheduled", "confirmed"].includes(appointment.status) && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(appointment.id, "cancelled")}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            {appointment.status === "confirmed" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(appointment.id, "completed")}
                                className="text-purple-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {appointment.status === "confirmed" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(appointment.id, "no-show")}
                                className="text-orange-600"
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Mark No Show
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
        )}

        {/* Calendar View Placeholder */}
        {viewMode === "calendar" && (
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4" />
                  <p>Calendar view coming soon</p>
                  <p className="text-sm">Full calendar integration with drag-and-drop scheduling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
