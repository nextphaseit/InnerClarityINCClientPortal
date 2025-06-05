import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Auth0Provider from "next-auth/providers/auth0"
import AzureADProvider from "next-auth/providers/azure-ad"
import bcrypt from "bcryptjs"

// Mock user database with multi-tenant support
const users = [
  // Admin users with tenant assignments
  {
    id: "admin-1",
    name: "Adrian Knight",
    email: "admin@innerclarityinc.com",
    passwordHash: "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // Admin@1234
    role: "admin",
    tenantId: "inner-clarity-main",
    tenantName: "Inner Clarity - Main Office",
    authProvider: "microsoft",
  },
  {
    id: "admin-2",
    name: "Dr. Michael Chen",
    email: "michael.chen@nextphaseit.org",
    passwordHash: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "admin",
    tenantId: "inner-clarity-north",
    tenantName: "Inner Clarity - North Branch",
    authProvider: "microsoft",
  },
  // Patient users
  {
    id: "patient-1",
    name: "John Smith",
    email: "patient@example.com",
    passwordHash: "$2a$12$LQv3c1yqBwEHxE5W8s8.Oe5SFXqbOqHf5QJZqJZqJZqJZqJZqJZqJ", // "password123"
    role: "patient",
    authProvider: "auth0",
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    // Auth0 Provider for Patients
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_DOMAIN,
    }),

    // Microsoft Entra ID Provider for Admins
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID,
    }),

    // Credentials Provider (for development/testing)
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
          tenantId: user.tenantId || null,
          tenantName: user.tenantName || null,
          authProvider: user.authProvider,
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Microsoft login, restrict to specific domains
      if (account?.provider === "azure-ad") {
        const email = user.email?.toLowerCase() || ""
        const allowedDomains = ["innerclarityinc.com", "nextphaseit.org"]
        const domain = email.split("@")[1]

        if (!allowedDomains.includes(domain)) {
          return false // Reject sign in
        }

        // Set role to admin for Microsoft logins
        user.role = "admin"
      }

      // For Auth0 login, set role to patient
      if (account?.provider === "auth0") {
        user.role = "patient"
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.tenantId = user.tenantId
        token.tenantName = user.tenantName
        token.authProvider = account?.provider || user.authProvider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        session.user.tenantId = token.tenantId as string
        session.user.tenantName = token.tenantName as string
        session.user.authProvider = token.authProvider as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle role-based redirects after login
      if (url.startsWith("/api/auth/signin") || url.startsWith("/auth/signin")) {
        // We'll handle this in the middleware based on role
        return baseUrl
      }

      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      // Allow same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url
      }

      return baseUrl
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log successful sign-in for audit purposes
      console.log(`User signed in: ${user.email} via ${account?.provider} (${user.role})`)

      // Here you would store the user in your database if they don't exist
      // and update their last login timestamp
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`)
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
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

// Helper function to seed admin user if none exists
export async function seedAdminUser() {
  // Check if admin exists
  const adminExists = users.some((user) => user.role === "admin")

  if (!adminExists) {
    // Hash password
    const passwordHash = await bcrypt.hash("Admin@1234", 12)

    // Create default admin
    const defaultAdmin = {
      id: "admin-default",
      name: "Adrian Knight",
      email: "admin@innerclarityinc.com",
      passwordHash,
      role: "admin" as const,
      tenantId: "inner-clarity-main",
      tenantName: "Inner Clarity - Main Office",
      authProvider: "microsoft",
    }

    users.push(defaultAdmin)
    console.log("Default admin user created:", defaultAdmin.email)
    return true
  }

  return false
}
