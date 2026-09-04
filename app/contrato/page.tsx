"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { patientDataStore } from "@/lib/patient-data-store"
import { saveContrato } from "@/lib/supabase-helpers"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

const DOCTORES = [
  "DR. ERICK MANCILLA",
  "DRA. HUMBELINA HUERTA",
  "DRA. SAMANTHA HERRERA",
  "DR. JERID MONTALVO",
  "DRA. XIMENA (PENDIENTE)",
  "DRA. LAURA",
  "DRA. ABRIL",
  "DR. JORGE",
  "DRA. LIZETH",
  "DR. MIGUEL",
]

const ASISTENTES = ["NAOMI", "HANNIA", "DANIEL"]

export default function ContratoPage() {
  const printRef = useRef<HTMLDivElement>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const [form, setForm] = useState({
    nombreColaborador: "",
    fecha: "",
    nombrePaciente: "",
    parentesco: "",
    cel: "",
    telContacto: "",
    edad: "",
    empresa: "",
    antiguedad: "",
    noNomina: "",
    depto: "",
    area: "",
    diagnostico: "",
    tratamiento: "",
    tratamiento2: "",
    tratamiento3: "",
    costoTotal: "",
    pagoSemanal: "",
    noSemanas: "",
    noIncluye: "",
    pagoEfectivo: "",
    montoCredito: "",
    nombreFirma: "",
    medicoTratante: "",
    diaAutorizacion: "",
    mesAutorizacion: "",
    anioAutorizacion: "",
    nombrePacienteConsentimiento: "",
    aceptaNoCancelacion: false,
    aceptaConsentimiento: false,
    aceptaAutorizacion: false,
  })

  const [errors, setErrors] = useState<{ [k: string]: string }>({})

  useEffect(() => {
    const tx = localStorage.getItem("odontogramaTratamiento") || ""
    const diag = localStorage.getItem("odontogramaDiagnostico") || ""
    const hc = localStorage.getItem("historiaClinicaData")
    let paciente = "", empresa = "", cel = "", edad = ""
    if (hc) {
      try {
        const d = JSON.parse(hc)
        paciente = d.nombre || ""
        empresa = d.empresa || ""
        cel = d.celular || ""
        edad = d.edad || ""
      } catch {}
    }
    setForm(prev => ({
      ...prev,
      tratamiento: tx || prev.tratamiento,
      diagnostico: diag || prev.diagnostico,
      nombrePaciente: paciente || prev.nombrePaciente,
      nombrePacienteConsentimiento: paciente || prev.nombrePacienteConsentimiento,
      empresa: empresa || prev.empresa,
      cel: cel || prev.cel,
      edad: edad || prev.edad,
    }))
  }, [])

  const handleChange = (name: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => { const { [name]: _, ...r } = prev; return r })
  }

  const validate = () => {
    const required = [
      "nombreColaborador", "fecha", "nombrePaciente", "empresa",
      "costoTotal", "pagoSemanal", "noSemanas", "montoCredito",
      "nombreFirma", "medicoTratante",
      "diaAutorizacion", "mesAutorizacion", "anioAutorizacion",
      "nombrePacienteConsentimiento",
    ]
    const newErrors: { [k: string]: string } = {}
    required.forEach(f => {
      if (!form[f as keyof typeof form]) newErrors[f] = "Requerido"
    })
    if (!form.aceptaNoCancelacion) newErrors.aceptaNoCancelacion = "Requerido"
    if (!form.aceptaConsentimiento) newErrors.aceptaConsentimiento = "Requerido"
    if (!form.aceptaAutorizacion) newErrors.aceptaAutorizacion = "Requerido"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleExportPDF = async () => {
    if (!validate()) {
      alert("Por favor completa todos los campos requeridos antes de exportar.")
      return
    }
    setIsExporting(true)
    try {
      const { default: jsPDF } = await import("jspdf")
      const { default: html2canvas } = await import("html2canvas")
      const el = printRef.current
      if (!el) return
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgW = pageW
      const imgH = (canvas.height * pageW) / canvas.width
      let yPos = 0
      let remaining = imgH
      while (remaining > 0) {
        pdf.addImage(imgData, "PNG", 0, -yPos, imgW, imgH)
        remaining -= pageH
        if (remaining > 0) { pdf.addPage(); yPos += pageH }
      }
      pdf.save("Autorizacion_Consentimiento.pdf")

      // Guardar en Supabase
      try {
        const historiaClinicaId = patientDataStore.getHistoriaClinicaId()
        if (historiaClinicaId) {
          await saveContrato(form, historiaClinicaId)
          await supabase.rpc('actualizar_progreso_prospecto', {
            historia_id: historiaClinicaId,
            paso_actual: 'contrato',
            completado: true
          })
        }
      } catch (e) { console.error(e) }

      setShowSuccess(true)
    } finally {
      setIsExporting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleExportPDF()
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">¡Documento Exportado!</h2>
          <p className="text-gray-600 mb-6">El PDF ha sido descargado exitosamente.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setShowSuccess(false)} variant="outline">Regresar al Formulario</Button>
            <Link href="/consentimiento">
              <Button className="bg-[#0891B2] hover:bg-[#0E7490] text-white">Siguiente: Consentimiento</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Inline field helper
  const Line = ({ label, name, w = "flex-1", placeholder = "" }: { label?: string; name: string; w?: string; placeholder?: string }) => (
    <span className={`inline-flex items-end gap-0.5 ${w}`}>
      {label && <span style={{ fontSize: 11, fontWeight: "bold", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>}
      <span className="flex-1 flex flex-col min-w-0">
        <input
          type="text"
          value={String(form[name as keyof typeof form] ?? "")}
          onChange={e => handleChange(name, e.target.value)}
          placeholder={placeholder}
          className={`border-b border-black bg-transparent px-0.5 outline-none w-full ${errors[name] ? "border-red-500" : ""}`}
          style={{ fontSize: 11, lineHeight: "1.5" }}
        />
        {errors[name] && <span style={{ fontSize: 8, color: "red" }}>{errors[name]}</span>}
      </span>
    </span>
  )

  return (
    <div className="min-h-screen bg-gray-200 p-4 light">
      {/* Header */}
      <div className="max-w-[816px] mx-auto mb-3 flex justify-between items-center">
        <Link href="/">
          <Image src="/dents23-logo-final.png" alt="Dent's 23" width={90} height={30} className="object-contain" />
        </Link>
        <Button
          onClick={handleSubmit}
          disabled={isExporting}
          className="bg-[#0891B2] hover:bg-[#0E7490] text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exportando..." : "Exportar PDF"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── DOCUMENTO IMPRIMIBLE ── */}
        <div
          ref={printRef}
          className="bg-white mx-auto shadow-xl"
          style={{ width: 816, fontFamily: "Arial, sans-serif", fontSize: 11, padding: "28px 32px", color: "#000" }}
        >

          {/* ══ SECCIÓN 1 — AUTORIZACIÓN DE DESCUENTOS ══ */}
          <div style={{ border: "2px solid black", marginBottom: 12 }}>

            <div style={{ background: "#000", color: "#fff", textAlign: "center", padding: "5px 0" }}>
              <span style={{ fontSize: 13, fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase" }}>
                AUTORIZACION DE DESCUENTOS PARA TRATAMIENTO DENTAL
              </span>
            </div>

            <div style={{ padding: "10px 14px" }}>

              <p style={{ fontSize: 10.5, textAlign: "center", marginBottom: 8, lineHeight: 1.4 }}>
                Estimado paciente: lea detenidamente este documento y en caso de estar de acuerdo, fírmelo;&nbsp;&nbsp;&nbsp;
                si aún tiene dudas, no firme y solicite más información.
              </p>

              {/* Fila 1 */}
              <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-end" }}>
                <Line label="NOMBRE DEL COLABORADOR:" name="nombreColaborador" w="flex-1" />
                <Line label="FECHA:" name="fecha" w="w-44" placeholder="DD/MM/AAAA" />
              </div>

              {/* Fila 2 */}
              <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-end" }}>
                <Line label="NOMBRE DE PACIENTE:" name="nombrePaciente" w="flex-1" />
                <Line label="PARENTESCO:" name="parentesco" w="w-44" />
              </div>

              {/* Fila 3 */}
              <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-end" }}>
                <Line label="CEL:" name="cel" w="flex-1" />
                <Line label="TEL. DE CONTACTO:" name="telContacto" w="flex-1" />
                <Line label="EDAD:" name="edad" w="w-20" />
              </div>

              {/* Bloque EMPRESA */}
              <div style={{ border: "1px solid black", padding: "6px 8px", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-end" }}>
                  <Line label="EMPRESA" name="empresa" w="flex-1" />
                  <Line label="ANTIGÜEDAD" name="antiguedad" w="w-36" />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <Line label="NO. NOMINA" name="noNomina" w="flex-1" />
                  <Line label="DEPTO." name="depto" w="flex-1" />
                  <Line label="AREA" name="area" w="flex-1" />
                </div>
              </div>

              {/* Bloque DIAGNÓSTICO / TRATAMIENTO */}
              <div style={{ border: "1px solid black", padding: "6px 8px", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-end" }}>
                  <Line label="DIAGNOSTICO" name="diagnostico" w="flex-1" />
                </div>

                <div style={{ display: "flex", gap: 4, marginBottom: 4, alignItems: "flex-end" }}>
                  <Line label="TRATAMIENTO" name="tratamiento" w="flex-1" />
                  <span style={{ fontSize: 10, fontWeight: "bold", whiteSpace: "nowrap", paddingBottom: 1 }}>RS</span>
                  <input
                    type="text"
                    value={form.pagoEfectivo}
                    onChange={e => handleChange("pagoEfectivo", e.target.value)}
                    style={{ width: 40, borderBottom: "1px solid black", background: "transparent", fontSize: 10, outline: "none", textAlign: "center" }}
                  />
                </div>

                <div style={{ borderBottom: "1px solid black", marginBottom: 4, minHeight: 18 }}>
                  <input type="text" value={form.tratamiento2} onChange={e => handleChange("tratamiento2", e.target.value)}
                    style={{ width: "100%", background: "transparent", fontSize: 11, outline: "none", padding: "0 2px" }} />
                </div>

                <div style={{ borderBottom: "1px solid black", marginBottom: 6, minHeight: 18 }}>
                  <input type="text" value={form.tratamiento3} onChange={e => handleChange("tratamiento3", e.target.value)}
                    style={{ width: "100%", background: "transparent", fontSize: 11, outline: "none", padding: "0 2px" }} />
                </div>

                <div style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-end" }}>
                  <Line label="COSTO TOTAL $" name="costoTotal" w="flex-1" />
                  <Line label="PAGO SEMANAL $" name="pagoSemanal" w="flex-1" />
                  <Line label="NO. SEMANAS" name="noSemanas" w="w-28" />
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <Line label="NO INCLUYE" name="noIncluye" w="flex-1" />
                  <span style={{ fontSize: 10.5, fontWeight: "bold", whiteSpace: "nowrap" }}>PAGO EN EFECTIVO</span>
                  <input type="text" value={form.montoCredito} onChange={e => handleChange("montoCredito", e.target.value)}
                    style={{ width: 50, borderBottom: "1px solid black", background: "transparent", fontSize: 11, outline: "none", textAlign: "center" }} />
                </div>
              </div>

              {/* Texto AUTORIZACIÓN */}
              <p style={{ fontSize: 10.5, lineHeight: 1.55, marginBottom: 6 }}>
                <strong>AUTORIZACIÒN:</strong> Con este documento faculto y autorizo a la empresa{" "}
                <input type="text" value={form.empresa} onChange={e => handleChange("empresa", e.target.value)}
                  style={{ borderBottom: "1px solid black", background: "transparent", fontSize: 10.5, outline: "none", width: 160, padding: "0 2px" }} />{" "}
                con la que actualmente laboro para que me sea descontado el importe del crédito que acabo de adquirir con la Dra. Humbelina Huerta Barajas y que asciende a la cantidad de ${" "}
                <input type="text" value={form.montoCredito} onChange={e => handleChange("montoCredito", e.target.value)}
                  className={errors.montoCredito ? "border-red-500" : ""}
                  style={{ borderBottom: "1px solid black", background: "transparent", fontSize: 10.5, outline: "none", width: 130, padding: "0 2px" }} />{" "}
                M.N),{" "}
                <strong>ESTOY DE ACUERDO QUE NO HABRA CANCELACION ALGUNA DE TRATAMIENTOS DENTALES Y MUCHO MENOS REMBOLSO MONETARIOS PARCIALES O TOTALES, SOLAMENTE PODRE TRANSFERIR MI SALDO EN TRATAMIENTO A OTRA PERSONA QUE YO DESIGNE.</strong>{" "}
                Me doy por enterado y acepto las condiciones antes mencionadas.
              </p>
              <p style={{ fontSize: 10, fontStyle: "italic", marginBottom: 8 }}>
                Nota: la empresa no será responsable del pago en caso de que el colaborador termine la relación laboral.
              </p>

              {/* Firma */}
              <div style={{ display: "flex", gap: 32, alignItems: "flex-end", marginBottom: 4 }}>
                <span style={{ display: "flex", gap: 4, alignItems: "flex-end", flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: "bold", whiteSpace: "nowrap" }}>NOMBRE</span>
                  <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <input type="text" value={form.nombreFirma} onChange={e => handleChange("nombreFirma", e.target.value)}
                      className={errors.nombreFirma ? "border-red-500" : ""}
                      style={{ borderBottom: "1px solid black", background: "transparent", fontSize: 11, outline: "none", width: "100%", padding: "0 2px" }} />
                    {errors.nombreFirma && <span style={{ fontSize: 8, color: "red" }}>{errors.nombreFirma}</span>}
                  </span>
                </span>
                <span style={{ display: "flex", gap: 4, alignItems: "flex-end", flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: "bold", whiteSpace: "nowrap" }}>FIRMA</span>
                  <span style={{ flex: 1, borderBottom: "1px solid black", minHeight: 20 }} />
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 6 }}>
                <Checkbox id="aceptaAutorizacion" checked={form.aceptaAutorizacion}
                  onCheckedChange={v => handleChange("aceptaAutorizacion", v as boolean)} />
                <label htmlFor="aceptaAutorizacion" style={{ fontSize: 10, cursor: "pointer", lineHeight: 1.4 }}>
                  He leído y acepto los términos de la autorización de descuentos.
                </label>
              </div>
              {errors.aceptaAutorizacion && <p style={{ fontSize: 8, color: "red" }}>{errors.aceptaAutorizacion}</p>}
            </div>
          </div>

          {/* ══ SECCIÓN 2 — CONSENTIMIENTO INFORMADO ══ */}
          <div style={{ border: "2px solid black" }}>

            <div style={{ background: "#000", color: "#fff", textAlign: "center", padding: "5px 0" }}>
              <span style={{ fontSize: 13, fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase" }}>
                CONSENTIMIENTO INFORMADO PARA TRATAMIENTOS ODONTOLOGICOS
              </span>
            </div>

            <div style={{ padding: "10px 14px" }}>

              <p style={{ fontSize: 10.5, lineHeight: 1.55, marginBottom: 8 }}>
                Se hace saber al paciente o a sus padres o tutores que la <strong>Dra. Humbelina Huerta Barajas</strong> con la cedula profesional No.{" "}
                <strong>5609960</strong> y con el registro de la secretaría de salubridad del estado de Guanajuato No.{" "}
                <strong>4118</strong>, y/o el <strong>Dr. Erick Mancilla Chio</strong> con la cedula profesional No.{" "}
                <strong>8176924</strong> y el registro de la secretaría de salubridad del estado de Guanajuato No.{" "}
                <strong>4759</strong> son los dueños de la clínica o consultorio dental o unidad móvil, en el cual usted va a ser atendido; usted como paciente acepta que no todas sus citas será atendido por alguno de ellos y que la responsabilidad del tratamiento será del médico tratante del mismo; ya que los doctores que atienden están contratados por honorarios y será su responsabilidad cada tratamiento que ellos realicen.
              </p>

              {/* MÉDICO TRATANTE */}
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: "bold", whiteSpace: "nowrap" }}>MÉDICO TRATANTE:</span>
                <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <select value={form.medicoTratante} onChange={e => handleChange("medicoTratante", e.target.value)}
                    className={errors.medicoTratante ? "border-red-500" : ""}
                    style={{ borderBottom: "1px solid black", background: "transparent", fontSize: 11, outline: "none", width: "100%", appearance: "none", padding: "0 2px" }}>
                    <option value="">— Seleccionar —</option>
                    <optgroup label="Doctores">{DOCTORES.map(d => <option key={d} value={d}>{d}</option>)}</optgroup>
                    <optgroup label="Asistentes">{ASISTENTES.map(a => <option key={a} value={a}>{a}</option>)}</optgroup>
                  </select>
                  {errors.medicoTratante && <span style={{ fontSize: 8, color: "red" }}>{errors.medicoTratante}</span>}
                </span>
              </div>

              {/* NOMBRE / FIRMA PACIENTE */}
              <div style={{ display: "flex", gap: 32, alignItems: "flex-end", marginBottom: 8 }}>
                <span style={{ display: "flex", gap: 4, alignItems: "flex-end", flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: "bold", whiteSpace: "nowrap" }}>NOMBRE DEL PACIENTE</span>
                  <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <input type="text" value={form.nombrePacienteConsentimiento}
                      onChange={e => handleChange("nombrePacienteConsentimiento", e.target.value)}
                      className={errors.nombrePacienteConsentimiento ? "border-red-500" : ""}
                      style={{ borderBottom: "1px solid black", background: "transparent", fontSize: 11, outline: "none", width: "100%", padding: "0 2px" }} />
                    {errors.nombrePacienteConsentimiento && <span style={{ fontSize: 8, color: "red" }}>{errors.nombrePacienteConsentimiento}</span>}
                  </span>
                </span>
                <span style={{ display: "flex", gap: 4, alignItems: "flex-end", flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: "bold", whiteSpace: "nowrap" }}>FIRMA DEL PACIENTE</span>
                  <span style={{ flex: 1, borderBottom: "1px solid black", minHeight: 20 }} />
                </span>
              </div>

              {/* FECHA */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "flex-end", fontSize: 10.5, marginBottom: 8 }}>
                <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>AUTORIZACIÓN EXPEDIDA EL DIA</span>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <input type="text" value={form.diaAutorizacion} onChange={e => handleChange("diaAutorizacion", e.target.value)}
                    placeholder="DD" className={errors.diaAutorizacion ? "border-red-500" : ""}
                    style={{ borderBottom: "1px solid black", background: "transparent", fontSize: 10.5, outline: "none", width: 36, textAlign: "center", padding: "0 2px" }} />
                  {errors.diaAutorizacion && <span style={{ fontSize: 8, color: "red" }}>{errors.diaAutorizacion}</span>}
                </span>
                <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>DEL MES</span>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <input type="text" value={form.mesAutorizacion} onChange={e => handleChange("mesAutorizacion", e.target.value)}
                    placeholder="MES" className={errors.mesAutorizacion ? "border-red-500" : ""}
                    style={{ borderBottom: "1px solid black", background: "transparent", fontSize: 10.5, outline: "none", width: 72, textAlign: "center", padding: "0 2px" }} />
                  {errors.mesAutorizacion && <span style={{ fontSize: 8, color: "red" }}>{errors.mesAutorizacion}</span>}
                </span>
                <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>DEL AÑO</span>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <input type="text" value={form.anioAutorizacion} onChange={e => handleChange("anioAutorizacion", e.target.value)}
                    placeholder="AAAA" className={errors.anioAutorizacion ? "border-red-500" : ""}
                    style={{ borderBottom: "1px solid black", background: "transparent", fontSize: 10.5, outline: "none", width: 52, textAlign: "center", padding: "0 2px" }} />
                  {errors.anioAutorizacion && <span style={{ fontSize: 8, color: "red" }}>{errors.anioAutorizacion}</span>}
                </span>
                <span style={{ fontWeight: "bold", textTransform: "uppercase" }}>EN LA CIUDAD DE LEÓN GUANAJAUTO.</span>
              </div>

              {/* No cancelación */}
              <p style={{ fontSize: 10.5, lineHeight: 1.55, marginBottom: 6 }}>
                Estoy de acuerdo que no hay cancelación ni reembolso por ningún motivo y que si cancelo habrá una
                penalización del 10% del valor total del tratamiento.
              </p>
              <div style={{ borderBottom: "1px solid black", minHeight: 24, marginBottom: 8 }} />

              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                <Checkbox id="aceptaConsentimiento" checked={form.aceptaConsentimiento}
                  onCheckedChange={v => handleChange("aceptaConsentimiento", v as boolean)} />
                <label htmlFor="aceptaConsentimiento" style={{ fontSize: 10, cursor: "pointer", lineHeight: 1.4 }}>
                  He leído y acepto el consentimiento informado para tratamientos odontológicos.
                </label>
              </div>
              {errors.aceptaConsentimiento && <p style={{ fontSize: 8, color: "red" }}>{errors.aceptaConsentimiento}</p>}

              <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <Checkbox id="aceptaNoCancelacion" checked={form.aceptaNoCancelacion}
                  onCheckedChange={v => handleChange("aceptaNoCancelacion", v as boolean)} />
                <label htmlFor="aceptaNoCancelacion" style={{ fontSize: 10, cursor: "pointer", lineHeight: 1.4 }}>
                  Estoy de acuerdo que no hay cancelación ni reembolso por ningún motivo.
                </label>
              </div>
              {errors.aceptaNoCancelacion && <p style={{ fontSize: 8, color: "red" }}>{errors.aceptaNoCancelacion}</p>}
            </div>
          </div>

        </div>

        {/* Botones */}
        <div className="max-w-[816px] mx-auto mt-5 flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline">← Regresar</Button>
          </Link>
          <Button type="submit" disabled={isExporting}
            className="bg-[#0891B2] hover:bg-[#0E7490] text-white flex items-center gap-2 px-8">
            <Download className="w-4 h-4" />
            {isExporting ? "Exportando PDF..." : "Guardar y Exportar PDF"}
          </Button>
        </div>
      </form>
    </div>
  )
}
