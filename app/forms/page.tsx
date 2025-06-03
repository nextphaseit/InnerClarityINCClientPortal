"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { FileText, Clock, CheckCircle, AlertCircle, Shield, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function FormsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

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

  // Mock forms data
  const forms = [
    {
      id: "1",
      title: "Patient Health Questionnaire (PHQ-9)",
      description: "Depression screening questionnaire",
      status: "pending",
      dueDate: "2024-01-25",
      estimatedTime: "5-10 minutes",
      required: true,
    },
    {
      id: "2",
      title: "Generalized Anxiety Disorder Scale (GAD-7)",
      description: "Anxiety assessment form",
      status: "completed",
      completedDate: "2024-01-10",
      estimatedTime: "5 minutes",
      required: true,
    },
    {
      id: "3",
      title: "Treatment Goals Assessment",
      description: "Define your therapy goals and expectations",
      status: "completed",
      completedDate: "2024-01-08",
      estimatedTime: "15-20 minutes",
      required: false,
    },
    {
      id: "4",
      title: "Session Feedback Form",
      description: "Provide feedback on your recent therapy session",
      status: "available",
      estimatedTime: "3-5 minutes",
      required: false,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "available":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      case "available":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const pendingForms = forms.filter((form) => form.status === "pending")
  const completedForms = forms.filter((form) => form.status === "completed")
  const availableForms = forms.filter((form) => form.status === "available")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forms & Assessments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Complete intake forms and assessments to help your provider deliver better care.
          </p>
        </div>

        {/* Pending Forms */}
        {pendingForms.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                Action Required ({pendingForms.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingForms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{form.title}</h4>
                        {form.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{form.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>Due: {formatDate(form.dueDate!)}</span>
                        <span>Est. time: {form.estimatedTime}</span>
                      </div>
                    </div>
                    <Button>
                      Complete Form
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Forms */}
          <Card>
            <CardHeader>
              <CardTitle>Available Forms</CardTitle>
            </CardHeader>
            <CardContent>
              {availableForms.length > 0 ? (
                <div className="space-y-4">
                  {availableForms.map((form) => (
                    <div
                      key={form.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{form.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{form.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Est. time: {form.estimatedTime}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(form.status)}>
                          {getStatusIcon(form.status)}
                          <span className="ml-1">{form.status}</span>
                        </Badge>
                        <Button variant="outline" size="sm">
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No additional forms available at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Forms */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Forms</CardTitle>
            </CardHeader>
            <CardContent>
              {completedForms.length > 0 ? (
                <div className="space-y-4">
                  {completedForms.map((form) => (
                    <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{form.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{form.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Completed: {formatDate(form.completedDate!)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(form.status)}>
                          {getStatusIcon(form.status)}
                          <span className="ml-1">{form.status}</span>
                        </Badge>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No completed forms yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">Form Privacy & Security</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All form responses are encrypted and stored securely. Your information is protected under HIPAA
                  regulations and only accessible to your healthcare team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
