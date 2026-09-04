import type React from "react"
export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="light">{children}</div>
}
