import type { ReactNode } from "react"
import type { Metadata } from "next"
import { PortalLayout } from "@/components/portal-layout"

export const metadata: Metadata = {
  title: "Patient Portal | Inner Clarity Inc",
  description: "Access your mental health resources and appointments",
}

export default function Layout({ children }: { children: ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>
}
