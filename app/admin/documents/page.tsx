"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { FileText, User, Loader2, Download, CheckCircle, X } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { StatusBadge } from "@/components/status-badge"

export const dynamic = "force-dynamic"

interface Document {
  id: string
  client_id: string
  name: string
  original_name: string
  category: string
  file_size: number
  mime_type: string
  file_url?: string
  status: "uploaded" | "processing" | "approved" | "rejected"
  uploaded_at: string
  patient_profile?: {
    full_name: string
    email: string
  }
}

export default function AdminDocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { user, loading: authLoading, error } = useAuth()

  const categoryLabels = {
    insurance: "Insurance",
    id: "Identification",
    intake: "Medical Records",
    consent: "Consent Forms",
    other: "Other",
  }

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

      loadDocuments()
    }
  }, [user, authLoading, router])

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          patient_profile:profiles!documents_client_id_fkey(
            full_name,
            email
          )
        `)
        .order("uploaded_at", { ascending: false })

      if (error) {
        console.error("Error loading documents:", error)
        return
      }

      setDocuments(data || [])
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateDocumentStatus = async (documentId: string, newStatus: "approved" | "rejected") => {
    setUpdating(documentId)

    try {
      const { error } = await supabase
        .from("documents")
        .update({
          status: newStatus,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", documentId)

      if (error) {
        throw error
      }

      // Reload data
      await loadDocuments()
    } catch (error) {
      console.error("Error updating document status:", error)
    } finally {
      setUpdating(null)
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      if (document.file_url) {
        const link = document.createElement("a")
        link.href = document.file_url
        link.download = document.original_name
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

  const filteredDocuments = documents.filter((doc) => {
    if (categoryFilter !== "all" && doc.category !== categoryFilter) return false
    if (statusFilter !== "all" && doc.status !== statusFilter) return false
    return true
  })

  const uniqueCategories = [...new Set(documents.map((d) => d.category))]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patient Documents</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Review and manage patient document uploads.</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category as keyof typeof categoryLabels] || category}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="uploaded">Uploaded</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {documents.filter((d) => d.status === "uploaded").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {documents.filter((d) => d.status === "approved").length}
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
                    {new Set(documents.map((d) => d.client_id)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No documents found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{document.original_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Patient: {document.patient_profile?.full_name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{document.patient_profile?.email}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span>
                            Category:{" "}
                            {categoryLabels[document.category as keyof typeof categoryLabels] || document.category}
                          </span>
                          <span>Size: {formatFileSize(document.file_size)}</span>
                          <span>Uploaded: {formatDate(document.uploaded_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <StatusBadge status={document.status} type="document" />
                      <Button size="sm" variant="outline" onClick={() => handleDownload(document)}>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      {document.status === "uploaded" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => updateDocumentStatus(document.id, "approved")}
                            disabled={updating === document.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updating === document.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDocumentStatus(document.id, "rejected")}
                            disabled={updating === document.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            {updating === document.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
