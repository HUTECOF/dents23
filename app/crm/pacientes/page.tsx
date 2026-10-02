"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Activity, AlertCircle, ArrowRight, BriefcaseBusiness, Check, ChevronRight,
  ClipboardPlus, FileHeart, Filter, HeartPulse, Mail, MapPin, MoreHorizontal,
  Phone, Plus, RefreshCw, Search, ShieldCheck, UserRound, UsersRound,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isAuthenticated } from "@/lib/auth-helpers"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpedienteCompleto } from "@/components/expediente-completo"

type RecordKind = "paciente" | "prospecto"
type CRMRecord = {
  id: string; kind: RecordKind; patientId?: string; historyId?: string; name: string
  phone: string; email: string; company: string; occupation: string; address: string
  age: string; sex: string; type: string; status: string; priority: string
  createdAt?: string; notes?: string; fullData?: Record<string, unknown>; raw: any
}

const panel = "rounded-[24px] border border-[#dce8e3] bg-white shadow-[0_18px_50px_rgba(31,70,65,.055)]"
const clean = (value: unknown) => (value === null || value === undefined ? "" : String(value))
const initials = (name: string) => name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?"
const prettyStatus = (status: string) => (status || "nuevo").replaceAll("_", " ").replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())

function formatDate(value?: string) {
  if (!value) return "Sin fecha"
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
}

function statusStyle(status: string) {
  if (["activo", "en_tratamiento", "convertido"].includes(status)) return "bg-emerald-50 text-emerald-700 ring-emerald-100"
  if (["inactivo", "rechazado"].includes(status)) return "bg-slate-100 text-slate-600 ring-slate-200"
  if (status === "recuperacion") return "bg-violet-50 text-violet-700 ring-violet-100"
  return "bg-sky-50 text-sky-700 ring-sky-100"
}

