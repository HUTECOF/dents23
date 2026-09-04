"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export type TratamientoDiente = "RS" | "EXT" | "QX" | "END" | "CORONA" | "LIMPIEZA" | ""

export interface DienteData {
  numero: number
  tratamientos: TratamientoDiente[]
}

export interface OdontogramaData {
  dientes: Record<number, DienteData>
}

export interface OdontogramaProps {
  value: OdontogramaData
  onChange: (data: OdontogramaData) => void
  notasMedico?: string
  onNotasMedicoChange?: (notas: string) => void
}

const TRATAMIENTOS: { id: TratamientoDiente; label: string; color: string; bg: string; border: string }[] = [
  { id: "RS",       label: "RS (Resina)",      color: "text-blue-700",   bg: "bg-blue-100",   border: "border-blue-400" },
  { id: "EXT",      label: "EXT (Extracción)", color: "text-red-700",    bg: "bg-red-100",    border: "border-red-400" },
  { id: "QX",       label: "QX (Cirugía)",     color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-400" },
  { id: "END",      label: "END (Endodoncia)", color: "text-purple-700", bg: "bg-purple-100", border: "border-purple-400" },
  { id: "CORONA",   label: "CORONA",           color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-400" },
  { id: "LIMPIEZA", label: "LIMPIEZA",         color: "text-green-700",  bg: "bg-green-100",  border: "border-green-400" },
]

const COLOR_MAP: Record<TratamientoDiente, string> = {
  "RS":       "#3B82F6",
  "EXT":      "#EF4444",
  "QX":       "#F97316",
  "END":      "#A855F7",
  "CORONA":   "#EAB308",
  "LIMPIEZA": "#22C55E",
  "":         "#E5E7EB",
}

const UPPER_RIGHT = [18,17,16,15,14,13,12,11]
const UPPER_LEFT  = [21,22,23,24,25,26,27,28]
const LOWER_LEFT  = [31,32,33,34,35,36,37,38]
const LOWER_RIGHT = [48,47,46,45,44,43,42,41]
const ALL_TEETH   = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT]

export function generateTratamientoText(data: OdontogramaData): { tratamiento: string; diagnostico: string } {
  const groups: Record<TratamientoDiente, number[]> = {
    RS: [], EXT: [], QX: [], END: [], CORONA: [], LIMPIEZA: [], "": []
  }
  Object.values(data.dientes).forEach(d => {
    d.tratamientos.forEach(tx => {
      if (tx) groups[tx].push(d.numero)
    })
  })

  const lines: string[] = []
  const diag: string[] = []

  if (groups.RS.length)      lines.push(`RS: ${[...new Set(groups.RS)].sort((a,b)=>a-b).join(", ")}`)
  if (groups.EXT.length) {
    const sorted = [...new Set(groups.EXT)].sort((a,b)=>a-b)
    lines.push(`EXT: ${sorted.join(", ")}`)
    diag.push(`Extracción(es) órgano(s) ${sorted.join(", ")}`)
  }
  if (groups.QX.length) {
    const sorted = [...new Set(groups.QX)].sort((a,b)=>a-b)
    lines.push(`QX: ${sorted.join(", ")}`)
    diag.push(`Cirugía(s) órgano(s) ${sorted.join(", ")}`)
  }
  if (groups.END.length)     lines.push(`END: ${[...new Set(groups.END)].sort((a,b)=>a-b).join(", ")}`)
  if (groups.CORONA.length)  lines.push(`CORONA: ${[...new Set(groups.CORONA)].sort((a,b)=>a-b).join(", ")}`)
  if (groups.LIMPIEZA.length) lines.push("LIMPIEZA DENTAL COMPLETA")

  return {
    tratamiento: lines.join(" | "),
    diagnostico: diag.length ? diag.join("; ") : lines.join("; "),
  }
}

function ToothSVG({ numero, tratamientos, onClick }: {
  numero: number
  tratamientos: TratamientoDiente[]
  onClick: () => void
}) {
  const active = tratamientos.filter(Boolean) as TratamientoDiente[]
  const isUpper = numero <= 28
  const hasTx = active.length > 0
  const primaryColor = hasTx ? COLOR_MAP[active[0]] : "#E5E7EB"
  const label = hasTx ? active.join("+") : ""

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Diente ${numero}${hasTx ? ` — ${active.join(", ")}` : ""}`}
      className="flex flex-col items-center gap-0.5 group focus:outline-none"
    >
      {isUpper && (
        <span className="text-[9px] font-bold text-gray-500 group-hover:text-gray-800 leading-none">{numero}</span>
      )}

      <svg width="22" height="28" viewBox="0 0 22 28" className="transition-transform group-hover:scale-110">
        <path
          d={isUpper
            ? "M7 14 Q5 22 6 27 Q11 24 16 27 Q17 22 15 14 Z"
            : "M7 14 Q5 6  6 1  Q11 4  16 1  Q17 6  15 14 Z"}
          fill={hasTx ? primaryColor : "#D1D5DB"}
          stroke="#9CA3AF"
          strokeWidth="0.8"
        />
        <rect
          x="4" y={isUpper ? "2" : "14"}
          width="14" height="12"
          rx="3"
          fill={primaryColor}
          stroke={hasTx ? primaryColor : "#9CA3AF"}
          strokeWidth="1"
        />
        {hasTx && (
          <text
            x="11"
            y={isUpper ? "10" : "22"}
            textAnchor="middle"
            fontSize={active.length > 1 ? "4" : "5.5"}
            fontWeight="bold"
            fill="white"
            fontFamily="Arial"
          >
            {label}
          </text>
        )}
      </svg>

      {!isUpper && (
        <span className="text-[9px] font-bold text-gray-500 group-hover:text-gray-800 leading-none">{numero}</span>
      )}
    </button>
  )
}

export default function Odontograma({ value, onChange, notasMedico, onNotasMedicoChange }: OdontogramaProps) {
  const [activeTx, setActiveTx] = useState<TratamientoDiente>("RS")

  const getTratamientos = (n: number): TratamientoDiente[] =>
    value.dientes[n]?.tratamientos ?? []

  const handleToothClick = (n: number) => {
    const current = getTratamientos(n)
    let next: TratamientoDiente[]
    if (current.includes(activeTx)) {
      next = current.filter(t => t !== activeTx)
    } else {
      next = [...current, activeTx]
    }
    onChange({
      dientes: {
        ...value.dientes,
        [n]: { numero: n, tratamientos: next }
      }
    })
  }

  const applyLimpiezaAll = () => {
    const newDientes: OdontogramaData["dientes"] = { ...value.dientes }
    ALL_TEETH.forEach(n => {
      const current = newDientes[n]?.tratamientos ?? []
      if (!current.includes("LIMPIEZA")) {
        newDientes[n] = { numero: n, tratamientos: [...current, "LIMPIEZA"] }
      }
    })
    onChange({ dientes: newDientes })
  }

  const clearAll = () => onChange({ dientes: {} })

  const { tratamiento, diagnostico } = generateTratamientoText(value)
  const hasAny = Object.values(value.dientes).some(d => d.tratamientos.some(Boolean))

  const Row = ({ teeth }: { teeth: number[] }) => (
    <div className="flex gap-1 justify-center items-end">
      {teeth.map(n => (
        <ToothSVG
          key={n}
          numero={n}
          tratamientos={getTratamientos(n)}
          onClick={() => handleToothClick(n)}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Treatment palette */}
      <div className="flex flex-wrap gap-2 justify-center">
        {TRATAMIENTOS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTx(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
              activeTx === t.id
                ? `${t.bg} ${t.color} ${t.border} scale-105 shadow-md`
                : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            {activeTx === t.id ? "✓ " : ""}{t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={applyLimpiezaAll}
          title="Aplica LIMPIEZA a todos los dientes"
          className="px-3 py-1.5 rounded-full text-xs font-bold border-2 border-green-400 text-green-700 bg-green-50 hover:bg-green-100 transition-all"
        >
          🦷 LIMPIEZA a todos
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="px-3 py-1.5 rounded-full text-xs font-bold border-2 border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all"
        >
          🗑 Limpiar todo
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-500">
        Selecciona un tratamiento y haz clic en el diente — puedes agregar varios tratamientos al mismo diente
      </p>

      {/* Dental chart */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4 overflow-x-auto">
        <div className="min-w-[440px]">
          <div className="flex justify-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-gray-400 self-center">D</span>
            <Row teeth={UPPER_RIGHT} />
            <div className="w-px bg-gray-300 mx-1" />
            <Row teeth={UPPER_LEFT} />
            <span className="text-[10px] font-bold text-gray-400 self-center">I</span>
          </div>

          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            <span className="text-[10px] text-gray-400 font-bold px-2 bg-gray-50 rounded">─── SUPERIOR / INFERIOR ───</span>
            <div className="flex-1 border-t-2 border-dashed border-gray-300" />
          </div>

          <div className="flex justify-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-gray-400 self-center">D</span>
            <Row teeth={LOWER_RIGHT} />
            <div className="w-px bg-gray-300 mx-1" />
            <Row teeth={LOWER_LEFT} />
            <span className="text-[10px] font-bold text-gray-400 self-center">I</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center">
        {TRATAMIENTOS.map(t => (
          <span key={t.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${t.bg} ${t.color}`}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLOR_MAP[t.id] }} />
            {t.label}
          </span>
        ))}
      </div>

      {/* Summary */}
      {hasAny && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyan-50 border-2 border-cyan-300 rounded-lg p-3 space-y-1.5"
        >
          <p className="text-[11px] font-bold text-cyan-800 uppercase">📋 Resumen — se copiará al formulario de autorización</p>
          <div>
            <span className="text-[10px] font-bold text-gray-600">TRATAMIENTO: </span>
            <span className="text-[11px] text-gray-800">{tratamiento || "—"}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-600">DIAGNÓSTICO: </span>
            <span className="text-[11px] text-gray-800">{diagnostico || "—"}</span>
          </div>
        </motion.div>
      )}

      {/* Doctor notes */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">📝 Notas del Médico Tratante</label>
        <textarea
          value={notasMedico ?? ""}
          onChange={(e) => onNotasMedicoChange?.(e.target.value)}
          placeholder="Observaciones clínicas, indicaciones especiales o notas adicionales del médico tratante..."
          rows={4}
          className="w-full rounded-lg border-2 border-gray-200 focus:border-cyan-400 focus:outline-none px-3 py-2 text-sm text-gray-800 resize-none"
        />
      </div>
    </div>
  )
}
