import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export async function getRequiredServerSession() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin")
  }

  if (session.user.role !== "admin") {
    redirect("/unauthorized")
  }

  return session
}

export async function getOptionalServerSession() {
  return await getServerSession(authOptions)
}
