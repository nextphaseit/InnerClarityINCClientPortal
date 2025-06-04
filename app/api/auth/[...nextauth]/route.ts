import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import Auth0Provider from "next-auth/providers/auth0"
import { logEnvironmentStatus } from "@/lib/env-validation"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// Validate environment variables on startup
const envValidation = logEnvironmentStatus()

if (!envValidation.isValid) {
  console.error("❌ Authentication cannot be initialized due to missing environment variables")
  throw new Error(`Missing required environment variables: ${envValidation.missing.join(", ")}`)
}

const { config } = envValidation

export const authOptions: NextAuthOptions = {
  providers: [
    // Microsoft Entra ID Provider (Primary for Admins)
    AzureADProvider({
      clientId: config.MICROSOFT_CLIENT_ID,
      clientSecret: config.MICROSOFT_CLIENT_SECRET,
      tenantId: config.MICROSOFT_TENANT_ID,
      authorization: {
        params: {
          scope: "openid email profile User.Read offline_access",
          prompt: "select_account", // Force account selection
        },
      },
      httpOptions: {
        timeout: 10000, // 10 second timeout
      },
    }),

    // Auth0 Provider (Optional for Patients)
    ...(config.AUTH0_DOMAIN && config.AUTH0_CLIENT_ID && config.AUTH0_CLIENT_SECRET
      ? [
          Auth0Provider({
            clientId: config.AUTH0_CLIENT_ID,
            clientSecret: config.AUTH0_CLIENT_SECRET,
            issuer: `https://${config.AUTH0_DOMAIN}`,
            authorization: {
              params: {
                scope: "openid email profile",
                audience: config.AUTH0_AUDIENCE,
              },
            },
            httpOptions: {
              timeout: 10000,
            },
          }),
        ]
      : []),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/auth/signout",
  },

  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      try {
        console.log(`🔐 JWT Callback - Trigger: ${trigger}, Provider: ${account?.provider || "N/A"}`)

        if (account && user) {
          console.log(`👤 Processing new login for: ${user.email}`)

          // Store OAuth tokens
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.expiresAt = account.expires_at
          token.provider = account.provider
          token.providerAccountId = account.providerAccountId

          // Determine user role based on provider and email domain
          let role = "patient" // Default role
          let tenantId = "inner-clarity-main"

          if (account.provider === "azure-ad") {
            // Microsoft users - check domain for admin access
            const email = user.email?.toLowerCase() || ""
            const adminDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
            const domain = email.split("@")[1]

            if (adminDomains.includes(domain)) {
              role = "admin"
              tenantId = config.MICROSOFT_TENANT_ID
              console.log(`✅ Admin access granted for domain: ${domain}`)
            } else {
              console.log(`❌ Unauthorized domain for admin access: ${domain}`)
              throw new Error(`Unauthorized domain: ${domain}. Admin access is restricted to authorized domains.`)
            }
          } else if (account.provider === "auth0") {
            // Auth0 users - check if admin domain or default to patient
            const email = user.email?.toLowerCase() || ""
            const adminDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
            const domain = email.split("@")[1]

            if (adminDomains.includes(domain)) {
              role = "admin"
              console.log(`✅ Auth0 user assigned admin role for domain: ${domain}`)
            } else {
              role = "patient"
              console.log(`✅ Auth0 user assigned patient role`)
            }
          }

          token.role = role
          token.tenantId = tenantId

          console.log(`✅ User ${user.email} assigned role: ${role}, tenant: ${tenantId}`)
        }

        // Handle token refresh if needed
        if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
          console.log("🔄 Token is still valid")
          return token
        }

        return token
      } catch (error) {
        console.error("❌ JWT callback error:", error)
        // Return null to force sign out on error
        return null
      }
    },

    async session({ session, token }) {
      try {
        if (token && session.user) {
          // Attach token information to session
          session.accessToken = token.accessToken as string
          session.refreshToken = token.refreshToken as string
          session.expiresAt = token.expiresAt as number
          session.provider = token.provider as string
          session.user.id = token.sub!
          session.user.role = token.role as string
          session.user.tenantId = token.tenantId as string

          console.log(`📱 Session created for ${session.user.email} (${session.user.role})`)
        }

        return session
      } catch (error) {
        console.error("❌ Session callback error:", error)
        return session
      }
    },

    async signIn({ user, account, profile, email, credentials }) {
      try {
        console.log(`🔑 SignIn callback - Provider: ${account?.provider}, User: ${user.email}`)

        if (!account || !user.email) {
          console.error("❌ Missing account or email in signIn callback")
          return false
        }

        // Additional validation for Microsoft login
        if (account.provider === "azure-ad") {
          const userEmail = user.email.toLowerCase()
          const adminDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
          const domain = userEmail.split("@")[1]

          if (!adminDomains.includes(domain)) {
            console.error(`❌ Unauthorized domain for Microsoft login: ${domain}`)
            return false
          }

          console.log(`✅ Microsoft login authorized for domain: ${domain}`)
        }

        return true
      } catch (error) {
        console.error("❌ SignIn callback error:", error)
        return false
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

        // Default redirect to base URL
        return baseUrl
      } catch (error) {
        console.error("❌ Redirect callback error:", error)
        return baseUrl
      }
    },
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`✅ User signed in: ${user.email} via ${account?.provider} (New: ${isNewUser})`)
    },
    async signOut({ session, token }) {
      console.log(`👋 User signed out: ${session?.user?.email || token?.email || "Unknown"}`)
    },
    async createUser({ user }) {
      console.log(`🆕 New user created: ${user.email}`)
    },
    async session({ session, token }) {
      console.log(`📱 Session accessed: ${session?.user?.email || "Unknown"}`)
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every hour
  },

  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: config.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",

  // Add custom error handling
  logger: {
    error(code, metadata) {
      console.error(`❌ NextAuth Error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`⚠️ NextAuth Warning [${code}]`)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log(`🐛 NextAuth Debug [${code}]:`, metadata)
      }
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
