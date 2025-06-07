import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase, isSupabaseConfigured } from "./supabase"

export interface UserProfile {
  id: string
  full_name: string
  email: string
  role: "patient" | "admin" | "super_admin"
  avatar_url?: string
  created_at: string
  status: "active" | "inactive" | "suspended"
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google login, determine role based on email domain
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase() || ""
        const adminDomains = ["innerclarityinc.com", "nextphaseit.org"]
        const domain = email.split("@")[1]

        if (adminDomains.includes(domain)) {
          user.role = "admin"
        } else {
          user.role = "patient"
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.tenantId = user.tenantId
        token.tenantName = user.tenantName
        token.authProvider = account?.provider || "credentials"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string
        session.user.tenantName = token.tenantName as string
        session.user.authProvider = token.authProvider as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirects after login
      if (url.startsWith("/api/auth/signin") || url.startsWith("/auth/signin")) {
        return baseUrl
      }

      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      // Allow same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url
      }

      return baseUrl
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider} (${user.role})`)
      await logAuditEvent("user_signin", "auth", user.id, {
        provider: account?.provider,
        isNewUser,
      })
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  debug: process.env.NODE_ENV === "development",
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error || !profile) {
      return null
    }

    return profile
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth(requiredRole?: "admin" | "super_admin") {
  if (!isSupabaseConfigured()) {
    return null
  }

  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  if (!["admin", "super_admin"].includes(user.role)) {
    return null
  }

  if (requiredRole === "super_admin" && user.role !== "super_admin") {
    return null
  }

  return user
}

export async function logAuditEvent(action: string, resource: string, resourceId?: string, details?: any) {
  if (!isSupabaseConfigured()) {
    return
  }

  try {
    const user = await getCurrentUser()
    if (!user) return

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action,
      resource,
      resource_id: resourceId,
      details,
      ip_address: "",
      user_agent: "",
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error logging audit event:", error)
  }
}

// Helper function to get tenant-filtered data
export function getTenantFilteredData<T extends { tenantId?: string }>(data: T[], userTenantId?: string): T[] {
  if (!userTenantId) return data
  return data.filter((item) => item.tenantId === userTenantId)
}

// Helper function to check tenant access
export function checkTenantAccess(userTenantId?: string, resourceTenantId?: string): boolean {
  if (!userTenantId) return true
  return userTenantId === resourceTenantId
}
