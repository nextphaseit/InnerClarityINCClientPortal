import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

// Force dynamic rendering to ensure auth state is always current
export const dynamic = "force-dynamic"

// Validate required environment variables for Microsoft authentication
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://patients.portal.nextphaseit.org",
  MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
  MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingVars.join(", "))
  throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`)
}

console.log("✅ Microsoft authentication environment variables are present")

export const authOptions: NextAuthOptions = {
  providers: [
    // Microsoft Entra ID Provider (Azure AD)
    AzureADProvider({
      clientId: requiredEnvVars.MICROSOFT_CLIENT_ID!,
      clientSecret: requiredEnvVars.MICROSOFT_CLIENT_SECRET!,
      tenantId: requiredEnvVars.MICROSOFT_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid email profile User.Read offline_access",
          prompt: "select_account",
        },
      },
      httpOptions: {
        timeout: 10000, // 10 seconds timeout for API calls
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    signOut: "/auth/signout",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log(`🔑 Admin SignIn attempt - User: ${user.email}`)

        if (!account || !user.email) {
          console.error("❌ Missing account or email in signIn callback")
          return false
        }

        // Check if email domain is authorized for admin access
        const email = user.email.toLowerCase()
        const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]
        const domain = email.split("@")[1]

        if (!authorizedDomains.includes(domain)) {
          console.error(`❌ Unauthorized domain for admin access: ${domain}`)
          return false
        }

        console.log(`✅ Admin access authorized for: ${user.email}`)
        return true
      } catch (error) {
        console.error("❌ SignIn callback error:", error)
        return false
      }
    },

    async jwt({ token, user, account }) {
      try {
        // Initial sign in
        if (account && user) {
          console.log(`👤 Processing admin JWT for: ${user.email}`)

          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
            role: "admin",
          }
        }

        // Return previous token if not expired
        return token
      } catch (error) {
        console.error("❌ JWT callback error:", error)
        return token
      }
    },

    async session({ session, token }) {
      try {
        if (token && session.user) {
          // Add admin role and tokens to the session
          session.user.role = "admin"
          session.user.id = token.sub!
          session.accessToken = token.accessToken as string
          session.refreshToken = token.refreshToken as string
          session.expiresAt = token.expiresAt as number

          console.log(`📱 Admin session created for ${session.user.email}`)
        }

        return session
      } catch (error) {
        console.error("❌ Session callback error:", error)
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

        // Default redirect to admin dashboard
        return `${baseUrl}/admin/dashboard`
      } catch (error) {
        console.error("❌ Redirect callback error:", error)
        return `${baseUrl}/admin/dashboard`
      }
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`✅ Admin signed in: ${user.email}`)
    },
    async signOut({ session }) {
      console.log(`👋 Admin signed out: ${session?.user?.email || "Unknown"}`)
    },
  },

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // Update session every hour
  },

  // JWT configuration
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // Secret for JWT encryption
  secret: requiredEnvVars.NEXTAUTH_SECRET,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  // Custom logger
  logger: {
    error(code, metadata) {
      console.error(`❌ NextAuth Error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`⚠️ NextAuth Warning [code]`)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log(`🐛 NextAuth Debug [code]:`, metadata)
      }
    },
  },
}

// Create and export the NextAuth handler
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
