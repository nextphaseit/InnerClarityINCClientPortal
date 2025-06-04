import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Auth0Provider from "next-auth/providers/auth0"
import AzureADProvider from "next-auth/providers/azure-ad"
import bcrypt from "bcryptjs"

// Mock user database - replace with real database in production
const users = [
  {
    id: "1",
    email: "admin@innerclarity.org",
    name: "Admin User",
    passwordHash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password123
    role: "admin" as const,
    tenantId: "inner-clarity",
  },
  {
    id: "2",
    email: "patient@innerclarity.org",
    name: "Patient User",
    passwordHash: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm", // password123
    role: "patient" as const,
    tenantId: "inner-clarity",
  },
  {
    id: "3",
    email: "demo.admin@innerclarity.org",
    name: "Demo Admin",
    passwordHash: "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // demo123
    role: "admin" as const,
    tenantId: "inner-clarity",
  },
  {
    id: "4",
    email: "demo.patient@innerclarity.org",
    name: "Demo Patient",
    passwordHash: "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // demo123
    role: "patient" as const,
    tenantId: "inner-clarity",
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    // Auth0 Provider for Patients
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID || "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET || "",
      issuer: process.env.AUTH0_DOMAIN,
    }),

    // Microsoft Entra ID Provider for Admins
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
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
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = users.find((u) => u.email === credentials.email)
          if (!user) {
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
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
      try {
        if (user) {
          token.role = user.role
          token.tenantId = user.tenantId
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
          session.user.id = token.sub || ""
          session.user.role = token.role as "admin" | "patient"
          session.user.tenantId = token.tenantId as string
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        // Handle relative URLs
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`
        }
        // Handle same origin URLs
        if (new URL(url).origin === baseUrl) {
          return url
        }
        // Default to base URL
        return baseUrl
      } catch (error) {
        console.error("Redirect callback error:", error)
        return baseUrl
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
