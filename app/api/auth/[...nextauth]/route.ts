import NextAuth from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"
import type { NextAuthOptions } from "next-auth"

const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
      authorization: {
        params: {
          scope: "openid email profile",
          audience: process.env.AUTH0_AUDIENCE || undefined,
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
    async jwt({ token, account, profile }) {
      try {
        if (account && profile) {
          // Store user info in token
          token.email = profile.email
          token.name = profile.name
          token.picture = profile.picture

          // Check if user is authorized admin
          const authorizedDomains = ["nextphaseit.org", "innerclaritycounseling.com"]

          const userEmail = profile.email as string
          const isAuthorized = authorizedDomains.some((domain) => userEmail?.endsWith(`@${domain}`))

          if (!isAuthorized) {
            throw new Error("Unauthorized domain")
          }

          token.role = "admin"
        }
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        throw error
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.email = token.email as string
          session.user.name = token.name as string
          session.user.image = token.picture as string
          session.user.role = token.role as string
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        throw error
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // Handle redirects after sign in
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`
        }
        // Allow callback URLs on same origin
        if (new URL(url).origin === baseUrl) {
          return url
        }
        return `${baseUrl}/admin/dashboard`
      } catch (error) {
        console.error("Redirect callback error:", error)
        return `${baseUrl}/admin/dashboard`
      }
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("Sign in event:", {
        user: user.email,
        provider: account?.provider,
        timestamp: new Date().toISOString(),
      })
    },
    async signOut({ session, token }) {
      console.log("Sign out event:", {
        user: session?.user?.email || token?.email,
        timestamp: new Date().toISOString(),
      })
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
