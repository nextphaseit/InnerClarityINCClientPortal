"use client"

import type React from "react"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  category: "medical-records" | "insurance" | "forms" | "other"
  status: "uploaded" | "processing" | "approved" | "rejected"
  url?: string
}

export default function DocumentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    )
  }

  // Handle unauthenticated state
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your documents.</p>
          <Button onClick={() => router.push('/portal/auth/signin')} className="bg-teal-600 hover:bg-teal-700">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (session?.user) {
      loadDocuments()
    }
  }, [session])

  const loadDocuments = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      setError("")

      const { data: documentsData, error: documentsError } = await supabase
        .from("documents")
        .select("*")
        .eq("patient_id", session.user.id)
        .order("created_at", { ascending: false })

      if (documentsError) {
        console.error("Error loading documents:", documentsError)
        // Fallback to mock data for demo
        loadMockDocuments()
        return
      }

      if (documentsData && documentsData.length > 0) {
        // Transform the data to match our interface
        const formattedDocuments = documentsData.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type || "application/pdf",
          size: doc.size || 0,
          uploadDate: doc.created_at,
          category: doc.category || "other",
          status: doc.status || "uploaded",
          url: doc.url
        }))
        
        setDocuments(formattedDocuments)
      } else {
        // No documents found, use mock data
        loadMockDocuments()
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      setError("Failed to load documents")
      loadMockDocuments()
    } finally {
      setLoading(false)
    }
  }

  const loadMockDocuments = () => {
    const mockDocuments: Document[] = [
      {
        id: "doc-1",
        name: "Insurance Card - Front.pdf",
        type: "application/pdf",
        size: 245760,
        uploadDate: "2024-01-15T10:30:00Z",
        category: "insurance",
        status: "approved"
      },
      {
        id: "doc-2",
        name: "Medical History Form.pdf",
        type: "application/pdf", 
        size: 512000,
        uploadDate: "2024-01-10T14:20:00Z",
        category: "forms",
        status: "approved"
      },
      {
        id: "doc-3",
        name: "Lab Results - Blood Work.pdf",
        type: "application/pdf",
        size: 1024000,
        uploadDate: "2024-01-08T09:15:00Z",
        category: "medical-records",
        status: "processing"
      }
    ]

    setDocuments(mockDocuments)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !session?.user?.id) return

    setUploading(true)
    setError("")
    setSuccess("")

    try {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB")
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error("File type not supported. Please upload PDF, Word, or image files.")
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

      console.log("🔄 Uploading file:", fileName)

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert:\
