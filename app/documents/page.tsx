"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { Upload, FileText, Download, Eye, Trash2, Shield, Plus } from "lucide-react"

export default function DocumentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
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

  // Mock documents data
  const documents = [
    {
      id: "1",
      name: "Insurance Card - Front.pdf",
      type: "insurance",
      size: "2.4 MB",
      uploadedAt: "2024-01-10",
      status: "verified",
    },
    {
      id: "2",
      name: "Driver License.pdf",
      type: "id",
      size: "1.8 MB",
      uploadedAt: "2024-01-10",
      status: "verified",
    },
    {
      id: "3",
      name: "Intake Form - Completed.pdf",
      type: "intake",
      size: "3.2 MB",
      uploadedAt: "2024-01-08",
      status: "processed",
    },
    {
      id: "4",
      name: "Medical History.pdf",
      type: "other",
      size: "1.5 MB",
      uploadedAt: "2024-01-05",
      status: "pending",
    },
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log("Files dropped:", e.dataTransfer.files)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "processed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    return <FileText className="h-8 w-8 text-clarity-blue-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Upload and manage your healthcare documents securely.</p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-clarity-blue-500 bg-clarity-blue-50 dark:bg-clarity-blue-950/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Drop files here or click to upload
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
              <div className="flex justify-center space-x-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Choose Files
                </Button>
                <Input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-4">
                      {getTypeIcon(document.type)}
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{document.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {document.size} • Uploaded {document.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(document.status)}>{document.status}</Badge>

                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents uploaded yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Upload your first document to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">Document Security</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All documents are encrypted at rest and in transit. Access is logged and monitored for HIPAA
                  compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
