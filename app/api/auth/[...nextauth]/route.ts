import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Auth0Provider from "next-auth/providers/auth0"
import AzureADProvider from "next-auth/providers/azure-ad"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export const authOptions: NextAuthOptions = {
  providers: [
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

          // Mock user validation - replace with real authentication
          if (credentials.email === "admin@innerclarity.org" && credentials.password === "admin123") {
            return {
              id: "1",
              email: "admin@innerclarity.org",
              name: "Admin User",
              role: "admin",
              tenantId: "inner-clarity-main",
            }
          }

          if (credentials.email === "patient@example.com" && credentials.password === "patient123") {
            return {
              id: "2",
              email: "patient@example.com",
              name: "Patient User",
              role: "patient",
              tenantId: "inner-clarity-main",
            }
          }

          return null
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
    // Only add Auth0 if environment variables are present
    ...(process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET && process.env.AUTH0_DOMAIN
      ? [
          Auth0Provider({
            clientId: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            issuer: `https://${process.env.AUTH0_DOMAIN}`,
            authorization: {
              params: {
                audience: process.env.AUTH0_AUDIENCE || `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
                scope: "openid email profile",
              },
            },
          }),
        ]
      : []),
    // Only add Azure AD if environment variables are present
    ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET && process.env.MICROSOFT_TENANT_ID
      ? [
          AzureADProvider({
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            tenantId: process.env.MICROSOFT_TENANT_ID,
            authorization: {
              params: {
                scope: "openid email profile User.Read",
              },
            },
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        if (user) {
          token.role = user.role || "patient"
          token.tenantId = user.tenantId || "inner-clarity-main"
          token.provider = account?.provider || "credentials"
        }
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          session.user.id = token.sub || ""
          session.user.role = token.role as string
          session.user.tenantId = token.tenantId as string
          session.user.provider = token.provider as string
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
    async signIn({ user, account, profile }) {
      try {
        // Allow sign in for all configured providers
        return true
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
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
