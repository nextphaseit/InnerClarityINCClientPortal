import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

// Validate required environment variables
const requiredEnvVars = {
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
  MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
}

// Authorized email domains for admin access
const AUTHORIZED_DOMAINS = ["@innerclarity.org", "@innerclarityinc.com", "@nextphaseit.org"]

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid email profile User.Read offline_access",
        },
      },
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/auth/signout",
  },

  callbacks: {
    async signIn({ account, profile, email }) {
      try {
        // Only allow Microsoft provider
        if (account?.provider !== "azure-ad") {
          console.log("❌ Sign-in rejected: Invalid provider", account?.provider)
          return false
        }

        // Validate email exists
        if (!email && !profile?.email) {
          console.log("❌ Sign-in rejected: No email provided")
          return false
        }

        const userEmail = email || profile?.email || ""

        // Check if email domain is authorized
        const isAuthorized = AUTHORIZED_DOMAINS.some((domain) => userEmail.toLowerCase().endsWith(domain.toLowerCase()))

        if (!isAuthorized) {
          console.log("❌ Sign-in rejected: Unauthorized domain", userEmail)
          return false
        }

        console.log("✅ Sign-in approved for:", userEmail)
        return true
      } catch (error) {
        console.error("❌ Sign-in error:", error)
        return false
      }
    },

    async jwt({ token, account, profile }) {
      try {
        // Store additional user info on first sign in
        if (account && profile) {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.role = "admin" // All authorized users are admins
          token.provider = account.provider
          token.name = profile.name
          token.email = profile.email
        }

        return token
      } catch (error) {
        console.error("❌ JWT callback error:", error)
        return token
      }
    },

    async session({ session, token }) {
      try {
        // Add custom fields to session
        if (token && session.user) {
          session.user.role = token.role as string
          session.user.id = token.sub as string
          session.accessToken = token.accessToken as string
          session.provider = token.provider as string
        }

        return session
      } catch (error) {
        console.error("❌ Session callback error:", error)
        return session
      }
    },

    async redirect({ url, baseUrl }) {
      try {
        // Handle redirects securely
        if (url.startsWith("/")) return `${baseUrl}${url}`
        if (new URL(url).origin === baseUrl) return url
        return `${baseUrl}/admin/dashboard`
      } catch (error) {
        console.error("❌ Redirect error:", error)
        return `${baseUrl}/admin/dashboard`
      }
    },
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log("🔑 User signed in:", user.email, "via", account?.provider)
    },
    async signOut({ session, token }) {
      console.log("🚪 User signed out:", session?.user?.email || token?.email)
    },
  },

  logger: {
    error(code, metadata) {
      console.error("❌ NextAuth Error:", code, metadata)
    },
    warn(code) {
      console.warn("⚠️ NextAuth Warning:", code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("🐛 NextAuth Debug:", code, metadata)
      }
    },
  },
}

// Default export for backward compatibility
export default authOptions
