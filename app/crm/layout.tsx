import type React from "react"
import { CRMShell } from "@/components/crm-shell"
export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="light"><CRMShell>{children}</CRMShell></div>
}
