import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "admin" | "patient"
      tenantId: string
      provider: string
    } & DefaultSession["user"]
    accessToken: string
  }

  interface User extends DefaultUser {
    role: "admin" | "patient"
    tenantId: string
    provider: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: "admin" | "patient"
    tenantId: string
    provider: string
    accessToken: string
  }
}
