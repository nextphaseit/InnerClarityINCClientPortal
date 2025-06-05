"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { isSupabaseConfigured } from "@/lib/supabase"
import Link from "next/link"
import {
  AlertCircle,
  Calendar,
  FileText,
  MessageSquare,
  CreditCard,
  Activity,
  FolderOpen,
  ChevronRight,
} from "lucide-react"

export default function PatientDashboard() {
  const { user, loading } = usePatientAuth()
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setIsDemo(!isSupabaseConfigured())
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Patient Dashboard</h1>
          <p className="text-slate-600">Welcome back, {user?.user_metadata?.full_name || "Patient"}</p>
        </div>

        {isDemo && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You are viewing the demo version of the patient portal. Some features may be limited.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-slate-800">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="font-medium">Check-up with Dr. Smith</div>
                  <div className="text-sm text-slate-500">Tomorrow, 10:00 AM</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="font-medium">Follow-up Consultation</div>
                  <div className="text-sm text-slate-500">June 15, 2:30 PM</div>
                </div>
              </div>
              <Button asChild variant="ghost" className="w-full mt-4 text-blue-600">
                <Link href="/portal/appointments">
                  View All Appointments
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-slate-800">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                Recent Messages
              </CardTitle>
              <CardDescription>Communications from your care team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="font-medium">Lab Results Available</div>
                  <div className="text-sm text-slate-500">Dr. Johnson • 2 days ago</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="font-medium">Appointment Confirmation</div>
                  <div className="text-sm text-slate-500">Admin • 1 week ago</div>
                </div>
              </div>
              <Button asChild variant="ghost" className="w-full mt-4 text-blue-600">
                <Link href="/portal/messages">
                  View All Messages
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Forms */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-slate-800">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Forms to Complete
              </CardTitle>
              <CardDescription>Required paperwork and questionnaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="font-medium">Health History Update</div>
                  <div className="text-sm text-slate-500">Due before next appointment</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="font-medium">Insurance Information</div>
                  <div className="text-sm text-slate-500">Complete when convenient</div>
                </div>
              </div>
              <Button asChild variant="ghost" className="w-full mt-4 text-blue-600">
                <Link href="/portal/forms">
                  View All Forms
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Billing */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-slate-800">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Billing Summary
              </CardTitle>
              <CardDescription>Recent invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="font-medium">Invoice #1234</div>
                  <div className="text-sm text-slate-500">$75.00 • Paid on May 15</div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="font-medium">Invoice #1235</div>
                  <div className="text-sm text-slate-500">$150.00 • Due June 30</div>
                </div>
              </div>
              <Button asChild variant="ghost" className="w-full mt-4 text-blue-600">
                <Link href="/portal/billing">
                  View Billing History
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Health Log */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-slate-800">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Health Tracking
              </CardTitle>
              <CardDescription>Monitor your health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="font-medium">Blood Pressure</div>
                  <div className="text-sm text-slate-500">120/80 • Recorded yesterday</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="font-medium">Weight</div>
                  <div className="text-sm text-slate-500">165 lbs • Recorded 3 days ago</div>
                </div>
              </div>
              <Button asChild variant="ghost" className="w-full mt-4 text-blue-600">
                <Link href="/portal/health-log">
                  View Health Log
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-slate-800">
                <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
                Recent Documents
              </CardTitle>
              <CardDescription>Medical records and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="font-medium">Lab Results</div>
                  <div className="text-sm text-slate-500">PDF • Uploaded 1 week ago</div>
                </div>
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="font-medium">Prescription</div>
                  <div className="text-sm text-slate-500">PDF • Uploaded 2 weeks ago</div>
                </div>
              </div>
              <Button asChild variant="ghost" className="w-full mt-4 text-blue-600">
                <Link href="/portal/documents">
                  View All Documents
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
