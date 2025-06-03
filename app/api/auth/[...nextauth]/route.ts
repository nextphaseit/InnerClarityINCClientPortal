import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Import users from registration route
const users = [
  {
    id: "admin-1",
    name: "Dr. Sarah Johnson",
    email: "admin@innerclarity.org",
    passwordHash: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "admin",
    tenantId: "inner-clarity",
    dateRegistered: "2024-01-01T00:00:00Z",
  },
  {
    id: "patient-1",
    name: "Jayda Smith",
    email: "jayda@innerclarity.org",
    passwordHash: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "patient",
    tenantId: "inner-clarity",
    dateRegistered: "2024-01-15T00:00:00Z",
  },
  {
    id: "demo-admin",
    name: "Demo Admin",
    email: "demo.admin@innerclarity.org",
    passwordHash: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "demo123"
    role: "admin",
    tenantId: "inner-clarity",
    dateRegistered: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-patient",
    name: "Demo Patient",
    email: "demo.patient@innerclarity.org",
    passwordHash: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "demo123"
    role: "patient",
    tenantId: "inner-clarity",
    dateRegistered: "2024-01-15T00:00:00Z",
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        // Find user by email
        const user = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase())

        if (!user) {
          throw new Error("No account found with this email address")
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isValidPassword) {
          throw new Error("Invalid password")
        }

        // Return user object (exclude password)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.tenantId = user.tenantId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirects after login
      if (url.includes("/auth/signin")) {
        return baseUrl
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "TEMPORARY-SECRET-FOR-DEVELOPMENT",
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
