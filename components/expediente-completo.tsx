"use client"

interface ExpedienteCompletoProps {
  data: Record<string, unknown> | null | undefined
}

const SECTION_LABELS: Record<string, string> = {
  historiaClinica: "Historia clínica completa",
  odontograma: "Odontograma",
  notasMedico: "Notas del médico",
  planTratamiento: "Plan de tratamiento",
  autorizacionConsentimiento: "Autorización y consentimiento",
  contrato: "Contrato",
  contratoBancario: "Contrato bancario",
  consentimiento: "Consentimiento informado",
  pagoParticular: "Pago particular",
  financiamientoBancario: "Financiamiento bancario",
}

function formatLabel(key: string) {
  return key
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (character) => character.toUpperCase())
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false
  if (Array.isArray(value)) return value.some(hasValue)
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(hasValue)
  return true
}

function isImageValue(key: string, value: string) {
  const normalizedKey = key.toLowerCase()
  const imageKey = normalizedKey.includes("firma") || normalizedKey.includes("foto") || normalizedKey.includes("ine")
  return imageKey && (value.startsWith("data:image/") || value.startsWith("http://") || value.startsWith("https://"))
}

function ScalarValue({ fieldKey, value }: { fieldKey: string; value: string | number | boolean }) {
  if (typeof value === "string" && isImageValue(fieldKey, value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className="block">
        <img src={value} alt={formatLabel(fieldKey)} className="max-h-48 w-auto rounded-lg border bg-white object-contain" />
      </a>
    )
  }

  if (typeof value === "boolean") return <span>{value ? "Sí" : "No"}</span>
  if (value === "si") return <span>Sí</span>
  if (value === "no") return <span>No</span>
  if (value === "no_recuerdo") return <span>No recuerda</span>
  if (value === "nunca_tomada") return <span>Nunca se ha medido</span>

  return <span className="whitespace-pre-wrap break-words">{String(value)}</span>
}

function DataValue({ fieldKey, value, depth = 0 }: { fieldKey: string; value: unknown; depth?: number }) {
  if (!hasValue(value)) return null

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={`${fieldKey}-${index}`} className="rounded-lg border bg-background/60 p-3">
            <DataValue fieldKey={`${fieldKey} ${index + 1}`} value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => hasValue(item))
    if (entries.length === 0) return null

    return (
      <div className={`grid gap-3 ${depth < 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        {entries.map(([key, item]) => (
          <div key={key} className="min-w-0 rounded-lg border bg-background/40 p-3">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">{formatLabel(key)}</p>
            <DataValue fieldKey={key} value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    )
  }

  return <ScalarValue fieldKey={fieldKey} value={value as string | number | boolean} />
}

export function ExpedienteCompleto({ data }: ExpedienteCompletoProps) {
  const sections = Object.entries(data || {}).filter(([key, value]) => key !== "version" && hasValue(value))

  if (sections.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay datos completos capturados.</p>
  }

  return (
    <div className="space-y-3">
      {sections.map(([key, value]) => (
        <details key={key} open={key === "historiaClinica"} className="rounded-xl border bg-card/60">
          <summary className="cursor-pointer px-4 py-3 font-semibold">
            {SECTION_LABELS[key] || formatLabel(key)}
          </summary>
          <div className="border-t p-4">
            <DataValue fieldKey={key} value={value} />
          </div>
        </details>
      ))}
    </div>
  )
}
