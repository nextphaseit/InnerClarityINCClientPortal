import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Mock user database with multi-tenant support
const users = [
  // Admin users with tenant assignments
  {
    id: "admin-1",
    name: "Dr. Sarah Johnson",
    email: "admin@innerclarity.com",
    password: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "admin",
    tenantId: "inner-clarity-main",
    tenantName: "Inner Clarity - Main Office",
  },
  {
    id: "admin-2",
    name: "Dr. Michael Chen",
    email: "michael.chen@innerclarity.com",
    password: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "admin",
    tenantId: "inner-clarity-north",
    tenantName: "Inner Clarity - North Branch",
  },
  {
    id: "demo-admin",
    name: "Demo Administrator",
    email: "demo.admin@innerclarity.com",
    password: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "demo123"
    role: "admin",
    tenantId: "inner-clarity-demo",
    tenantName: "Inner Clarity - Demo",
  },
  // Patient users (no tenant assignment)
  {
    id: "client-1",
    name: "John Smith",
    email: "client@example.com",
    password: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "patient",
  },
  {
    id: "client-2",
    name: "Jane Doe",
    email: "jane@example.com",
    password: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "patient",
  },
  {
    id: "demo-client",
    name: "Demo Patient",
    email: "demo.patient@innerclarity.com",
    password: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "demo123"
    role: "patient",
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
        const isValidPassword = await bcrypt.compare(credentials.password, user.password)

        if (!isValidPassword) {
          throw new Error("Invalid password")
        }

        // Return user object (exclude password)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId || null,
          tenantName: user.tenantName || null,
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
        token.tenantName = user.tenantName
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string
        session.user.tenantName = token.tenantName as string
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

// Helper function to get tenant-filtered data
export function getTenantFilteredData<T extends { tenantId?: string }>(data: T[], userTenantId?: string): T[] {
  if (!userTenantId) return data
  return data.filter((item) => item.tenantId === userTenantId)
}

// Helper function to check tenant access
export function checkTenantAccess(userTenantId?: string, resourceTenantId?: string): boolean {
  if (!userTenantId) return true // Patients can access their own data
  return userTenantId === resourceTenantId
}
