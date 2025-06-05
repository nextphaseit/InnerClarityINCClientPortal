import type { ReactNode } from "react"
import { PatientLayoutClient } from "@/components/patient-layout-client"
import PatientAuthProvider from "@/components/patient-auth-provider"

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