function InfoLine({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[#f6f9f7] p-3.5">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#33736e] shadow-sm"><Icon className="h-4 w-4" /></div>
      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#8aa09b]">{label}</p><p className="mt-0.5 break-words text-sm font-medium text-[#294947]">{value || "No capturado"}</p></div>
    </div>
  )
}

export default function PacientesPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<any[]>([])
  const [histories, setHistories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"todos" | RecordKind>("todos")
  const [status, setStatus] = useState("todos")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fullRecord, setFullRecord] = useState<CRMRecord | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [newPatient, setNewPatient] = useState({ name: "", phone: "", email: "", company: "", type: "particular" })

  useEffect(() => { isAuthenticated().then((valid) => { if (!valid) router.push("/crm/login") }) }, [router])

  const fetchData = async () => {
    setLoading(true)
    const [patientResult, historyResult] = await Promise.all([
      supabase.from("pacientes").select("*").order("created_at", { ascending: false }),
      supabase.from("historias_clinicas").select("*").order("created_at", { ascending: false }),
    ])
    if (patientResult.error) toast.error("No se pudieron cargar los pacientes")
    if (historyResult.error) toast.error("No se pudieron cargar los expedientes")
    setPatients(patientResult.data || [])
    setHistories(historyResult.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const channel = supabase.channel("crm-patient-workspace")
      .on("postgres_changes", { event: "*", schema: "public", table: "pacientes" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "historias_clinicas" }, fetchData).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const records = useMemo<CRMRecord[]>(() => {
    const patientHistoryIds = new Set(patients.map((patient) => patient.historia_clinica_id).filter(Boolean))
    const historiesById = new Map(histories.map((history) => [history.id, history]))
    const patientRecords = patients.map((patient): CRMRecord => {
      const history = historiesById.get(patient.historia_clinica_id)
      const captured = history?.datos_completos?.historiaClinica || history?.datos_completos || {}
      return {
        id: `paciente-${patient.id}`, kind: "paciente", patientId: patient.id, historyId: patient.historia_clinica_id,
        name: clean(patient.nombre_completo || history?.nombre || captured.nombre || "Sin nombre"),
        phone: clean(patient.telefono || history?.celular || history?.telefono || captured.celular),
        email: clean(patient.email || history?.email || captured.email), company: clean(patient.empresa || history?.empresa || captured.empresa),
        occupation: clean(patient.ocupacion || history?.ocupacion || captured.ocupacion), address: clean(patient.direccion || history?.direccion || captured.direccion),
        age: clean(patient.edad || history?.edad || captured.edad), sex: clean(patient.sexo || history?.sexo || captured.sexo),
        type: clean(history?.tipo_paciente || captured.tipoPaciente || patient.tipo_paciente), status: clean(patient.estado || "activo"),
        priority: clean(patient.prioridad || "media"), createdAt: patient.created_at || history?.created_at, notes: clean(patient.notas),
        fullData: history?.datos_completos, raw: patient,
      }
    })
    const prospectRecords = histories.filter((history) => !history.convertido_paciente && !patientHistoryIds.has(history.id)).map((history): CRMRecord => {
      const captured = history.datos_completos?.historiaClinica || history.datos_completos || {}
      return {
        id: `prospecto-${history.id}`, kind: "prospecto", historyId: history.id,
        name: clean(history.nombre || captured.nombre || captured.nombreCompleto || "Sin nombre"),
        phone: clean(history.celular || history.telefono || captured.celular || captured.telefono), email: clean(history.email || captured.email),
        company: clean(history.empresa || captured.empresa), occupation: clean(history.ocupacion || captured.ocupacion),
        address: clean(history.direccion || captured.direccion), age: clean(history.edad || captured.edad), sex: clean(history.sexo || captured.sexo),
        type: clean(history.tipo_paciente || captured.tipoPaciente), status: clean(history.estado_prospecto || "prospecto"), priority: "media",
        createdAt: history.created_at, notes: clean(history.notas_medico), fullData: history.datos_completos, raw: history,
      }
    })
    return [...prospectRecords, ...patientRecords].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [patients, histories])

  const filtered = useMemo(() => records.filter((record) => {
    const haystack = `${record.name} ${record.phone} ${record.email} ${record.company}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) && (view === "todos" || record.kind === view) && (status === "todos" || record.status === status)
  }), [records, query, view, status])

  useEffect(() => { if (!filtered.some((record) => record.id === selectedId)) setSelectedId(filtered[0]?.id || null) }, [filtered, selectedId])
  const selected = filtered.find((record) => record.id === selectedId) || null
  const patientCount = records.filter((record) => record.kind === "paciente").length
  const prospectCount = records.filter((record) => record.kind === "prospecto").length
  const treatmentCount = records.filter((record) => record.status === "en_tratamiento").length
  const completeCount = records.filter((record) => record.fullData && Object.keys(record.fullData).length > 0).length

  const createPatient = async () => {
    if (!newPatient.name.trim() || !newPatient.phone.trim()) return void toast.error("Nombre y teléfono son obligatorios")
    const { error } = await supabase.from("pacientes").insert({
      nombre_completo: newPatient.name.trim(), telefono: newPatient.phone.trim(), email: newPatient.email.trim() || null,
      empresa: newPatient.company.trim() || null, tipo_paciente: newPatient.type, estado: "activo", prioridad: "media",
    })
    if (error) return void toast.error(`No se pudo crear: ${error.message}`)
    toast.success("Paciente creado")
    setNewOpen(false); setNewPatient({ name: "", phone: "", email: "", company: "", type: "particular" }); fetchData()
  }

  const convertProspect = async (record: CRMRecord) => {
    if (!record.historyId) return
    const { error } = await supabase.rpc("convertir_prospecto_a_paciente", { historia_id: record.historyId })
    if (error) return void toast.error(`No se pudo convertir: ${error.message}`)
    toast.success("Prospecto convertido a paciente"); fetchData()
  }

  return (
    <div className="p-4 sm:p-7 lg:p-9">
      <section className="relative mb-6 overflow-hidden rounded-[28px] bg-[#12393b] px-6 py-7 text-white shadow-[0_24px_65px_rgba(18,57,59,.16)] sm:px-8">
        <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[42px] border-[#8dd8ff]/15" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div><div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-100">Base clínica sincronizada</div><h2 className="max-w-xl text-2xl font-semibold tracking-[-.035em] sm:text-3xl">Cada paciente, con su historia completa y lista para actuar.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Consulta los datos recién capturados, detecta alertas y continúa el seguimiento sin salir de esta pantalla.</p></div>
          <Button onClick={() => setNewOpen(true)} className="h-11 rounded-2xl bg-[#8dd8ff] px-5 font-semibold text-[#12313d] shadow-none hover:bg-[#b4e7ff]"><Plus className="mr-2 h-4 w-4" /> Nuevo paciente</Button>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Pacientes", value: patientCount, note: "expedientes activos", icon: UsersRound, color: "#27766f" },
          { label: "Prospectos", value: prospectCount, note: "por convertir", icon: Activity, color: "#a06b1f" },
          { label: "En tratamiento", value: treatmentCount, note: "seguimiento activo", icon: HeartPulse, color: "#6d55a3" },
          { label: "Expedientes", value: completeCount, note: "con captura completa", icon: ShieldCheck, color: "#287293" },
        ].map(({ label, value, note, icon: Icon, color }) => (
          <div key={label} className={`${panel} p-4 sm:p-5`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-[#748d87]">{label}</p><p className="mt-2 text-3xl font-semibold tracking-[-.05em] text-[#163638]">{value}</p><p className="mt-1 hidden text-xs text-[#9aada9] sm:block">{note}</p></div><div className="grid h-10 w-10 place-items-center rounded-2xl" style={{ color, backgroundColor: `${color}14` }}><Icon className="h-5 w-5" /></div></div></div>
        ))}
      </section>

      <section className={`${panel} mb-5 p-3`}><div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex rounded-2xl bg-[#f1f6f3] p-1">{(["todos", "paciente", "prospecto"] as const).map((item) => <button key={item} onClick={() => setView(item)} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition xl:flex-none ${view === item ? "bg-white text-[#173b3d] shadow-sm" : "text-[#78918b] hover:text-[#173b3d]"}`}>{item === "todos" ? "Todos" : `${item}s`}</button>)}</div>
        <div className="relative min-w-0 flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89a09a]" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, teléfono, correo o empresa…" className="h-11 rounded-2xl border-0 bg-[#f5f8f6] pl-11 shadow-none focus-visible:ring-[#88bdb5]" /></div>
        <div className="flex items-center gap-2"><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-11 flex-1 rounded-2xl border-[#dce8e3] bg-white xl:w-48 xl:flex-none"><Filter className="mr-2 h-4 w-4 text-[#6f8983]" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos los estados</SelectItem><SelectItem value="prospecto">Prospecto</SelectItem><SelectItem value="activo">Activo</SelectItem><SelectItem value="en_tratamiento">En tratamiento</SelectItem><SelectItem value="recuperacion">Recuperación</SelectItem><SelectItem value="inactivo">Inactivo</SelectItem></SelectContent></Select><Button variant="outline" size="icon" onClick={fetchData} disabled={loading} className="h-11 w-11 rounded-2xl border-[#dce8e3]"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button></div>
      </div></section>

      <section className="grid min-h-[590px] gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(390px,.85fr)]">
        <div className={`${panel} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-[#e4ece8] px-5 py-4"><div><h3 className="font-semibold text-[#173638]">Directorio clínico</h3><p className="text-xs text-[#839992]">{filtered.length} registros encontrados</p></div><button className="grid h-9 w-9 place-items-center rounded-xl text-[#78908a] hover:bg-[#f2f6f4]"><MoreHorizontal className="h-5 w-5" /></button></div>
          {loading ? <div className="grid min-h-[480px] place-items-center"><RefreshCw className="h-7 w-7 animate-spin text-[#377c75]" /></div> : filtered.length === 0 ? <div className="grid min-h-[480px] place-items-center p-8 text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#f1f6f3] text-[#89a29c]"><UsersRound className="h-7 w-7" /></div><p className="mt-4 font-semibold">No encontramos coincidencias</p><p className="mt-1 text-sm text-[#829791]">Cambia los filtros o agrega un paciente.</p></div></div> : (
            <div className="max-h-[640px] overflow-y-auto p-2.5">{filtered.map((record) => (
              <button key={record.id} onClick={() => setSelectedId(record.id)} className={`group mb-1.5 flex w-full items-center gap-3 rounded-[18px] border p-3.5 text-left transition ${selected?.id === record.id ? "border-[#a9d6cd] bg-[#eef8f4]" : "border-transparent hover:border-[#e2ebe7] hover:bg-[#f8faf9]"}`}>
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-bold ${record.kind === "prospecto" ? "bg-sky-100 text-sky-800" : "bg-[#d9eeea] text-[#286a65]"}`}>{initials(record.name)}</div>
                <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold text-[#173638]">{record.name}</p>{record.fullData && <Check className="h-3.5 w-3.5 shrink-0 rounded-full bg-emerald-600 p-0.5 text-white" />}</div><div className="mt-1 flex items-center gap-3 text-xs text-[#7d938d]"><span className="truncate">{record.phone || "Sin teléfono"}</span><span className="h-1 w-1 shrink-0 rounded-full bg-[#bbcac6]" /><span className="truncate">{record.company || record.type || "Particular"}</span></div></div>
                <span className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 sm:inline ${statusStyle(record.status)}`}>{prettyStatus(record.status)}</span><ChevronRight className={`h-4 w-4 shrink-0 transition ${selected?.id === record.id ? "text-[#347a72]" : "text-[#b5c3bf] group-hover:translate-x-0.5"}`} />
              </button>
            ))}</div>
          )}
        </div>

        <div className={`${panel} overflow-hidden`}>
          {!selected ? <div className="grid h-full min-h-[560px] place-items-center p-8 text-center"><div><UserRound className="mx-auto h-10 w-10 text-[#afbfbb]" /><p className="mt-3 font-semibold">Selecciona un registro</p><p className="mt-1 text-sm text-[#859993]">Aquí verás toda su información.</p></div></div> : <div>
            <div className="relative overflow-hidden border-b border-[#e1ebe7] bg-[#f5faf7] p-5 sm:p-6"><div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-12 rounded-full border-[24px] border-[#8dd8ff]/30" /><div className="relative flex items-start gap-4"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-[#163b3d] text-lg font-semibold text-[#b7e7ff] shadow-lg shadow-[#173b3d]/10">{initials(selected.name)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${statusStyle(selected.status)}`}>{prettyStatus(selected.status)}</span><span className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#8ba09b]">{selected.kind}</span></div><h3 className="mt-2 truncate text-xl font-semibold tracking-[-.03em] text-[#143436]">{selected.name}</h3><p className="mt-0.5 text-xs text-[#829791]">Registro del {formatDate(selected.createdAt)}</p></div></div></div>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-2.5"><InfoLine icon={Phone} label="Teléfono" value={selected.phone} /><InfoLine icon={Mail} label="Correo" value={selected.email} /><InfoLine icon={BriefcaseBusiness} label="Empresa" value={selected.company} /><InfoLine icon={MapPin} label="Dirección" value={selected.address} /></div>
              <div><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#78908a]">Lectura rápida</p><span className="text-xs text-[#96aaa5]">{selected.age ? `${selected.age} años` : "Edad pendiente"}</span></div><div className="grid grid-cols-3 gap-2"><div className="rounded-2xl border border-[#e4ece9] p-3"><p className="text-[10px] uppercase text-[#91a49f]">Tipo</p><p className="mt-1 truncate text-sm font-semibold capitalize">{selected.type || "Particular"}</p></div><div className="rounded-2xl border border-[#e4ece9] p-3"><p className="text-[10px] uppercase text-[#91a49f]">Sexo</p><p className="mt-1 truncate text-sm font-semibold capitalize">{selected.sex || "—"}</p></div><div className="rounded-2xl border border-[#e4ece9] p-3"><p className="text-[10px] uppercase text-[#91a49f]">Prioridad</p><p className="mt-1 truncate text-sm font-semibold capitalize">{selected.priority}</p></div></div></div>
              {selected.fullData ? <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white"><FileHeart className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-emerald-900">Expediente capturado</p><p className="text-xs text-emerald-700/70">Historia, documentos y respuestas disponibles.</p></div><Check className="h-5 w-5 text-emerald-600" /></div> : <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4"><AlertCircle className="h-5 w-5 text-sky-700" /><div><p className="text-sm font-semibold text-sky-900">Expediente por completar</p><p className="text-xs text-sky-700/70">Este registro aún no tiene captura clínica vinculada.</p></div></div>}
              <div className="flex flex-col gap-2 sm:flex-row">{selected.kind === "paciente" && selected.patientId ? <Button onClick={() => router.push(`/crm/pacientes/detalle?id=${selected.patientId}`)} className="h-11 flex-1 rounded-2xl bg-[#173b3d] text-white hover:bg-[#205154]">Abrir expediente <ArrowRight className="ml-2 h-4 w-4" /></Button> : <Button onClick={() => setFullRecord(selected)} className="h-11 flex-1 rounded-2xl bg-[#173b3d] text-white hover:bg-[#205154]">Ver captura completa <ArrowRight className="ml-2 h-4 w-4" /></Button>}{selected.kind === "prospecto" && <Button onClick={() => convertProspect(selected)} variant="outline" className="h-11 rounded-2xl border-[#bdd7d1] text-[#276d67]"><ClipboardPlus className="mr-2 h-4 w-4" /> Convertir</Button>}</div>
            </div>
          </div>}
        </div>
      </section>

      <Dialog open={!!fullRecord} onOpenChange={(open) => !open && setFullRecord(null)}><DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto rounded-[24px] border-[#dce8e3] p-0"><DialogHeader className="sticky top-0 z-10 border-b bg-white/95 px-6 py-5 backdrop-blur"><DialogTitle className="flex items-center gap-3 text-xl"><FileHeart className="h-5 w-5 text-[#347a72]" /> Expediente de {fullRecord?.name}</DialogTitle><DialogDescription>Todos los datos guardados durante el flujo de registro.</DialogDescription></DialogHeader><div className="p-6"><ExpedienteCompleto data={fullRecord?.fullData} /></div></DialogContent></Dialog>

      <Dialog open={newOpen} onOpenChange={setNewOpen}><DialogContent className="rounded-[24px] border-[#dce8e3] sm:max-w-lg"><DialogHeader><DialogTitle className="text-xl">Nuevo paciente</DialogTitle><DialogDescription>Crea un registro rápido. El expediente clínico puede completarse después.</DialogDescription></DialogHeader><div className="grid gap-4 py-2 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label>Nombre completo *</Label><Input value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} className="rounded-xl" placeholder="Nombre y apellidos" /></div><div className="space-y-2"><Label>Teléfono *</Label><Input value={newPatient.phone} onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })} className="rounded-xl" placeholder="477 000 0000" /></div><div className="space-y-2"><Label>Correo</Label><Input type="email" value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} className="rounded-xl" /></div><div className="space-y-2"><Label>Empresa</Label><Input value={newPatient.company} onChange={(e) => setNewPatient({ ...newPatient, company: e.target.value })} className="rounded-xl" /></div><div className="space-y-2"><Label>Tipo</Label><Select value={newPatient.type} onValueChange={(type) => setNewPatient({ ...newPatient, type })}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="particular">Particular</SelectItem><SelectItem value="nomina">Nómina</SelectItem><SelectItem value="bancario">Bancario</SelectItem><SelectItem value="charly">Charly</SelectItem></SelectContent></Select></div></div><DialogFooter><Button variant="ghost" onClick={() => setNewOpen(false)} className="rounded-xl">Cancelar</Button><Button onClick={createPatient} className="rounded-xl bg-[#173b3d] hover:bg-[#205154]">Crear paciente</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}
