"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"

interface Props {
  children: React.ReactNode
  session?: Session | null
}

export default function AuthSessionProvider({ children, session }: Props) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  )
}
