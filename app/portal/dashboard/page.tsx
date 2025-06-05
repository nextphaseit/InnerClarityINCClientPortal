import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AuthButtonServer } from "@/components/auth-button-server"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Protected dashboard page",
}

async function getSession() {
  const supabase = createServerComponentClient({ cookies })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export default async function Dashboard() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  const supabase = createServerComponentClient({ cookies })
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  const user = session.user

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>Welcome, {profile?.full_name || user?.email}! You are signed in.</p>
      </div>

      {user?.id === "demo-user" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> You're using the demo version. Supabase is not configured.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <AuthButtonServer />
      </div>
    </div>
  )
}
