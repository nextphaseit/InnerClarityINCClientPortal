"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

interface AdminAuthProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export default function AdminAuthProvider({ children, session }: AdminAuthProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  )
}
