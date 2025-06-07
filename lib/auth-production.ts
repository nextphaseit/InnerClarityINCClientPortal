import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { validateProductionConfig } from "./env-config"

// Validate configuration on startup
validateProductionConfig()

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: "nextphaseit.org", // Restrict to specific domain
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email?.toLowerCase() || ""

      // Only allow specific authorized domains
      const authorizedDomains = [
        "nextphaseit.org",
        "innerclaritycounseling.com",
        "innerclarity.org",
        "innerclarityinc.com",
      ]

      const domain = email.split("@")[1]

      if (!authorizedDomains.includes(domain)) {
        console.log(`❌ Unauthorized domain: ${domain}`)
        return false
      }

      // Set role based on domain
      if (["nextphaseit.org", "innerclarityinc.com"].includes(domain)) {
        user.role = "admin"
      } else {
        user.role = "admin" // All authorized domains are admin for now
      }

      console.log(`✅ Authorized admin login: ${email}`)
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || "admin"
        token.id = user.id
        token.tenantId = "inner-clarity"
        token.authProvider = account?.provider || "google"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string
        session.user.authProvider = token.authProvider as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Disable debug in production
}
