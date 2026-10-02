"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarDays,
  ChevronRight,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  UsersRound,
  X,
} from "lucide-react"
import { logout } from "@/lib/auth-helpers"

const navItems = [
  { href: "/crm", label: "Inicio", icon: LayoutDashboard },
  { href: "/crm/pacientes", label: "Pacientes", icon: UsersRound },
  { href: "/crm/citas", label: "Agenda", icon: CalendarDays },
  { href: "/crm/pagos", label: "Finanzas", icon: ReceiptText },
]

const titles: Record<string, { title: string; eyebrow: string }> = {
  "/crm": { title: "Centro de operaciones", eyebrow: "Resumen de la clínica" },
  "/crm/pacientes": { title: "Pacientes", eyebrow: "Expedientes y prospectos" },
  "/crm/pacientes/detalle": { title: "Expediente clínico", eyebrow: "Vista integral del paciente" },
  "/crm/citas": { title: "Agenda clínica", eyebrow: "Citas y seguimientos" },
  "/crm/pagos": { title: "Finanzas", eyebrow: "Pagos y planes" },
}

export function CRMShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const normalizedPath = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname

  if (normalizedPath === "/crm/login") return <>{children}</>

  const page = titles[normalizedPath] || titles["/crm"]

  const handleLogout = async () => {
    await logout()
    router.push("/crm/login")
  }

  const sidebar = (
    <aside className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0c272b] text-white shadow-[0_30px_80px_rgba(8,38,42,.24)]">
      <div className="flex items-center gap-3 px-5 pb-7 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white p-2 shadow-lg shadow-black/10">
          <Image src="/dents23-logo-final.png" alt="Dent's 23" width={42} height={42} className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight">Dent&apos;s 23</p>
          <p className="text-[11px] font-medium uppercase tracking-[.18em] text-teal-200/65">Clinical suite</p>
        </div>
      </div>

      <nav className="space-y-1.5 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white/35">Espacio de trabajo</p>
        {navItems.map((item) => {
          const active = item.href === "/crm" ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all ${
                active
                  ? "bg-[#a8ddf7] text-[#102b2d] shadow-[0_10px_30px_rgba(111,196,235,.18)]"
                  : "text-white/65 hover:bg-white/[.07] hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-4 w-4 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      <div className="mx-4 mt-auto rounded-2xl border border-white/10 bg-white/[.055] p-4">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-[#a8ddf7] text-[#143034]">
          <HeartPulse className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold">Todo en un solo lugar</p>
        <p className="mt-1 text-xs leading-5 text-white/50">Expedientes, citas y pagos conectados.</p>
      </div>

      <div className="mt-3 space-y-1 px-3 pb-4">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/55 transition hover:bg-rose-400/10 hover:text-rose-200">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#f3f7f5] text-[#143034]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(165,226,207,.28),transparent_28rem)]" />

      <div className="fixed inset-y-0 left-0 z-40 hidden w-[272px] p-4 lg:block">{sidebar}</div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Cerrar menú" className="absolute inset-0 bg-[#071b1d]/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-3 left-3 w-[270px]">{sidebar}</div>
          <button aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 grid h-10 w-10 place-items-center rounded-full bg-white text-[#143034] shadow-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <main className="relative min-h-screen lg:pl-[272px]">
        <header className="flex h-[76px] items-center gap-4 border-b border-[#dce8e3] bg-[#f3f7f5]/80 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <button aria-label="Abrir menú" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#d9e7e1] bg-white lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#5e7b75]">{page.eyebrow}</p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-[-.025em] text-[#102b2d]">{page.title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#173638]">Equipo clínico</p>
              <p className="text-xs text-[#78908b]">Administrador</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#173c3e] text-xs font-bold text-[#d9fa8d]">DC</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
