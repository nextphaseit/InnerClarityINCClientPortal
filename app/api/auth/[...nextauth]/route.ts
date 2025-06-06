import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import Auth0Provider from "next-auth/providers/auth0"
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
    async signIn({ user, account, profile }) {
      try {
        console.log("Sign-in attempt:", {
          provider: account?.provider,
          email: user.email,
          timestamp: new Date().toISOString(),
        })

        // Only allow Google and Auth0 authentication for admin portal
        if (!account?.provider || !["google", "auth0"].includes(account.provider)) {
          console.error("❌ Admin login requires Google or Auth0 authentication")
          return false
        }

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

    async jwt({ token, account, profile, user }) {
      try {
        if (account && (profile || user)) {
          // Store user info in token
          token.email = user?.email || profile?.email
          token.name = user?.name || profile?.name
          token.picture = user?.image || (profile as any)?.picture
          token.provider = account.provider
          token.role = "admin"

          console.log("JWT token created for:", token.email)
        }
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        // Return token even if there's an error to prevent auth failure
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
          session.user.provider = token.provider as string
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        // Return session even if there's an error to prevent auth failure
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
  events: {
    async signIn({ user, account, profile }) {
      console.log("✅ Sign in event:", {
        user: user.email,
        provider: account?.provider,
        timestamp: new Date().toISOString(),
      })
    },
    async signOut({ session, token }) {
      console.log("👋 Sign out event:", {
        user: session?.user?.email || token?.email,
        timestamp: new Date().toISOString(),
      })
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
