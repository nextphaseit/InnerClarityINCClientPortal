import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Validate required environment variables
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
  MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
}

// Check for missing variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingVars.join(", "))
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Microsoft Azure AD Provider
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid email profile User.Read offline_access",
        },
      },
    }),
  ],

  pages: {
    signIn: "/admin/login",
    error: "/auth/error",
    signOut: "/auth/signout",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow sign-in on admin domain
      const isAdminDomain = process.env.NEXTAUTH_URL?.includes("admin") || false

      if (!isAdminDomain) {
        console.error("❌ Microsoft login attempted on non-admin domain")
        return false
      }

      // Only allow Microsoft authentication
      if (account?.provider !== "azure-ad") {
        console.error("❌ Admin login requires Microsoft authentication")
        return false
      }

      // Check authorized email domains
      if (user.email) {
        const email = user.email.toLowerCase()
        const domain = email.split("@")[1]
        const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]

        if (!authorizedDomains.includes(domain)) {
          console.error(`❌ Unauthorized domain for admin access: ${domain}`)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.role = "admin"
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = "admin"
        session.accessToken = token.accessToken as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Redirect to admin dashboard after successful sign-in
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      } else if (url.startsWith(baseUrl)) {
        return url
      }
      return `${baseUrl}/admin/dashboard`
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
