import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    provider?: string
    user: {
      id: string
      role: "admin" | "patient"
      tenantId: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role?: "admin" | "patient"
    tenantId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    provider?: string
    role?: "admin" | "patient"
    tenantId?: string
    providerAccountId?: string
  }
}
