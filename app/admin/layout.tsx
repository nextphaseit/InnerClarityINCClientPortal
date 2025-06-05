import type React from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { SessionProvider } from "next-auth/react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect to login if no session
  if (!session) {
    redirect("/admin/login")
  }

  // Check if user has admin access
  const userEmail = session.user?.email
  const authorizedDomains = ["@innerclarity.org", "@innerclarityinc.com", "@nextphaseit.org"]

  const hasAdminAccess = userEmail && authorizedDomains.some((domain) => userEmail.endsWith(domain))

  if (!hasAdminAccess) {
    redirect("/unauthorized")
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </SessionProvider>
  )
}
