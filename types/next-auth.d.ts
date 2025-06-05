import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
    accessToken?: string
    provider?: string
  }

  interface JWT {
    accessToken?: string
    role?: string
    provider?: string
  }
}
