"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { FileText, User, Loader2, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

interface FormResponse {
  id: string
  client_id: string
  form_type: string
  form_title: string
  responses: Record<string, any>
  status: "draft" | "submitted" | "reviewed"
  submitted_at: string
  patient_profile?: {
    full_name: string
    email: string
  }
}

export default function AdminFormsPage() {
  const router = useRouter()
  const [formResponses, setFormResponses] = useState<FormResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { user, loading: authLoading, error } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/signin?tab=admin")
        return
      }

      if (user.role !== "admin") {
        router.push("/unauthorized?reason=admin_required")
        return
      }

      loadFormResponses()
    }
  }, [user, authLoading, router])

  const loadFormResponses = async () => {
    try {
      const { data, error } = await supabase
        .from("form_responses")
        .select(`
          *,
          patient_profile:profiles!form_responses_client_id_fkey(
            full_name,
            email
          )
        `)
        .order("submitted_at", { ascending: false })

      if (error) {
        console.error("Error loading form responses:", error)
        return
      }

      setFormResponses(data || [])
    } catch (error) {
      console.error("Error loading form responses:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsReviewed = async (responseId: string) => {
    try {
      const { error } = await supabase
        .from("form_responses")
        .update({
          status: "reviewed",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", responseId)

      if (error) {
        throw error
      }

      // Reload data
      await loadFormResponses()
    } catch (error) {
      console.error("Error marking as reviewed:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderResponseDetails = (responses: Record<string, any>) => {
    return (
      <div className="space-y-4">
        {Object.entries(responses).map(([key, value]) => (
          <div key={key} className="border-b pb-2">
            <p className="font-medium text-gray-900 capitalize">{key.replace(/_/g, " ")}:</p>
            <p className="text-gray-700 mt-1">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</p>
          </div>
        ))}
      </div>
    )
  }

  const filteredResponses = formResponses.filter((response) => {
    if (typeFilter !== "all" && response.form_type !== typeFilter) return false
    if (statusFilter !== "all" && response.status !== statusFilter) return false
    return true
  })

  const uniqueFormTypes = [...new Set(formResponses.map((r) => r.form_type))]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-clarity-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have permission to view this page.</p>
          <Button onClick={() => router.push("/auth/signin?tab=admin")}>Sign In as Admin</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Form Responses</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Review patient form submissions.</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clarity-blue-500 focus:border-transparent"
            >
              <option value="all">All Form Types</option>
              {uniqueFormTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-clarity-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-clarity-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Forms</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formResponses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formResponses.filter((r) => r.status === "submitted").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reviewed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formResponses.filter((r) => r.status === "reviewed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Patients</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(formResponses.map((r) => r.client_id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Responses List */}
        <Card>
          <CardHeader>
            <CardTitle>Form Responses ({filteredResponses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResponses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No form responses found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResponses.map((response) => (
                  <div
                    key={response.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-clarity-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{response.form_title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Patient: {response.patient_profile?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{response.patient_profile?.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Submitted: {formatDate(response.submitted_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <StatusBadge status={response.status} type="form" />
                      <Button size="sm" variant="outline" onClick={() => setSelectedResponse(response)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {response.status === "submitted" && (
                        <Button
                          size="sm"
                          onClick={() => markAsReviewed(response.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Reviewed
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Details Modal */}
        {selectedResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedResponse.form_title}</h2>
                <Button variant="outline" onClick={() => setSelectedResponse(null)}>
                  Close
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Patient:</strong> {selectedResponse.patient_profile?.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedResponse.patient_profile?.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Submitted:</strong> {formatDate(selectedResponse.submitted_at)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> <StatusBadge status={selectedResponse.status} type="form" />
                </p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Form Responses:</h3>
                {renderResponseDetails(selectedResponse.responses)}
              </div>

              {selectedResponse.status === "submitted" && (
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => {
                      markAsReviewed(selectedResponse.id)
                      setSelectedResponse(null)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark as Reviewed
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
