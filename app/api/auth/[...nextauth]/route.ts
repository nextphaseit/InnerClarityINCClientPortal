import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Check if we're on the admin domain
function isAdminDomain(): boolean {
  const url = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
  return url.includes("admin.nextphaseit.org") || url.includes("admin")
}

// Validate required environment variables for Microsoft authentication (admin only)
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
  MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
}

// Only validate Microsoft env vars if we're on admin domain
if (isAdminDomain()) {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables for admin portal:", missingVars.join(", "))
    throw new Error(`Missing required environment variables for admin portal: ${missingVars.join(", ")}`)
  }

  console.log("✅ Microsoft authentication environment variables validated for admin portal")
}

export const authOptions: NextAuthOptions = {
  providers: isAdminDomain()
    ? [
        // Microsoft Entra ID Provider (Admin Portal Only)
        AzureADProvider({
          clientId: requiredEnvVars.MICROSOFT_CLIENT_ID!,
          clientSecret: requiredEnvVars.MICROSOFT_CLIENT_SECRET!,
          tenantId: requiredEnvVars.MICROSOFT_TENANT_ID!,
          authorization: {
            params: {
              scope: "openid email profile User.Read offline_access",
              prompt: "select_account",
            },
          },
          httpOptions: {
            timeout: 10000,
          },
        }),
      ]
    : [],

  pages: {
    signIn: "/admin/login",
    error: "/auth/error",
    signOut: "/auth/signout",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log(`🔑 Admin SignIn attempt - Provider: ${account?.provider}, User: ${user.email}`)

        if (!account || !user.email) {
          console.error("❌ Missing account or email in signIn callback")
          return false
        }

        // Only allow Microsoft login on admin domain
        if (!isAdminDomain()) {
          console.error("❌ Microsoft login attempted on non-admin domain")
          return false
        }

        // Restrict to Microsoft login only for admin
        if (account.provider !== "azure-ad") {
          console.error("❌ Admin login requires Microsoft authentication")
          return false
        }

        // Check if email domain is authorized for admin access
        const email = user.email.toLowerCase()
        const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]

        const domain = email.split("@")[1]

        if (!authorizedDomains.includes(domain)) {
          console.error(`❌ Unauthorized domain for admin access: ${domain}`)
          return false
        }

        console.log(`✅ Admin access authorized for domain: ${domain}`)
        return true
      } catch (error) {
        console.error("❌ SignIn callback error:", error)
        return false
      }
    },

    async jwt({ token, user, account, profile }) {
      try {
        if (account && user) {
          console.log(`👤 Processing admin login for: ${user.email}`)

          // Store OAuth tokens and admin role
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.expiresAt = account.expires_at
          token.provider = account.provider
          token.role = "admin"
          token.tenantId = requiredEnvVars.MICROSOFT_TENANT_ID

          console.log(`✅ Admin token created for ${user.email}`)
        }

        return token
      } catch (error) {
        console.error("❌ JWT callback error:", error)
        return null
      }
    },

    async session({ session, token }) {
      try {
        if (token && session.user) {
          // Attach admin information to session
          session.accessToken = token.accessToken as string
          session.refreshToken = token.refreshToken as string
          session.expiresAt = token.expiresAt as number
          session.provider = token.provider as string
          session.user.id = token.sub!
          session.user.role = "admin"
          session.user.tenantId = token.tenantId as string

          console.log(`📱 Admin session created for ${session.user.email}`)
        }

        return session
      } catch (error) {
        console.error("❌ Session callback error:", error)
        return session
      }
    },

    async redirect({ url, baseUrl }) {
      try {
        console.log(`🔄 Admin redirect - URL: ${url}, Base: ${baseUrl}`)

        // Handle relative URLs
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`
        }

        // Handle same origin URLs
        if (new URL(url).origin === baseUrl) {
          return url
        }

        // Default redirect to admin dashboard
        return `${baseUrl}/admin/dashboard`
      } catch (error) {
        console.error("❌ Redirect callback error:", error)
        return `${baseUrl}/admin/dashboard`
      }
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`✅ Admin signed in: ${user.email} via ${account?.provider} (New: ${isNewUser})`)
    },
    async signOut({ session, token }) {
      console.log(`👋 Admin signed out: ${session?.user?.email || "Unknown"}`)
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours for admin sessions
    updateAge: 60 * 60, // Update every hour
  },

  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },

  secret: requiredEnvVars.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",

  logger: {
    error(code, metadata) {
      console.error(`❌ NextAuth Admin Error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`⚠️ NextAuth Admin Warning [${code}]`)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log(`🐛 NextAuth Admin Debug [${code}]:`, metadata)
      }
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
