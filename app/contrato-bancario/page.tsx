"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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

export default function ContratoBancarioPage() {
  const printRef = useRef<HTMLDivElement>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const [form, setForm] = useState({
    // I. Datos del Paciente
    nombre: "",
    edad: "",
    telefono: "",
    whatsapp: "",
    correo: "",
    calle: "",
    numExterior: "",
    numInterior: "",
    colonia: "",
    ciudad: "",
    estado: "",

    // II. Tratamiento
    diagnosticoClinico: "",
    planTratamiento: "",
    planTratamiento2: "",

    // III. Presupuesto
    costoTotal: "",
    pagoSemanal: "",
    numSemanas: "",
    duracionEstimada: "",
    formaPago: "",
    bancoNomina: "",
    numeroCuenta: "",
    numeroCuentaClabe: "",

    // VI. Firmas
    firmaPaciente: "",
    lugarFecha: "",
    dia: "",
    mes: "",
    anio: "",
    medicoLlena: "",
    aceptaAvisos: false,
    aceptaTerminos: false,
  })

  const [errors, setErrors] = useState<{ [k: string]: string }>({})

  useEffect(() => {
    const tx = localStorage.getItem("odontogramaTratamiento") || ""
    const diag = localStorage.getItem("odontogramaDiagnostico") || ""
    const hc = localStorage.getItem("historiaClinicaData")
    let nombre = "", telefono = "", correo = "", edad = "", calle = "", colonia = "", ciudad = ""
    if (hc) {
      try {
        const d = JSON.parse(hc)
        nombre = d.nombre || ""
        telefono = d.celular || d.telefono || ""
        correo = d.email || ""
        edad = d.edad || ""
        calle = d.direccion || ""
        colonia = d.colonia || ""
        ciudad = d.ciudad || ""
      } catch {}
    }
    setForm(prev => ({
      ...prev,
      nombre: nombre || prev.nombre,
      telefono: telefono || prev.telefono,
      correo: correo || prev.correo,
      edad: edad || prev.edad,
      calle: calle || prev.calle,
      colonia: colonia || prev.colonia,
      ciudad: ciudad || prev.ciudad,
      diagnosticoClinico: diag || prev.diagnosticoClinico,
      planTratamiento: tx || prev.planTratamiento,
    }))
  }, [])

  const handleChange = (name: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => { const { [name]: _, ...r } = prev; return r })
  }

  const validate = () => {
    const required = [
      "nombre", "telefono", "calle", "colonia", "ciudad",
      "diagnosticoClinico", "planTratamiento",
      "costoTotal", "pagoSemanal", "numSemanas",
      "bancoNomina", "numeroCuenta", "numeroCuentaClabe",
      "firmaPaciente", "dia", "mes", "anio",
    ]
    const newErrors: { [k: string]: string } = {}
    required.forEach(f => { if (!form[f as keyof typeof form]) newErrors[f] = "Requerido" })
    if (!form.aceptaAvisos) newErrors.aceptaAvisos = "Requerido"
    if (!form.aceptaTerminos) newErrors.aceptaTerminos = "Requerido"
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
      pdf.save("Contrato_Prestacion_Servicios_Odontologicos.pdf")
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
          <h2 className="text-2xl font-bold mb-2">¡Contrato Exportado!</h2>
          <p className="text-gray-600 mb-6">El PDF del Contrato de Prestación de Servicios ha sido descargado.</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setShowSuccess(false)} variant="outline">Regresar al Formulario</Button>
            <Link href="/consentimiento">
              <Button className="bg-medical-teal hover:bg-medical-teal/90 text-white">Siguiente: Consentimiento</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ─── small inline field ─────────────────────────────────────── */
  const F = ({
    name, width = "flex-1", placeholder = "", multiline = false
  }: { name: string; width?: string; placeholder?: string; multiline?: boolean }) => {
    const val = String(form[name as keyof typeof form] ?? "")
    const cls = `border-b border-black bg-transparent text-[11px] px-0.5 outline-none w-full ${errors[name] ? "border-red-500" : ""}`
    return (
      <div className={`flex flex-col ${width}`}>
        {multiline
          ? <textarea value={val} onChange={e => handleChange(name, e.target.value)} rows={2}
              className={cls.replace("border-b", "border")} placeholder={placeholder} style={{ resize: "none" }} />
          : <input type="text" value={val} onChange={e => handleChange(name, e.target.value)}
              placeholder={placeholder} className={cls} style={{ lineHeight: "1.6" }} />
        }
        {errors[name] && <span className="text-[9px] text-red-500">{errors[name]}</span>}
      </div>
    )
  }

  /* ─── labelled field ─────────────────────────────────────────── */
  const LF = ({ label, name, width = "flex-1", placeholder = "" }: { label: string; name: string; width?: string; placeholder?: string }) => (
    <div className={`flex items-end gap-1 ${width}`}>
      <span className="text-[11px] font-bold uppercase whitespace-nowrap">{label}:</span>
      <F name={name} placeholder={placeholder} />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-4 light">
      {/* Top bar */}
      <div className="max-w-[820px] mx-auto mb-4 flex justify-between items-center">
        <Link href="/">
          <Image src="/dents23-logo-final.png" alt="Dent's 23" width={100} height={34} className="object-contain" />
        </Link>
        <Button onClick={handleSubmit} disabled={isExporting} className="bg-medical-teal hover:bg-medical-teal/90 text-white flex items-center gap-2">
          <Download className="w-4 h-4" />
          {isExporting ? "Exportando..." : "Exportar PDF"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div ref={printRef} className="bg-white max-w-[820px] mx-auto shadow-lg" style={{ fontFamily: "Arial, sans-serif", padding: "24px 28px" }}>

          {/* ══════════════════════════════════════════════════════════
              HEADER
          ══════════════════════════════════════════════════════════ */}
          <div className="text-center mb-3">
            <h1 className="text-[15px] font-bold uppercase tracking-wide">
              CONTRATO DE PRESTACIÓN DE SERVICIOS ODONTOLÓGICOS
            </h1>
            <p className="text-[10px] mt-0.5">Suc. León Moderno: Calzada Tepeyac #701, Esq. Mariano Escobedo, León, Gto.</p>
            <p className="text-[10px]">Suc. Hospital MAC: Blvd. Aeropuerto #101, Piso 11, Consultorio 1116, León, Gto.</p>
          </div>

          {/* AVISO IMPORTANTE */}
          <div className="border border-black p-2 mb-3 text-[10px] leading-relaxed">
            <p className="font-bold mb-1">AVISO IMPORTANTE:</p>
            <p>Este documento está realizado en base a las normas oficiales Mexicanas (NOM) para el ejercicio de la práctica odontológica y el manejo de expedientes clínicos.</p>
          </div>

          {/* AVISO DE PRIVACIDAD */}
          <div className="border border-black p-2 mb-3 text-[10px] leading-relaxed space-y-1">
            <p className="font-bold">AVISO DE PRIVACIDAD:</p>
            <p>Sus datos personales serán tratados conforme a la ley de protección de datos personales. La información proporcionada será utilizada exclusivamente para:</p>
            <ul className="list-disc ml-4 space-y-0.5">
              <li>Elaboración de su expediente clínico.</li>
              <li>Diagnóstico y tratamiento dental.</li>
              <li>Seguimiento médico y citas.</li>
              <li>Facturación y gestión de pagos.</li>
            </ul>
            <p>Sus datos están protegidos y no serán compartidos con terceros sin su consentimiento.</p>
          </div>

          {/* VERACIDAD */}
          <div className="border border-black p-2 mb-3 text-[10px] leading-relaxed">
            <p className="font-bold mb-1">VERACIDAD:</p>
            <p>Al completar este formulario, usted acepta que la información proporcionada es verídica y completa, y autoriza al personal médico de Dent's 23 a utilizarla para su atención dental.</p>
            <p className="mt-1.5">He leído y acepto los AVISOS LEGALES, EL AVISO DE PRIVACIDAD y las NORMAS OFICIALES (NOM) mencionadas anteriormente.</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="font-bold uppercase text-[11px]">FIRMA</span>
              <div className="flex-1 border-b border-black" style={{ minHeight: 18 }} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                id="aceptaAvisos"
                checked={form.aceptaAvisos}
                onCheckedChange={v => handleChange("aceptaAvisos", v as boolean)}
              />
              <label htmlFor="aceptaAvisos" className="cursor-pointer text-[10px]">Confirmo que he leído y acepto los avisos legales anteriores.</label>
            </div>
            {errors.aceptaAvisos && <p className="text-[9px] text-red-500">{errors.aceptaAvisos}</p>}
          </div>

          {/* ══════════════════════════════════════════════════════════
              I. DATOS DEL PACIENTE
          ══════════════════════════════════════════════════════════ */}
          <div className="mb-3">
            <p className="text-[12px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2">I. DATOS DEL PACIENTE</p>
            <div className="space-y-2">
              <LF label="Nombre" name="nombre" width="flex-1" />
              <div className="flex gap-4 items-end">
                <LF label="Edad" name="edad" width="w-28" placeholder="años" />
                <LF label="Teléfono" name="telefono" width="flex-1" />
                <LF label="Whatsapp" name="whatsapp" width="flex-1" />
              </div>
              <LF label="Correo" name="correo" width="flex-1" />
              <div className="flex gap-3 items-end">
                <LF label="Domicilio: Calle" name="calle" width="flex-1" />
              </div>
              <div className="flex gap-3 items-end">
                <LF label="Número exterior" name="numExterior" width="flex-1" />
                <LF label="Número interior" name="numInterior" width="flex-1" />
              </div>
              <div className="flex gap-3 items-end">
                <LF label="Colonia" name="colonia" width="flex-1" />
                <LF label="Ciudad" name="ciudad" width="flex-1" />
                <LF label="Estado" name="estado" width="flex-1" />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              II. TRATAMIENTO PLANIFICADO
          ══════════════════════════════════════════════════════════ */}
          <div className="mb-3">
            <p className="text-[12px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2">II. TRATAMIENTO PLANIFICADO</p>
            <div className="space-y-2">
              <LF label="Diagnóstico Clínico" name="diagnosticoClinico" width="flex-1" />
              <div className="flex items-start gap-1">
                <span className="text-[11px] font-bold uppercase whitespace-nowrap mt-1">Plan de tratamiento:</span>
                <div className="flex-1 space-y-1">
                  <F name="planTratamiento" placeholder="RESINAS / Descripción..." />
                  <F name="planTratamiento2" placeholder="Continúa..." />
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              III. PRESUPUESTO
          ══════════════════════════════════════════════════════════ */}
          <div className="mb-3">
            <p className="text-[12px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2">III. PRESUPUESTO</p>
            <div className="space-y-2">
              <LF label="Costo Total del Tratamiento (MXN)" name="costoTotal" width="flex-1" />
              <div className="flex gap-4 items-end">
                <LF label="Pago semanal" name="pagoSemanal" width="flex-1" />
                <LF label="Número de Semanas" name="numSemanas" width="flex-1" />
              </div>
              <LF label="Duración Estimada del Tratamiento" name="duracionEstimada" width="flex-1" />
              <LF label="Forma de pago para domiciliación" name="formaPago" width="flex-1" />
              <LF label="Banco donde recibo mi nómina" name="bancoNomina" width="flex-1" />
              <LF label="Número de cuenta" name="numeroCuenta" width="flex-1" />
              <LF label="Número de cuenta CLABE" name="numeroCuentaClabe" width="flex-1" />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              IV. GENERALES DEL PRESTADOR DEL SERVICIO
          ══════════════════════════════════════════════════════════ */}
          <div className="mb-3 border border-black p-2">
            <p className="text-[12px] font-bold uppercase mb-1">IV. GENERALES DEL PRESTADOR DEL SERVICIO:</p>
            <div className="text-[10px] leading-relaxed space-y-0.5">
              <p><strong>Nombre Completo:</strong> Dr. Erick Alejandro Mancilla Chio</p>
              <p><strong>Cédula Profesional:</strong> 8176924 (Secretaría de Salubridad Pública, México)</p>
              <p><strong>Teléfono de Contacto:</strong> 477 266 0892</p>
              <p><strong>Correo Electrónico:</strong> dents23erick@gmail.com</p>
              <p><strong>Domicilio Profesional 1:</strong> Calzada Tepeyac #701, Esq. Mariano Escobedo, Col. León Moderno, León, Gto.</p>
              <p><strong>Domicilio Profesional 2:</strong> Blvd. Aeropuerto #101, Piso 11, Consultorio 1116, Col. Villas de Santa Julia, León, Gto.</p>
              <p className="mt-1.5">El PACIENTE reconoce que los datos anteriores corresponden al profesional responsable que dirige la atención, y que ha sido informado sobre su identidad, atribuciones profesionales y establecimiento clínico.</p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              V. CLÁUSULAS
          ══════════════════════════════════════════════════════════ */}
          <div className="mb-3">
            <p className="text-[12px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2">V. CLÁUSULAS</p>
            <div className="text-[10px] leading-relaxed space-y-1.5">
              <p><strong>PRIMERA – OBJETO.</strong> EL PRESTADOR se obliga a brindar servicios odontológicos profesionales al PACIENTE conforme al diagnóstico, plan de tratamiento y lineamientos clínicos aceptados por ambas partes, pudiendo requerirse estudios auxiliares para su correcta ejecución.</p>
              <p><strong>SEGUNDA – CONSENTIMIENTO INFORMADO.</strong> EL PACIENTE declara haber recibido una explicación clara, detallada y suficiente respecto de la naturaleza, beneficios, posibles complicaciones, riesgos y alternativas terapéuticas antes del inicio del tratamiento.</p>
              <p><strong>TERCERA – HISTORIAL MÉDICO Y COLABORACIÓN.</strong> EL PACIENTE manifiesta haber informado de manera veraz su estado de salud, medicamentos, alergias y enfermedades. Se compromete a cumplir indicaciones, asistir a revisiones y mantener higiene adecuada.</p>
              <p><strong>CUARTA – PAGO, FINANCIAMIENTO E INTERESES.</strong> El PACIENTE podrá cubrir el tratamiento al contado o mediante financiamiento. En caso de atraso se aplicará un interés moratorio del 5% mensual sobre el saldo pendiente. Los materiales, laboratorios y avances clínicos no son reembolsables.</p>
              <p><strong>QUINTA – MODIFICACIÓN DEL PLAN DE TRATAMIENTO.</strong> El plan podrá ajustarse conforme a la evolución clínica del PACIENTE. Las modificaciones deberán documentarse y ser aceptadas por el PACIENTE.</p>
              <p><strong>SEXTA – GARANTÍAS Y EXCLUSIONES.</strong> La garantía aplicará únicamente si el PACIENTE cumple con higiene, controles, revisiones periódicas y cuidados indicados. No existe garantía en casos de enfermedad periodontal activa, bruxismo no controlado, tabaquismo severo, uso indebido o trauma.</p>
              <p><strong>SÉPTIMA – PRÓTESIS, ORTODONCIA E IMPLANTES.</strong> El PACIENTE entiende que la respuesta biológica, ósea y tisular puede variar. La estabilidad, estética y/o duración del tratamiento dependen de factores individuales y cooperación del PACIENTE. La retención posterior en ortodoncia es obligatoria y su omisión puede generar recaída.</p>
              <p><strong>OCTAVA – USO DE IMÁGENES, RADIOGRAFÍAS Y REGISTROS CLÍNICOS.</strong> El PACIENTE autoriza la toma de imágenes y radiografías para expediente clínico. El uso de imágenes donde se vea la cara del paciente con fines de difusión requerirá consentimiento adicional; el uso de imágenes dentales o bucales donde no se vea la cara del paciente estará autorizada sin necesidad de otro documento.</p>
              <p><strong>NOVENA – PRIVACIDAD Y EXPEDIENTE.</strong> La información será resguardada conforme a la Ley Federal de Protección de Datos Personales. El PACIENTE puede solicitar acceso y copias conforme a la legislación aplicable.</p>
              <p><strong>DÉCIMA – TERMINACIÓN ANTICIPADA.</strong> En caso de cancelación del tratamiento, el PACIENTE deberá liquidar los costos de materiales, análisis, estudios y trabajos ya realizados aunque el tratamiento no concluya.</p>
              <p><strong>DÉCIMA PRIMERA – RESPONSABILIDAD.</strong> EL PACIENTE reconoce que los resultados dependen de factores biológicos individuales y de su cumplimiento de indicaciones. No se garantizan resultados estéticos específicos salvo que se haya documentado y aceptado por escrito.</p>
              <p><strong>DÉCIMA SEGUNDA – INTERVENCIÓN DE OTROS PROFESIONALES.</strong> El PACIENTE reconoce y acepta que ciertas fases o procedimientos podrán ser ejecutados total o parcialmente por otros odontólogos o especialistas adscritos bajo dirección clínica. La responsabilidad profesional directa recaerá sobre quien realice cada acto clínico.</p>
              <p><strong>DÉCIMA TERCERA – LIMITACIÓN DE RESPONSABILIDAD Y RENUNCIA A ACCIONES PERSONALES.</strong> El PACIENTE acepta que la participación de distintos profesionales es parte del proceso clínico y RENUNCIA a dirigir reclamaciones o demandas personales contra el representante de la clínica por actos realizados directamente por otro profesional tratante, sin perjuicio de los derechos legales aplicables en caso de culpa comprobada.</p>
              <p><strong>DÉCIMA CUARTA – JURISDICCIÓN.</strong> Para la interpretación y cumplimiento del presente contrato, las partes se someten expresamente a la jurisdicción de los tribunales competentes en León, Guanajuato.</p>
              <p><strong>DÉCIMA QUINTA – TÉRMINO DE TRATAMIENTO.</strong> Si el tratamiento termina antes de que el paciente termine de pagar, el paciente se ve en la obligación de terminar de pagar el mismo de la misma forma que se haya acordado desde el principio.</p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              VI. ACEPTACIÓN Y FIRMAS
          ══════════════════════════════════════════════════════════ */}
          <div className="mb-3">
            <p className="text-[12px] font-bold uppercase border-b-2 border-black pb-0.5 mb-2">VI. ACEPTACIÓN Y FIRMAS</p>

            <p className="text-[10.5px] mb-3 leading-relaxed">
              Declaro haber leído y comprendido la totalidad del presente contrato y que he recibido explicaciones claras a mis preguntas.
            </p>

            {/* Paciente */}
            <div className="space-y-2 mb-3">
              <div className="flex items-end gap-2">
                <span className="text-[11px] font-bold uppercase whitespace-nowrap">PACIENTE:</span>
                <div className="flex flex-col flex-1">
                  <input
                    type="text"
                    value={form.firmaPaciente}
                    onChange={e => handleChange("firmaPaciente", e.target.value)}
                    className={`border-b border-black bg-transparent text-[11px] px-0.5 outline-none w-full ${errors.firmaPaciente ? "border-red-500" : ""}`}
                    placeholder="Nombre completo del paciente"
                    style={{ lineHeight: "1.6" }}
                  />
                  {errors.firmaPaciente && <span className="text-[9px] text-red-500">{errors.firmaPaciente}</span>}
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-[11px] font-bold uppercase whitespace-nowrap">FIRMA:</span>
                <div className="flex-1 border-b border-black" style={{ minHeight: 24 }} />
              </div>
            </div>

            {/* Lugar y Fecha */}
            <div className="flex flex-wrap gap-2 items-center text-[10.5px] mb-3">
              <span className="font-bold uppercase">LUGAR Y FECHA: León, Guanajuato a</span>
              <div className="flex flex-col">
                <input
                  type="text"
                  value={form.dia}
                  onChange={e => handleChange("dia", e.target.value)}
                  className={`border-b border-black bg-transparent text-[10.5px] w-10 text-center outline-none ${errors.dia ? "border-red-500" : ""}`}
                  placeholder="DD"
                  style={{ lineHeight: "1.4" }}
                />
                {errors.dia && <span className="text-[9px] text-red-500">{errors.dia}</span>}
              </div>
              <span className="font-bold uppercase">de</span>
              <div className="flex flex-col">
                <input
                  type="text"
                  value={form.mes}
                  onChange={e => handleChange("mes", e.target.value)}
                  className={`border-b border-black bg-transparent text-[10.5px] w-24 text-center outline-none ${errors.mes ? "border-red-500" : ""}`}
                  placeholder="mes"
                  style={{ lineHeight: "1.4" }}
                />
                {errors.mes && <span className="text-[9px] text-red-500">{errors.mes}</span>}
              </div>
              <span className="font-bold uppercase">del 20</span>
              <div className="flex flex-col">
                <input
                  type="text"
                  value={form.anio}
                  onChange={e => handleChange("anio", e.target.value)}
                  className={`border-b border-black bg-transparent text-[10.5px] w-12 text-center outline-none ${errors.anio ? "border-red-500" : ""}`}
                  placeholder="AA"
                  style={{ lineHeight: "1.4" }}
                />
                {errors.anio && <span className="text-[9px] text-red-500">{errors.anio}</span>}
              </div>
            </div>

            {/* Prestador */}
            <div className="space-y-2 mb-3">
              <div className="flex items-end gap-2">
                <span className="text-[11px] font-bold uppercase whitespace-nowrap">PRESTADOR:</span>
                <span className="text-[11px]">Dr. Erick Alejandro Mancilla Chio</span>
                <span className="text-[11px] font-bold uppercase whitespace-nowrap ml-4">FIRMA:</span>
                <div className="flex-1 border-b border-black" style={{ minHeight: 24 }} />
              </div>
            </div>

            {/* Médico que llena */}
            <div className="space-y-2 mb-3">
              <div className="flex items-end gap-2">
                <span className="text-[11px] font-bold uppercase whitespace-nowrap">MÉDICO QUE LLENA ESTE DOCUMENTO:</span>
                <div className="flex-1">
                  <select
                    value={form.medicoLlena}
                    onChange={e => handleChange("medicoLlena", e.target.value)}
                    className="border-b border-black bg-transparent text-[11px] w-full outline-none px-0.5"
                    style={{ lineHeight: "1.6", appearance: "none" }}
                  >
                    <option value="">— Seleccionar —</option>
                    <optgroup label="Doctores">
                      {DOCTORES.map(d => <option key={d} value={d}>{d}</option>)}
                    </optgroup>
                    <optgroup label="Asistentes">
                      {ASISTENTES.map(a => <option key={a} value={a}>{a}</option>)}
                    </optgroup>
                  </select>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-[11px] font-bold uppercase whitespace-nowrap">FIRMA:</span>
                <div className="flex-1 border-b border-black" style={{ minHeight: 24 }} />
              </div>
            </div>

            {/* Checkbox final */}
            <div className="flex items-start gap-2 mt-3 border border-black p-2">
              <Checkbox
                id="aceptaTerminos"
                checked={form.aceptaTerminos}
                onCheckedChange={v => handleChange("aceptaTerminos", v as boolean)}
              />
              <label htmlFor="aceptaTerminos" className="text-[10.5px] cursor-pointer leading-snug">
                He leído y acepto todas las cláusulas del presente contrato de prestación de servicios odontológicos.
              </label>
            </div>
            {errors.aceptaTerminos && <p className="text-[9px] text-red-500 mt-1">{errors.aceptaTerminos}</p>}
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="max-w-[820px] mx-auto mt-6 flex justify-center gap-4">
          <Link href="/autorizacion-consentimiento">
            <Button variant="outline">← Regresar</Button>
          </Link>
          <Button
            type="submit"
            disabled={isExporting}
            className="bg-medical-teal hover:bg-medical-teal/90 text-white flex items-center gap-2 px-8"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exportando PDF..." : "Guardar y Exportar PDF"}
          </Button>
        </div>
      </form>
    </div>
  )
}
