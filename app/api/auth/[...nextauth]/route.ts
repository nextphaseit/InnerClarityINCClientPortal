import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"
import AzureADProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Mock user database for development - replace with real database in production
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
]

export const authOptions: NextAuthOptions = {
  providers: [
    // Auth0 Provider for Patients
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_DOMAIN,
      authorization: {
        params: {
          scope: "openid email profile",
          audience: process.env.AUTH0_AUDIENCE,
        },
      },
    }),

    // Azure AD Provider for Admins
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      tenantId: process.env.MICROSOFT_TENANT_ID,
      authorization: {
        params: {
          scope: "openid email profile User.Read",
        },
      },
    }),

    // Credentials Provider for Development/Testing
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
            provider: "credentials",
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
    async jwt({ token, user, account }) {
      try {
        // Initial sign in
        if (user && account) {
          // Assign roles based on provider
          if (account.provider === "auth0") {
            token.role = "patient"
            token.provider = "auth0"
          } else if (account.provider === "azure-ad") {
            token.role = "admin"
            token.provider = "azure-ad"
          } else if (account.provider === "credentials") {
            token.role = user.role
            token.provider = "credentials"
          }

          token.tenantId = user.tenantId || "inner-clarity"
          token.accessToken = account.access_token
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
          session.user.id = token.sub!
          session.user.role = token.role as "admin" | "patient"
          session.user.tenantId = token.tenantId as string
          session.user.provider = token.provider as string
          session.accessToken = token.accessToken as string
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

        // Default redirect based on role (will be handled by middleware)
        return baseUrl
      } catch (error) {
        console.error("Redirect callback error:", error)
        return baseUrl
      }
    },

    async signIn({ user, account, profile }) {
      try {
        // Allow sign in for all configured providers
        if (account?.provider === "auth0" || account?.provider === "azure-ad" || account?.provider === "credentials") {
          return true
        }

        return false
      } catch (error) {
        console.error("SignIn callback error:", error)
        return false
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

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
