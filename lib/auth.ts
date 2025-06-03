import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// This is a simplified auth setup to get things working
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is a mock authentication - in production, you would validate against a real database
        if (credentials?.email && credentials?.password) {
          // Mock admin user
          if (credentials.email.includes("admin@innerclarity.com")) {
            return {
              id: "admin-1",
              name: "Admin User",
              email: credentials.email,
              role: "admin",
              image: null,
            }
          }

          // Mock client user
          return {
            id: "client-1",
            name: "Client User",
            email: credentials.email,
            role: "client",
            image: null,
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: "TEMPORARY-SECRET-FOR-DEVELOPMENT", // In production, use process.env.NEXTAUTH_SECRET
  debug: true,
}
