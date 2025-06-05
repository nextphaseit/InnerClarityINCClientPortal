import type React from "react"
import type { Metadata } from "next/metadata"
import PatientAuthProvider from "@/components/patient-auth-provider"
import { PatientLayoutClient } from "@/components/patient-layout-client"

export const metadata: Metadata = {
  title: "Patient Portal | Inner Clarity",
  description: "Access your mental health resources and appointments",
}

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PatientAuthProvider>
      <PatientLayoutClient>{children}</PatientLayoutClient>
    </PatientAuthProvider>
  )
}
