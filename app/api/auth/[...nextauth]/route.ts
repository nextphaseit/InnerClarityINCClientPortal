import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

// Force dynamic rendering for Vercel deployment
export const dynamic = "force-dynamic"

// Environment variable validation
const validateEnvironment = () => {
  const requiredVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
  }

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`)
  }

  return requiredVars
}

// Initialize and validate environment
const env = validateEnvironment()

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: env.MICROSOFT_CLIENT_ID!,
      clientSecret: env.MICROSOFT_CLIENT_SECRET!,
      tenantId: env.MICROSOFT_TENANT_ID!,
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

  // Custom pages
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  // Callbacks
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Ensure we have required data
        if (!account || !user.email) {
          console.error("Missing account or email in signIn")
          return false
        }

        // Only allow Microsoft provider
        if (account.provider !== "azure-ad") {
          console.error("Invalid provider:", account.provider)
          return false
        }

        // Domain validation for authorized users
        const email = user.email.toLowerCase()
        const authorizedDomains = ["innerclarity.org", "innerclarityinc.com", "nextphaseit.org"]

        const domain = email.split("@")[1]
        if (!authorizedDomains.includes(domain)) {
          console.error("Unauthorized domain:", domain)
          return false
        }

        console.log("Successful sign-in:", user.email)
        return true
      } catch (error) {
        console.error("SignIn callback error:", error)
        return false
      }
    },

    async jwt({ token, user, account }) {
      try {
        // Initial sign in
        if (account && user) {
          return {
            ...token,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
            role: "admin",
            provider: account.provider,
          }
        }

        // Return previous token if still valid
        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },

    async session({ session, token }) {
      try {
        // Add custom properties to session
        if (token && session.user) {
          session.user.id = token.sub!
          session.user.role = token.role as string
          session.accessToken = token.accessToken as string
          session.provider = token.provider as string
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

        // Default redirect
        return `${baseUrl}/admin/dashboard`
      } catch (error) {
        console.error("Redirect callback error:", error)
        return `${baseUrl}/admin/dashboard`
      }
    },
  },

  // Event handlers
  events: {
    async signIn({ user, account }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`)
    },
    async signOut({ session }) {
      console.log(`User signed out: ${session?.user?.email}`)
    },
  },

  // Security
  secret: env.NEXTAUTH_SECRET,

  // Logging
  debug: process.env.NODE_ENV === "development",
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

// Create NextAuth handler
const handler = NextAuth(authOptions)

// Export for App Router
export { handler as GET, handler as POST }
