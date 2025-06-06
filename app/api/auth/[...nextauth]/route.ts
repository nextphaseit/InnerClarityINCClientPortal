import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextAuthOptions } from "next-auth"

// Demo admin credentials for testing
const DEMO_ADMIN = {
  id: "demo-admin-001",
  email: "admin@innerclarityinc.com",
  name: "Demo Administrator",
  role: "super_admin",
  password: "Admin123!",
}

// Mock admin users database
const adminUsers = [
  {
    id: "admin-1",
    email: "admin@innerclarityinc.com",
    name: "Adrian Knight",
    password: "Admin123!",
    role: "super_admin",
  },
  {
    id: "admin-2",
    email: "demo@admin.nextphaseit.org",
    name: "Demo Administrator",
    password: "DemoAdmin123!",
    role: "super_admin",
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        console.log("🔍 Attempting login for:", credentials.email)

        // Find admin user
        const adminUser = adminUsers.find((user) => user.email.toLowerCase() === credentials.email.toLowerCase())

        if (!adminUser) {
          console.log("❌ Admin user not found:", credentials.email)
          return null
        }

        // Check password (simple comparison for demo)
        if (credentials.password !== adminUser.password) {
          console.log("❌ Invalid password for:", credentials.email)
          return null
        }

        console.log("✅ Admin login successful:", adminUser.email)

        return {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          image: null,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/admin/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log("🔐 Sign-in attempt:", {
          provider: account?.provider,
          email: user.email,
        })

        // Allow admin credentials login
        if (account?.provider === "admin-credentials") {
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

            // Set role to admin for Google logins
            user.role = "admin"
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
