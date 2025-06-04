"use client"

// Mark as dynamic to prevent static rendering issues
export const dynamic = "force-dynamic"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { Users, Search, Plus, Eye, MessageSquare, Calendar, MoreHorizontal, Shield } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AdminClientsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/auth/signin")
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-clarity-blue-500"></div>
      </div>
    )
  }

  // Mock clients data
  const clients = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 123-4567",
      status: "active",
      lastAppointment: "2024-01-10",
      nextAppointment: "2024-01-15",
      provider: "Dr.Sarah Johnson",
    },
    {
      id: "2",
      name: "Jane Doe",
      email: "jane.doe@email.com",
      phone: "(555) 234-5678",
      status: "active",
      lastAppointment: "2024-01-08",
      nextAppointment: "2024-01-22",
      provider: "Dr. Michael Chen",
    },
    {
      id: "3",
      name: "Robert Wilson",
      email: "robert.wilson@email.com",
      phone: "(555) 345-6789",
      status: "inactive",
      lastAppointment: "2023-12-15",
      nextAppointment: null,
      provider: "Dr. Sarah Johnson",
    },
  ]

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClient),
      })

      if (response.ok) {
        // Show success toast (you can implement toast later)
        console.log("Client created successfully")
        setNewClient({ name: "", email: "", phone: "", notes: "" })
        setIsAddClientModalOpen(false)
        // Refresh the clients list here if needed
      } else {
        console.error("Failed to create client")
      }
    } catch (error) {
      console.error("Error creating client:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Manage client information and track their progress.</p>
          </div>
          <Button onClick={() => setIsAddClientModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Clients ({filteredClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt={client.name} />
                      <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{client.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{client.email}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{client.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Provider: {client.provider}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last: {client.lastAppointment}</p>
                      {client.nextAppointment && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Next: {client.nextAppointment}</p>
                      )}
                    </div>

                    <Badge className={getStatusColor(client.status)}>{client.status}</Badge>

                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Edit Client</DropdownMenuItem>
                          <DropdownMenuItem>View History</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Appointment</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">Client Data Protection</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All client information is protected under HIPAA regulations. Access is logged and monitored for
                  compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Client Modal */}
        {isAddClientModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Add New Client</h2>
              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    required
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="client@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <Input
                    required
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddClientModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Client"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
