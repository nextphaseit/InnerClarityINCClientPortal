import React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "My Awesome App",
  description: "The best app ever!",
  openGraph: {
    title: "My Awesome App",
    description: "The best app ever!",
    url: "https://www.example.com", // Replace with your actual URL
    siteName: "My Awesome App",
    images: [
      {
        url: "https://www.example.com/og.png", // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: "My Awesome App OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Awesome App",
    description: "The best app ever!",
    images: ["https://www.example.com/og.png"], // Replace with your actual OG image URL
    site: "@myawesomeapp", // Replace with your Twitter handle
    creator: "@myawesomeapp", // Replace with your Twitter handle
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
  verification: {
    google: "google", // Replace with your Google verification code
    yandex: "yandex", // Replace with your Yandex verification code
    yahoo: "yahoo", // Replace with your Yahoo verification code
    other: {
      me: ["mail@example.com", "https://www.example.com"],
    },
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <React.Suspense fallback={<p>Loading...</p>}>{children}</React.Suspense>
}
