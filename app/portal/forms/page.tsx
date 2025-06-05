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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, Send, Loader2 } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface FormResponse {
  id: string
  client_id: string
  form_type: string
  form_title: string
  responses: Record<string, any>
  status: "draft" | "submitted" | "reviewed"
  submitted_at: string
}

interface FormTemplate {
  id: string
  title: string
  description: string
  type: string
  required: boolean
  category: string
}

export default function FormsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [formResponses, setFormResponses] = useState<FormResponse[]>([])
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  // Available form templates
  const formTemplates: FormTemplate[] = [
    {
      id: "hipaa-consent",
      title: "HIPAA Privacy Notice Acknowledgment",
      description: "Acknowledge receipt and understanding of our HIPAA privacy practices",
      type: "hipaa-consent",
      required: true,
      category: "Legal",
    },
    {
      id: "therapy-goals",
      title: "Therapy Goals Assessment",
      description: "Help us understand your therapy goals and expectations",
      type: "therapy-goals",
      required: false,
      category: "Assessment",
    },
    {
      id: "intake-form",
      title: "Patient Intake Form",
      description: "Comprehensive intake form for new patients",
      type: "intake-form",
      required: true,
      category: "Medical",
    },
    {
      id: "emergency-contact",
      title: "Emergency Contact Update",
      description: "Update your emergency contact information",
      type: "emergency-contact",
      required: false,
      category: "Administrative",
    },
  ]

  useEffect(() => {
    checkAuthAndLoadForms()
  }, [])

  const checkAuthAndLoadForms = async () => {
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
      await loadFormResponses(user.id)
    } catch (error) {
      console.error("Error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const loadFormResponses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("form_responses")
        .select("*")
        .eq("client_id", userId)
        .order("submitted_at", { ascending: false })

      if (error) {
        console.error("Error loading form responses:", error)
        return
      }

      setFormResponses(data || [])
    } catch (error) {
      console.error("Error loading form responses:", error)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForm || !user) return

    setSubmitting(true)
    setMessage("")

    try {
      const { data, error } = await supabase
        .from("form_responses")
        .insert({
          client_id: user.id,
          form_type: selectedForm.type,
          form_title: selectedForm.title,
          responses: formData,
          status: "submitted",
        })
        .select()

      if (error) {
        throw error
      }

      setMessage("Form submitted successfully!")
      setSelectedForm(null)
      setFormData({})

      // Reload form responses
      await loadFormResponses(user.id)
    } catch (error) {
      console.error("Error submitting form:", error)
      setMessage("Error submitting form. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const isFormCompleted = (formType: string) => {
    return formResponses.some((response) => response.form_type === formType && response.status === "submitted")
  }

  const getStatusBadge = (completed: boolean) => {
    return completed ? (
      <Badge className="bg-green-100 text-green-800">Completed</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    )
  }

  const renderHIPAAForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">HIPAA Privacy Notice Acknowledgment</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 mb-4">
            This notice describes how medical information about you may be used and disclosed and how you can get access
            to this information. Please review it carefully.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Your Rights</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Right to request restrictions on uses and disclosures</li>
              <li>• Right to receive confidential communications</li>
              <li>• Right to inspect and copy your health information</li>
              <li>• Right to amend your health information</li>
              <li>• Right to receive an accounting of disclosures</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="hipaa_acknowledgment"
            checked={formData.hipaa_acknowledgment || false}
            onCheckedChange={(checked) => setFormData({ ...formData, hipaa_acknowledgment: checked })}
          />
          <Label htmlFor="hipaa_acknowledgment" className="text-sm leading-relaxed">
            I acknowledge that I have received and reviewed the HIPAA Privacy Notice and understand my rights regarding
            my protected health information.
          </Label>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="consent_treatment"
            checked={formData.consent_treatment || false}
            onCheckedChange={(checked) => setFormData({ ...formData, consent_treatment: checked })}
          />
          <Label htmlFor="consent_treatment" className="text-sm leading-relaxed">
            I consent to treatment and understand that no guarantee has been made regarding the outcome of treatment.
          </Label>
        </div>

        <div>
          <Label htmlFor="signature">Digital Signature (Full Name) *</Label>
          <Input
            id="signature"
            value={formData.signature || ""}
            onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
            placeholder="Type your full name as your digital signature"
            required
          />
        </div>

        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date || new Date().toISOString().split("T")[0]}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  )

  const renderTherapyGoalsForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Therapy Goals Assessment</h3>
        <p className="text-gray-700 mb-6">
          Help us understand what you hope to achieve through therapy so we can better support your journey.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="primary_concerns">What are your primary concerns or challenges? *</Label>
          <Textarea
            id="primary_concerns"
            value={formData.primary_concerns || ""}
            onChange={(e) => setFormData({ ...formData, primary_concerns: e.target.value })}
            placeholder="Describe the main issues you'd like to address in therapy"
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="therapy_goals">What specific goals do you have for therapy? *</Label>
          <Textarea
            id="therapy_goals"
            value={formData.therapy_goals || ""}
            onChange={(e) => setFormData({ ...formData, therapy_goals: e.target.value })}
            placeholder="What would you like to accomplish or change?"
            rows={4}
            required
          />
        </div>

        <div>
          <Label htmlFor="previous_therapy">Have you been in therapy before?</Label>
          <Textarea
            id="previous_therapy"
            value={formData.previous_therapy || ""}
            onChange={(e) => setFormData({ ...formData, previous_therapy: e.target.value })}
            placeholder="If yes, please describe your previous therapy experience"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="support_system">Tell us about your support system</Label>
          <Textarea
            id="support_system"
            value={formData.support_system || ""}
            onChange={(e) => setFormData({ ...formData, support_system: e.target.value })}
            placeholder="Family, friends, or other support networks"
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  const renderFormContent = () => {
    if (!selectedForm) return null

    switch (selectedForm.type) {
      case "hipaa-consent":
        return renderHIPAAForm()
      case "therapy-goals":
        return renderTherapyGoalsForm()
      default:
        return (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Form content not available</p>
          </div>
        )
    }
  }

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Forms & Documents</h1>
            <p className="text-slate-600">Complete required forms and assessments</p>
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

          {selectedForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedForm.title}</CardTitle>
                    <CardDescription>{selectedForm.description}</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedForm(null)}>
                    Back to Forms
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit}>
                  {renderFormContent()}

                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => setSelectedForm(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Form
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formTemplates.map((form) => {
                const completed = isFormCompleted(form.type)
                return (
                  <Card key={form.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <FileText className="h-8 w-8 text-teal-600" />
                        <div className="flex items-center space-x-2">
                          {form.required && <Badge variant="outline">Required</Badge>}
                          {getStatusBadge(completed)}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{form.title}</CardTitle>
                      <CardDescription>{form.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Category: {form.category}</div>
                        {!completed ? (
                          <Button
                            size="sm"
                            onClick={() => setSelectedForm(form)}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            Complete
                          </Button>
                        ) : (
                          <div className="flex items-center text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
