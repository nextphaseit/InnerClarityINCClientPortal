import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import AuthProvider from "@/components/auth-provider"
import { ToastProvider } from "@/components/toast-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Inner Clarity - Mental Health Services",
  description: "Secure, HIPAA-compliant mental health services and client portal",
  keywords: ["mental health", "therapy", "counseling", "HIPAA", "secure"],
  authors: [{ name: "Inner Clarity Inc." }],
  creator: "Inner Clarity Inc.",
  publisher: "Inner Clarity Inc.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://patients.nextphaseit.org",
    title: "Inner Clarity - Mental Health Services",
    description: "Secure, HIPAA-compliant mental health services and client portal",
    siteName: "Inner Clarity",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inner Clarity - Mental Health Services",
    description: "Secure, HIPAA-compliant mental health services and client portal",
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ToastProvider>
              <div className="min-h-screen bg-background">{children}</div>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
