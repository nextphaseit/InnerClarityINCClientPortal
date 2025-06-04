"use client"

// Mark as dynamic to prevent static rendering issues
export const dynamic = "force-dynamic"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { FileText, Search, Eye, Download, Filter, Shield, Folder } from "lucide-react"

export default function AdminFilesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

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

  // Mock files data
  const files = [
    {
      id: "1",
      name: "John Smith - Insurance Card.pdf",
      client: "John Smith",
      type: "insurance",
      size: "2.4 MB",
      uploadedAt: "2024-01-10",
      status: "verified",
    },
    {
      id: "2",
      name: "Jane Doe - Intake Form.pdf",
      client: "Jane Doe",
      type: "intake",
      size: "3.2 MB",
      uploadedAt: "2024-01-08",
      status: "processed",
    },
    {
      id: "3",
      name: "Robert Wilson - Medical History.pdf",
      client: "Robert Wilson",
      type: "medical",
      size: "1.8 MB",
      uploadedAt: "2024-01-05",
      status: "pending",
    },
    {
      id: "4",
      name: "Lisa Anderson - Assessment Results.pdf",
      client: "Lisa Anderson",
      type: "assessment",
      size: "4.1 MB",
      uploadedAt: "2024-01-03",
      status: "reviewed",
    },
  ]

  const categories = [
    { id: "all", name: "All Files", count: files.length },
    { id: "insurance", name: "Insurance", count: files.filter((f) => f.type === "insurance").length },
    { id: "intake", name: "Intake Forms", count: files.filter((f) => f.type === "intake").length },
    { id: "medical", name: "Medical Records", count: files.filter((f) => f.type === "medical").length },
    { id: "assessment", name: "Assessments", count: files.filter((f) => f.type === "assessment").length },
  ]

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || file.type === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800"
      case "processed":
        return "bg-blue-100 text-blue-800"
      case "reviewed":
        return "bg-purple-100 text-purple-800"
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">File Viewer</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Review and manage client documents and files.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Folder className="mr-2 h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedCategory === category.id
                          ? "bg-clarity-blue-50 dark:bg-clarity-blue-950/20 border-r-2 border-clarity-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Files List */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search files by name or client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Files Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Files ({filteredFiles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredFiles.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center space-x-4">
                          {getTypeIcon(file.type)}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{file.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Client: {file.client}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {file.size} • Uploaded {file.uploadedAt}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(file.status)}>{file.status}</Badge>

                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files found</h3>
                    <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">Document Security</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All file access is logged and monitored. Documents are encrypted and stored securely in compliance
                  with HIPAA regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
