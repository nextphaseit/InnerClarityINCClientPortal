import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const dynamic = "force-dynamic"

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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ user, account }) {
      // Only allow Azure AD authentication for admin portal
      if (account?.provider !== "azure-ad") {
        console.error("❌ Admin login requires Microsoft authentication")
        return false
      }

      // Validate authorized email domains
      if (user.email) {
        const domain = user.email.split("@")[1]
        const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]

        if (!authorizedDomains.includes(domain)) {
          console.error(`❌ Unauthorized domain for admin access: ${domain}`)
          return false
        }
      }

      console.log("✅ Successful admin sign-in:", user.email)
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
      // Handle redirects properly
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
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
