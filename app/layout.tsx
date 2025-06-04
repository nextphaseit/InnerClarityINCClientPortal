import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Inner Clarity | Mental Health Services",
    template: "%s | Inner Clarity",
  },
  description: "Secure, HIPAA-compliant mental health services and patient portal",
  keywords: ["mental health", "therapy", "counseling", "HIPAA", "secure", "patient portal"],
  authors: [{ name: "Inner Clarity" }],
  creator: "Inner Clarity",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Inner Clarity | Mental Health Services",
    description: "Secure, HIPAA-compliant mental health services and patient portal",
    siteName: "Inner Clarity",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inner Clarity | Mental Health Services",
    description: "Secure, HIPAA-compliant mental health services and patient portal",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SessionProvider>
              {children}
              <Toaster />
            </SessionProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
