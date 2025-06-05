import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"

export const dynamic = "force-dynamic"

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_DOMAIN,
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
      // Only allow Auth0 authentication for admin portal
      if (account?.provider !== "auth0") {
        console.error("❌ Admin login requires Auth0 authentication")
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
