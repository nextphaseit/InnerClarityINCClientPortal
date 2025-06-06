import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"

// Demo admin credentials
const DEMO_ADMIN = {
  id: "demo-admin-001",
  email: "demo@admin.nextphaseit.org",
  name: "Demo Administrator",
  role: "super_admin",
  // Password: "DemoAdmin123!"
  passwordHash: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ",
}

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
    CredentialsProvider({
      id: "demo-admin",
      name: "Demo Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check if this is the demo admin account
        if (credentials.email === DEMO_ADMIN.email) {
          // For demo purposes, we'll use a simple password check
          if (credentials.password === "DemoAdmin123!") {
            console.log("✅ Demo admin login successful")
            return {
              id: DEMO_ADMIN.id,
              email: DEMO_ADMIN.email,
              name: DEMO_ADMIN.name,
              role: DEMO_ADMIN.role,
              image: null,
            }
          }
        }

        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // Use the page directly, not the API route
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log("Sign-in attempt:", {
          provider: account?.provider,
          email: user.email,
        })

        // Allow demo admin login
        if (account?.provider === "demo-admin") {
          return true
        }

        // For Google authentication, validate authorized email domains
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
          }
        }

        return true
      } catch (error) {
        console.error("Sign-in callback error:", error)
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
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
