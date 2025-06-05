import type { ReactNode } from "react"
import type { Metadata } from "next"
import PatientAuthProvider from "@/components/patient-auth-provider"
import { PatientLayoutClient } from "@/components/patient-layout-client"

export const metadata: Metadata = {
  title: "Patient Portal | Inner Clarity",
  description: "Access your mental health resources and appointments",
}

interface PortalLayoutProps {
  children: ReactNode
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <PatientAuthProvider>
      <PatientLayoutClient>{children}</PatientLayoutClient>
    </PatientAuthProvider>
  )
}
