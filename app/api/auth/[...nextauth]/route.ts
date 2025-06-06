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
    async signIn({ user, account }) {
      try {
        console.log("Sign-in attempt:", {
          provider: account?.provider,
          email: user.email,
          timestamp: new Date().toISOString(),
        })

        // Validate authorized email domains
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
        }

        console.log("✅ Successful admin sign-in:", user.email)
        return true
      } catch (error) {
        console.error("Sign-in callback error:", error)
        return false
      }
    },

    async jwt({ token, account, user }) {
      try {
        if (account && user) {
          // Store user info in token
          token.email = user.email
          token.name = user.name
          token.picture = user.image
          token.role = "admin"

          console.log("JWT token created for:", token.email)
        }
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },

    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.email = token.email as string
          session.user.name = token.name as string
          session.user.image = token.picture as string
          session.user.role = token.role as string
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },

    async redirect({ url, baseUrl }) {
      try {
        console.log("Redirect callback:", { url, baseUrl })

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
      } catch (error) {
        console.error("Redirect callback error:", error)
        return `${baseUrl}/admin/dashboard`
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
