import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

// Force dynamic rendering for Vercel deployment
export const dynamic = "force-dynamic"

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://patients.nextphaseit.org",
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    const errorMsg = `Missing required environment variables: ${missingVars.join(", ")}`
    console.error("❌", errorMsg)
    throw new Error(errorMsg)
  }

  console.log("✅ All Microsoft authentication environment variables are present")
  return requiredVars
}

// Initialize environment variables
const envVars = validateEnvVars()

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: envVars.MICROSOFT_CLIENT_ID!,
      clientSecret: envVars.MICROSOFT_CLIENT_SECRET!,
      tenantId: envVars.MICROSOFT_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid email profile User.Read",
          prompt: "select_account",
        },
      },
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every hour
  },

  // JWT configuration
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!account || !user.email) {
          console.error("❌ Missing account or email in signIn callback")
          return false
        }

        // Validate that this is a Microsoft login
        if (account.provider !== "azure-ad") {
          console.error("❌ Only Microsoft authentication is allowed")
          return false
        }

        // Optional: Add domain validation for admin access
        const email = user.email.toLowerCase()
        const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]

        const domain = email.split("@")[1]
        if (!authorizedDomains.includes(domain)) {
          console.error(`❌ Unauthorized domain: ${domain}`)
          return false
        }

        console.log(`✅ Successful Microsoft login for: ${user.email}`)
        return true
      } catch (error) {
        console.error("❌ SignIn callback error:", error)
        return false
      }
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          provider: account.provider,
          role: "admin",
        }
      }

      // Return previous token if the access token has not expired yet
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
        session.provider = token.provider as string
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url

      // Default redirect to admin dashboard
      return `${baseUrl}/admin/dashboard`
    },
  },

  events: {
    async signIn({ user, account }) {
      console.log(`✅ User signed in: ${user.email} via ${account?.provider}`)
    },
    async signOut({ session }) {
      console.log(`👋 User signed out: ${session?.user?.email}`)
    },
  },

  // Secret for JWT encryption
  secret: envVars.NEXTAUTH_SECRET,

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",

  // Custom logger for production safety
  logger: {
    error(code, metadata) {
      console.error(`NextAuth Error [${code}]:`, metadata)
    },
    warn(code) {
      console.warn(`NextAuth Warning [${code}]`)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log(`NextAuth Debug [${code}]:`, metadata)
      }
    },
  },
}

// Create the NextAuth handler
const handler = NextAuth(authOptions)

// Export for App Router
export { handler as GET, handler as POST }
