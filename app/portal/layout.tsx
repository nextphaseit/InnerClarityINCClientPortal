import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Patient Portal | Inner Clarity",
  description: "Access your mental health resources and appointments",
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
