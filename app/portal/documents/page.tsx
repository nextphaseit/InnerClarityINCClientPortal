"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PortalNavigation } from "@/components/portal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Download, Trash2, Plus, Loader2 } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

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
}

export default function DocumentsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const [uploadForm, setUploadForm] = useState({
    category: "",
    file: null as File | null,
  })

  const documentCategories = ["insurance", "id", "intake", "consent", "other"]

  const categoryLabels = {
    insurance: "Insurance",
    id: "Identification",
    intake: "Medical Records",
    consent: "Consent Forms",
    other: "Other",
  }

  useEffect(() => {
    checkAuthAndLoadDocuments()
  }, [])

  const checkAuthAndLoadDocuments = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      await loadDocuments(user.id)
    } catch (error) {
      console.error("Error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("client_id", userId)
        .order("uploaded_at", { ascending: false })

      if (error) {
        console.error("Error loading documents:", error)
        return
      }

      setDocuments(data || [])
    } catch (error) {
      console.error("Error loading documents:", error)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadForm.file || !uploadForm.category || !user) return

    setUploading(true)
    setMessage("")

    try {
      // Generate unique filename
      const fileExt = uploadForm.file.name.split(".").pop()
      const fileName = `uploads/${user.id}/${Date.now()}.${fileExt}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, uploadForm.file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(fileName)

      // Save metadata to database
      const { data, error: dbError } = await supabase
        .from("documents")
        .insert({
          client_id: user.id,
          name: fileName,
          original_name: uploadForm.file.name,
          category: uploadForm.category,
          file_size: uploadForm.file.size,
          mime_type: uploadForm.file.type,
          file_url: publicUrl,
          status: "uploaded",
        })
        .select()

      if (dbError) {
        throw dbError
      }

      setMessage("Document uploaded successfully!")
      setShowUploadForm(false)
      setUploadForm({ category: "", file: null })

      // Reload documents
      await loadDocuments(user.id)
    } catch (error) {
      console.error("Error uploading file:", error)
      setMessage("Error uploading file. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (document: Document) => {
    try {
      if (document.file_url) {
        // Create a temporary link and click it to download
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

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const document = documents.find((d) => d.id === documentId)
      if (!document) return

      // Delete from storage
      if (document.name) {
        await supabase.storage.from("documents").remove([document.name])
      }

      // Delete from database
      const { error } = await supabase.from("documents").delete().eq("id", documentId)

      if (error) {
        throw error
      }

      setMessage("Document deleted successfully!")

      // Reload documents
      if (user) {
        await loadDocuments(user.id)
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      setMessage("Error deleting document. Please try again.")
    }
  }

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "uploaded":
        return <Badge className="bg-blue-100 text-blue-800">Uploaded</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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

  const groupedDocuments = documents.reduce(
    (acc, doc) => {
      const categoryLabel = categoryLabels[doc.category as keyof typeof categoryLabels] || doc.category
      if (!acc[categoryLabel]) {
        acc[categoryLabel] = []
      }
      acc[categoryLabel].push(doc)
      return acc
    },
    {} as Record<string, Document[]>,
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PortalNavigation />

      <div className="lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Documents</h1>
              <p className="text-slate-600">Upload and manage your important documents</p>
            </div>
            <Button onClick={() => setShowUploadForm(!showUploadForm)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("Error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Upload Form */}
          {showUploadForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Upload New Document</CardTitle>
                <CardDescription>Select a file and category to upload</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="category">Document Category *</Label>
                    <select
                      id="category"
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a category</option>
                      {documentCategories.map((category) => (
                        <option key={category} value={category}>
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="file">Select File *</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)</p>
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit" disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700">
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Documents by Category */}
          {Object.keys(groupedDocuments).length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                <p className="text-gray-500 mb-4">Upload your first document to get started</p>
                <Button onClick={() => setShowUploadForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedDocuments).map(([category, categoryDocs]) => (
                <div key={category}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryDocs.map((document) => (
                      <Card key={document.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <FileText className="h-8 w-8 text-teal-600 flex-shrink-0" />
                            {getStatusBadge(document.status)}
                          </div>

                          <h3 className="font-medium text-gray-900 mb-1 truncate" title={document.original_name}>
                            {document.original_name}
                          </h3>

                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Size: {formatFileSize(document.file_size)}</p>
                            <p>Uploaded: {formatDate(document.uploaded_at)}</p>
                          </div>

                          <div className="flex space-x-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(document)}
                              className="flex-1"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(document.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Guidelines */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Document Upload Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Required Documents</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Insurance card (front and back)</li>
                    <li>• Photo identification (driver's license, passport)</li>
                    <li>• Previous medical records (if applicable)</li>
                    <li>• Consent forms</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">File Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Maximum file size: 10MB</li>
                    <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
                    <li>• Ensure documents are clear and readable</li>
                    <li>• Remove any sensitive information not required</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
