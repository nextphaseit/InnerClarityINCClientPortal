import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"
import AzureADProvider from "next-auth/providers/azure-ad"

export const authOptions: NextAuthOptions = {
  providers: [
    // Auth0 Provider for patients
    ...(process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET && process.env.AUTH0_DOMAIN
      ? [
          Auth0Provider({
            clientId: process.env.AUTH0_CLIENT_ID,
            clientSecret: process.env.AUTH0_CLIENT_SECRET,
            issuer: `https://${process.env.AUTH0_DOMAIN}`,
            authorization: {
              params: {
                scope: "openid email profile",
                audience: process.env.AUTH0_AUDIENCE,
              },
            },
          }),
        ]
      : []),

    // Microsoft Entra ID Provider for admins
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
      // Initial sign in
      if (account && user) {
        console.log(`🔐 JWT Callback - Provider: ${account.provider}, User: ${user.email}`)

        // Determine role based on provider and email domain
        let role = "patient" // Default role
        let tenantId = "inner-clarity" // Default tenant

        if (account.provider === "azure-ad") {
          // Microsoft users are admins
          role = "admin"

          // Extract tenant from email domain or use Microsoft tenant ID
          const emailDomain = user.email?.split("@")[1]
          if (emailDomain === "innerclarity.com" || emailDomain === "innerclaritytherapy.com") {
            tenantId = "inner-clarity"
          } else {
            tenantId = process.env.MICROSOFT_TENANT_ID || "default"
          }
        } else if (account.provider === "auth0") {
          // Auth0 users are patients
          role = "patient"
          tenantId = "inner-clarity"
        }

        token.role = role
        token.tenantId = tenantId
        token.provider = account.provider

        console.log(`✅ User assigned role: ${role}, tenant: ${tenantId}`)
      }

      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.role = token.role as string
        session.user.tenantId = token.tenantId as string
        session.user.provider = token.provider as string
      }

      return session
    },
    async redirect({ url, baseUrl }) {
      console.log(`🔄 Redirect callback - URL: ${url}, Base: ${baseUrl}`)

      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url
      }

      return baseUrl
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
