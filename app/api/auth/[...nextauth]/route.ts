import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"
import AzureADProvider from "next-auth/providers/azure-ad"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export const authOptions: NextAuthOptions = {
  providers: [
    // Auth0 Provider for Patients (supports both Auth0 and Microsoft login)
    ...(process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET && process.env.AUTH0_DOMAIN
      ? [
          Auth0Provider({
            clientId: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            issuer: `https://${process.env.AUTH0_DOMAIN}`,
            authorization: {
              params: {
                scope: "openid email profile",
                audience: process.env.AUTH0_AUDIENCE || `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
              },
            },
          }),
        ]
      : []),

    // Microsoft Entra ID Provider for Admins (direct Azure AD integration)
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
          console.log(`🔐 JWT Callback - Provider: ${account.provider}, User: ${user.email}`)

          // Determine role based on provider and email domain
          let role = "patient" // Default role
          let tenantId = "inner-clarity-main" // Default tenant

          if (account.provider === "auth0") {
            // Auth0 users are patients by default
            // But we can also check email domain for admin privileges
            const email = user.email?.toLowerCase() || ""
            const adminDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
            const domain = email.split("@")[1]

            if (adminDomains.includes(domain)) {
              role = "admin"
              console.log("Auth0 user assigned admin role based on email domain")
            } else {
              role = "patient"
              console.log("Auth0 user assigned patient role")
            }

            token.provider = "auth0"
          } else if (account.provider === "azure-ad") {
            // Microsoft users are admins
            const email = user.email?.toLowerCase() || ""
            const adminDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
            const domain = email.split("@")[1]

            if (adminDomains.includes(domain)) {
              role = "admin"
              tenantId = process.env.MICROSOFT_TENANT_ID || "inner-clarity-main"
              console.log("Microsoft user assigned admin role")
            } else {
              console.log("Unauthorized domain for Microsoft admin access:", domain)
              throw new Error(`Unauthorized domain: ${domain}`)
            }

            token.provider = "azure-ad"
          }

          token.role = role
          token.tenantId = tenantId
          token.accessToken = account.access_token

          console.log(`✅ User ${user.email} assigned role: ${role}, tenant: ${tenantId}`)
        }

        return token
      } catch (error) {
        console.error("❌ JWT callback error:", error)
        // Return null to reject the token and prevent sign-in
        return null
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

          console.log(`📱 Session created for ${session.user.email} with role: ${session.user.role}`)
        }
        return session
      } catch (error) {
        console.error("❌ Session callback error:", error)
        return session
      }
    },

    async redirect({ url, baseUrl }) {
      try {
        console.log(`🔄 Redirect callback - URL: ${url}, Base: ${baseUrl}`)

        // Handle relative URLs
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`
        }

        // Handle same origin URLs
        if (new URL(url).origin === baseUrl) {
          return url
        }

        // Default redirect
        return baseUrl
      } catch (error) {
        console.error("❌ Redirect callback error:", error)
        return baseUrl
      }
    },

    async signIn({ user, account, profile }) {
      try {
        console.log(`🔑 SignIn callback - Provider: ${account?.provider}, User: ${user.email}`)

        // For Microsoft login, check domain authorization
        if (account?.provider === "azure-ad") {
          const email = user.email?.toLowerCase() || ""
          const adminDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
          const domain = email.split("@")[1]

          if (!adminDomains.includes(domain)) {
            console.error(`❌ Access denied for domain: ${domain}`)
            return false
          }
        }

        return true
      } catch (error) {
        console.error("❌ SignIn callback error:", error)
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
