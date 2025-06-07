import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("🔐 Production sign-in attempt:", {
          provider: account?.provider,
          email: user.email,
          domain: user.email?.split("@")[1],
        })

        if (account?.provider === "google") {
          if (user.email) {
            const domain = user.email.split("@")[1]
            const authorizedDomains = [
              "nextphaseit.org",
              "innerclaritycounseling.com",
              "innerclarity.org",
              "innerclarityinc.com",
            ]

            if (!authorizedDomains.includes(domain)) {
              console.error(`❌ Unauthorized domain for admin access: ${domain}`)
              return false
            }

            user.role = "admin"
            console.log("✅ Admin login authorized for:", user.email)
          }
        }

        return true
      } catch (error) {
        console.error("❌ Sign-in callback error:", error)
        return false
      }
    },

    async jwt({ token, account, user }) {
      if (account && user) {
        token.email = user.email
        token.name = user.name
        token.picture = user.image
        token.role = user.role || "admin"
        token.provider = account.provider
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        session.user.role = token.role as string
        session.user.provider = token.provider as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      // Allow callback URLs on same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }

      // Default redirect to admin dashboard
      return `${baseUrl}/admin/dashboard`
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`✅ User signed in: ${user.email} via ${account?.provider} (Role: ${user.role})`)
    },
    async signOut({ session, token }) {
      console.log(`👋 User signed out: ${session?.user?.email || token?.email}`)
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
  debug: false, // Disabled for production
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
