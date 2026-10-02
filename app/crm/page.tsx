"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock3, FileHeart,
  HeartPulse, Plus, ReceiptText, RefreshCw, TrendingUp, UsersRound,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isAuthenticated } from "@/lib/auth-helpers"
import { Button } from "@/components/ui/button"

const card = "rounded-[24px] border border-[#dce8e3] bg-white shadow-[0_18px_50px_rgba(31,70,65,.055)]"
const initials = (name: string) => name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?"

export default function CRMDashboard() {
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [histories, setHistories] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { isAuthenticated().then((valid) => { if (!valid) router.push("/crm/login") }) }, [router])

  const fetchData = async () => {
    setLoading(true)
    const [patientsResult, historiesResult, appointmentsResult, paymentsResult] = await Promise.all([
      supabase.from("pacientes").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("historias_clinicas").select("*").eq("convertido_paciente", false).order("created_at", { ascending: false }).limit(8),
      supabase.from("citas").select("*, paciente:pacientes(nombre_completo)").order("fecha_cita", { ascending: true }).limit(8),
      supabase.from("pagos").select("*, paciente:pacientes(nombre_completo)").eq("estado", "pendiente").order("fecha_vencimiento", { ascending: true }).limit(8),
    ])
    setPatients(patientsResult.data || [])
    setHistories(historiesResult.data || [])
    setAppointments(appointmentsResult.data || [])
    setPayments(paymentsResult.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const channel = supabase.channel("crm-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "pacientes" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "citas" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "pagos" }, fetchData).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const today = new Date().toDateString()
  const todayAppointments = appointments.filter((appointment) => new Date(appointment.fecha_cita).toDateString() === today)
  const pendingAmount = payments.reduce((sum, payment) => sum + Number(payment.monto || 0), 0)
  const recentRecords = useMemo(() => [
    ...patients.map((patient) => ({
      id: patient.id, patientId: patient.id, name: patient.nombre_completo || "Sin nombre", phone: patient.telefono,
      state: patient.estado || "activo", date: patient.created_at, kind: "Paciente",
    })),
    ...histories.map((history) => ({
      id: history.id, patientId: undefined, name: history.nombre || history.datos_completos?.historiaClinica?.nombre || "Sin nombre",
      phone: history.celular || history.telefono, state: history.estado_prospecto || "prospecto", date: history.created_at, kind: "Prospecto",
    })),
  ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 7), [patients, histories])

  const nextAppointment = appointments.find((appointment) => new Date(appointment.fecha_cita).getTime() >= Date.now())

  return (
    <div className="p-4 sm:p-7 lg:p-9">
      <section className="relative mb-6 overflow-hidden rounded-[30px] bg-[#12393b] p-7 text-white shadow-[0_25px_70px_rgba(18,57,59,.18)] sm:p-9">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[46px] border-[#8dd8ff]/15" />
        <div className="absolute bottom-0 right-[28%] h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-100">Tu clínica, al día</div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Buenos días. Todo lo importante, sin ruido.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">Revisa el pulso de la clínica, atiende lo urgente y entra a cualquier expediente en segundos.</p>
          </div>
          <Link href="/crm/pacientes"><Button className="h-11 rounded-2xl bg-[#8dd8ff] px-5 font-semibold text-[#12313d] hover:bg-[#b4e7ff]"><Plus className="mr-2 h-4 w-4" /> Abrir pacientes</Button></Link>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Pacientes activos", value: patients.filter((p) => p.estado !== "inactivo").length, icon: UsersRound, accent: "#2d7770", note: "base actual" },
          { label: "Citas de hoy", value: todayAppointments.length, icon: CalendarDays, accent: "#5b63a8", note: "en agenda" },
          { label: "Pagos pendientes", value: `$${pendingAmount.toLocaleString("es-MX")}`, icon: ReceiptText, accent: "#b27729", note: `${payments.length} movimientos` },
          { label: "Prospectos", value: histories.length, icon: TrendingUp, accent: "#33819a", note: "por atender" },
        ].map(({ label, value, icon: Icon, accent, note }) => <div key={label} className={`${card} p-4 sm:p-5`}><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold text-[#748d87]">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-.045em] text-[#163638] sm:text-3xl">{loading ? "—" : value}</p><p className="mt-1 text-[11px] text-[#9aada9]">{note}</p></div><div className="grid h-10 w-10 place-items-center rounded-2xl" style={{ color: accent, backgroundColor: `${accent}14` }}><Icon className="h-5 w-5" /></div></div></div>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)]">
        <div className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#e4ece8] px-5 py-5 sm:px-6"><div><h3 className="font-semibold text-[#173638]">Actividad reciente</h3><p className="mt-0.5 text-xs text-[#839992]">Pacientes y prospectos recién registrados</p></div><Link href="/crm/pacientes" className="flex items-center gap-1 text-xs font-semibold text-[#377a73] hover:text-[#1c524d]">Ver todos <ArrowRight className="h-3.5 w-3.5" /></Link></div>
          <div className="p-2.5">
            {loading ? <div className="grid h-80 place-items-center"><RefreshCw className="h-6 w-6 animate-spin text-[#397a73]" /></div> : recentRecords.length === 0 ? <div className="grid h-80 place-items-center text-center"><div><FileHeart className="mx-auto h-9 w-9 text-[#adc0bb]" /><p className="mt-3 text-sm font-semibold">Aún no hay registros</p><p className="text-xs text-[#8ca09b]">Los nuevos pacientes aparecerán aquí.</p></div></div> : recentRecords.map((record) => (
              <button key={`${record.kind}-${record.id}`} onClick={() => record.patientId ? router.push(`/crm/pacientes/detalle?id=${record.patientId}`) : router.push("/crm/pacientes")} className="group flex w-full items-center gap-3 rounded-[18px] p-3.5 text-left transition hover:bg-[#f4f8f6]">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold ${record.kind === "Prospecto" ? "bg-sky-100 text-sky-800" : "bg-[#dcefeb] text-[#286a65]"}`}>{initials(record.name)}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#1d3d3e]">{record.name}</p><p className="mt-0.5 truncate text-xs text-[#849993]">{record.phone || "Sin teléfono"} · {record.kind}</p></div>
                <span className="hidden rounded-full bg-[#f0f5f3] px-2.5 py-1 text-[10px] font-bold capitalize text-[#69827c] sm:block">{String(record.state).replaceAll("_", " ")}</span><ChevronRight className="h-4 w-4 text-[#b4c4c0] transition group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className={`${card} overflow-hidden`}>
            <div className="bg-[#e8f4f0] p-5"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#31736d] shadow-sm"><Clock3 className="h-5 w-5" /></div><span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#54817b]">Próxima cita</span></div>
              {nextAppointment ? <div className="mt-5"><p className="text-xl font-semibold tracking-tight text-[#173638]">{nextAppointment.paciente?.nombre_completo || "Paciente"}</p><p className="mt-1 text-sm text-[#587a75]">{new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(nextAppointment.fecha_cita))}</p></div> : <div className="mt-5"><p className="font-semibold text-[#173638]">Agenda libre</p><p className="mt-1 text-sm text-[#67827d]">No hay una próxima cita programada.</p></div>}
            </div>
            <div className="p-4"><Link href="/crm/citas"><Button variant="ghost" className="w-full justify-between rounded-xl text-[#2e6f69]">Ir a la agenda <ChevronRight className="h-4 w-4" /></Button></Link></div>
          </div>

          <div className={`${card} p-5`}><div className="mb-4 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><HeartPulse className="h-5 w-5" /></div><div><p className="text-sm font-semibold text-[#173638]">Estado operativo</p><p className="text-xs text-[#849993]">Información en tiempo real</p></div></div><div className="space-y-3">{["Base de pacientes conectada", "Agenda sincronizada", "Pagos disponibles"].map((label) => <div key={label} className="flex items-center gap-2 text-xs text-[#5f7a74]"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {label}</div>)}</div></div>
        </div>
      </section>
    </div>
  )
}
