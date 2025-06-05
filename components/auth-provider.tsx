"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

interface AuthProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  )
}

// Also export as named export for flexibility
export { AuthProvider }
