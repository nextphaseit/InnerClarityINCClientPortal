"use client"

import { useState } from "react"
import { PortalNavigation } from "@/components/portal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database, Play } from "lucide-react"

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState<"idle" | "running" | "complete" | "error">("idle")
  const [message, setMessage] = useState("")

  const runSetup = async () => {
    setSetupStatus("running")
    setMessage("Setting up database tables...")

    try {
      // In a real app, you would call your setup API endpoint here
      // For now, we'll simulate the setup process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setSetupStatus("complete")
      setMessage("Database setup completed successfully! All tables have been created.")
    } catch (error) {
      setSetupStatus("error")
      setMessage("Setup failed. Please check your database connection and try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PortalNavigation />

      <div className="lg:ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Database Setup</h1>
            <p className="text-slate-600">Initialize the required database tables for the portal</p>
          </div>

          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
                <Database className="h-5 w-5 mr-2" />
                Database Initialization
              </CardTitle>
              <CardDescription>
                This will create all necessary tables for the patient portal including profiles, appointments, messages,
                and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {setupStatus === "idle" && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Click the button below to set up the database tables. This process will create:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Profiles table for user information</li>
                      <li>Appointments table for scheduling</li>
                      <li>Messages table for secure communication</li>
                      <li>Invoices table for billing</li>
                      <li>Documents table for file management</li>
                      <li>Form responses table for intake forms</li>
                      <li>Health logs table for tracking</li>
                      <li>Audit logs table for security</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {setupStatus === "running" && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Setting up database tables... Please wait.
                  </AlertDescription>
                </Alert>
              )}

              {setupStatus === "complete" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{message}</AlertDescription>
                </Alert>
              )}

              {setupStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{message}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={runSetup}
                  disabled={setupStatus === "running" || setupStatus === "complete"}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                >
                  {setupStatus === "running" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Setting up...
                    </>
                  ) : setupStatus === "complete" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Setup Complete
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Database Setup
                    </>
                  )}
                </Button>
              </div>

              <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                <strong>Note:</strong> In a production environment, you would run the SQL scripts in the{" "}
                <code>/scripts</code> folder directly in your Supabase dashboard or using the Supabase CLI. This setup
                page is for demonstration purposes.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
