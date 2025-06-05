import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const dynamic = "force-dynamic"

// Validate environment variables
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
  MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
}

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
    }),
  ],

  pages: {
    signIn: "/admin/login",
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "azure-ad") return false

      if (user.email) {
        const domain = user.email.split("@")[1]
        const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]

        if (!authorizedDomains.includes(domain)) {
          console.error(`Unauthorized domain: ${domain}`)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.role = user.email?.includes("admin") ? "admin" : "staff"
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
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
