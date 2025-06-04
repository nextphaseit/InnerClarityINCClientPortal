"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Redirect to the main portal page
  router.push("/portal")
  return null
}
