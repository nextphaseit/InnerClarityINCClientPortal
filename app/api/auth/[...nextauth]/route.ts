import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Auth0Provider from "next-auth/providers/auth0"
import AzureADProvider from "next-auth/providers/azure-ad"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider for development/testing
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials")
            return null
          }

          // Mock user validation - replace with real authentication
          if (credentials.email === "admin@innerclarity.org" && credentials.password === "admin123") {
            console.log("Admin credentials validated")
            return {
              id: "1",
              email: "admin@innerclarity.org",
              name: "Admin User",
              role: "admin",
              tenantId: "inner-clarity-main",
            }
          }

          if (credentials.email === "patient@example.com" && credentials.password === "patient123") {
            console.log("Patient credentials validated")
            return {
              id: "2",
              email: "patient@example.com",
              name: "Patient User",
              role: "patient",
              tenantId: "inner-clarity-main",
            }
          }

          console.log("Invalid credentials provided")
          return null
        } catch (error) {
          console.error("Credentials authorization error:", error)
          return null
        }
      },
    }),

    // Auth0 Provider for Patients
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

    // Microsoft Entra ID Provider for Admins
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
    async jwt({ token, user, account, profile }) {
      try {
        if (user && account) {
          console.log(`JWT callback - Provider: ${account.provider}, User: ${user.email}`)

          // Assign roles based on provider and email domain
          if (account.provider === "auth0") {
            token.role = "patient"
            token.provider = "auth0"
            console.log("Assigned patient role for Auth0 user")
          } else if (account.provider === "azure-ad") {
            // Check if email domain is authorized for admin access
            const email = user.email?.toLowerCase() || ""
            const adminDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
            const domain = email.split("@")[1]

            if (adminDomains.includes(domain)) {
              token.role = "admin"
              token.provider = "azure-ad"
              console.log("Assigned admin role for Microsoft user")
            } else {
              console.log("Unauthorized domain for admin access:", domain)
              return null // Reject the token
            }
          } else if (account.provider === "credentials") {
            token.role = user.role || "patient"
            token.provider = "credentials"
          }

          token.tenantId = user.tenantId || "inner-clarity-main"
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
        if (session.user && token) {
          session.user.id = token.sub || ""
          session.user.role = token.role as string
          session.user.tenantId = token.tenantId as string
          session.user.provider = token.provider as string
          session.accessToken = token.accessToken as string

          console.log(`Session created for ${session.user.email} with role: ${session.user.role}`)
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },

    async redirect({ url, baseUrl }) {
      try {
        console.log(`Redirect callback - URL: ${url}, BaseURL: ${baseUrl}`)

        // Handle relative URLs
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`
        }

        // Handle same origin URLs
        if (new URL(url).origin === baseUrl) {
          return url
        }

        // Default redirect - will be handled by middleware for role-based routing
        return baseUrl
      } catch (error) {
        console.error("Redirect callback error:", error)
        return baseUrl
      }
    },

    async signIn({ user, account, profile }) {
      try {
        console.log(`SignIn callback - Provider: ${account?.provider}, User: ${user.email}`)

        // For Microsoft login, check domain authorization
        if (account?.provider === "azure-ad") {
          const email = user.email?.toLowerCase() || ""
          const adminDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
          const domain = email.split("@")[1]

          if (!adminDomains.includes(domain)) {
            console.log("Access denied for domain:", domain)
            return false
          }
        }

        return true
      } catch (error) {
        console.error("SignIn callback error:", error)
        return false
      }
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`✅ User signed in: ${user.email} via ${account?.provider} (New user: ${isNewUser})`)
    },
    async signOut({ session }) {
      console.log(`👋 User signed out: ${session?.user?.email}`)
    },
    async createUser({ user }) {
      console.log(`🆕 New user created: ${user.email}`)
    },
    async session({ session }) {
      console.log(`📱 Session accessed: ${session?.user?.email}`)
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
