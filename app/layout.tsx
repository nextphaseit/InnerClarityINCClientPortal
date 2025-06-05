import "./globals.css"
import type { ReactNode } from "react"
import { SessionProvider } from "@/components/session-provider"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
