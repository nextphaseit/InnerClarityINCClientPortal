"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { CalendarDays, CreditCard, MessageSquare, LogOut } from "lucide-react"

export default function PatientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState<string>("")

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user) {
          console.error("Authentication error:", error)
          router.push("/auth/login")
          return
        }

        setUser(data.user)
        setFullName(data.user.user_metadata?.full_name || "Patient")
        setLoading(false)
      } catch (error) {
        console.error("Session check error:", error)
        router.push("/auth/login")
      }
    }

    checkSession()
  }, [router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Welcome back, {fullName}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Upcoming Appointments */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 border-b border-gray-200 bg-teal-50">
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 text-teal-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
              </div>
            </div>
            <div className="px-5 py-6">
              <div className="space-y-4">
                <div className="border-l-4 border-teal-500 pl-4 py-2">
                  <p className="text-sm font-medium text-gray-900">Therapy Session</p>
                  <p className="text-sm text-gray-600">June 10, 2025 • 2:00 PM</p>
                  <p className="text-xs text-gray-500 mt-1">With Dr. Sarah Johnson</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <p className="text-sm font-medium text-gray-900">Follow-up Consultation</p>
                  <p className="text-sm text-gray-600">June 17, 2025 • 3:30 PM</p>
                  <p className="text-xs text-gray-500 mt-1">With Dr. Michael Chen</p>
                </div>
              </div>
              <div className="mt-6">
                <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View all appointments →
                </button>
              </div>
            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 border-b border-gray-200 bg-teal-50">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-teal-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Billing Summary</h3>
              </div>
            </div>
            <div className="px-5 py-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Current Balance</span>
                <span className="text-lg font-semibold text-gray-900">$150.00</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Therapy Session</p>
                    <p className="text-xs text-gray-500">May 27, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">$150.00</p>
                    <p className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Pending</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Initial Consultation</p>
                    <p className="text-xs text-gray-500">May 13, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">$200.00</p>
                    <p className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Paid</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  View billing history →
                </button>
              </div>
            </div>
          </div>

          {/* Messages from Staff */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 border-b border-gray-200 bg-teal-50">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-teal-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Messages from Staff</h3>
              </div>
            </div>
            <div className="px-5 py-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-sm font-medium text-gray-900">Appointment Confirmation</p>
                  <p className="text-xs text-gray-500">From: Dr. Sarah Johnson • 2 days ago</p>
                  <p className="text-sm text-gray-600 mt-1">Your appointment for June 10 has been confirmed.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="text-sm font-medium text-gray-900">Therapy Resources</p>
                  <p className="text-xs text-gray-500">From: Admin Team • 1 week ago</p>
                  <p className="text-sm text-gray-600 mt-1">We've uploaded new resources to your portal.</p>
                </div>
              </div>
              <div className="mt-6">
                <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">View all messages →</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
