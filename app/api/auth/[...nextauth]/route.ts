import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔐 NextAuth signIn callback:", { user, account, profile })

      // Check if user email is from authorized domain
      const authorizedDomains = ["@innerclarity.org", "@innerclarityinc.com", "@nextphaseit.org"]

      const userEmail = user.email
      if (!userEmail) {
        console.log("❌ No email provided")
        return false
      }

      const hasAuthorizedDomain = authorizedDomains.some((domain) => userEmail.endsWith(domain))

      if (!hasAuthorizedDomain) {
        console.log("❌ Unauthorized domain:", userEmail)
        return false
      }

      console.log("✅ Authorized user:", userEmail)
      return true
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string
        session.provider = token.provider as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 NextAuth redirect:", { url, baseUrl })

      // Always redirect to admin dashboard after successful login
      if (url.startsWith("/admin/login")) {
        return `${baseUrl}/admin/dashboard`
      }

      // Allow relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }

      return `${baseUrl}/admin/dashboard`
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
