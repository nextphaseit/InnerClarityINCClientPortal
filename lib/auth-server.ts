import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export async function requireAdminAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    console.log("❌ No session found, redirecting to signin")
    redirect("/auth/signin?error=authentication_required")
  }

  if (session.user.role !== "admin") {
    console.log("❌ User is not admin, redirecting to unauthorized")
    redirect("/unauthorized?reason=admin_required")
  }

  if (session.provider !== "azure-ad") {
    console.log("❌ User not authenticated via Microsoft, redirecting to signin")
    redirect("/auth/signin?error=microsoft_required")
  }

  // Verify authorized email domain
  const email = session.user.email?.toLowerCase() || ""
  const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
  const domain = email.split("@")[1]

  if (!authorizedDomains.includes(domain)) {
    console.log(`❌ Unauthorized domain: ${domain}`)
    redirect("/unauthorized?reason=unauthorized_domain")
  }

  console.log(`✅ Admin auth verified for ${session.user.email}`)
  return session
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "admin" || session.provider !== "azure-ad") {
    return null
  }

  return session
}
