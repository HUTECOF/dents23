"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Heart, User, Building2, Stethoscope, Calendar, Phone, Mail, MapPin, Check, Moon, Sun } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { generateFolio, getCurrentDate } from "@/lib/folio-generator"
import { ThumbsSelector } from "@/components/thumbs-selector"
import { DiabetesSelector } from "@/components/diabetes-selector"
import { GenderSelector } from "@/components/gender-selector"
import { TipoPacienteSelector } from "@/components/tipo-paciente-selector"
import { LegalNotices } from "@/components/legal-notices"
import VideoIntro from "@/components/video-intro-simple"
import { alertSystem } from "@/lib/alert-system"
import { saveHistoriaClinica } from "@/lib/supabase-helpers"
import { patientDataStore } from "@/lib/patient-data-store"
import Odontograma, { OdontogramaData, generateTratamientoText } from "@/components/odontograma"
import SignaturePhotoCapture from "@/components/signature-photo-capture"

const NIP_CODE = "0015"
const EMPTY_ODONTOGRAMA: OdontogramaData = { dientes: {} }

export default function HistoriaClinicaNueva() {
  const [odontogramaData, setOdontogramaData] = useState<OdontogramaData>(EMPTY_ODONTOGRAMA)
  const [notasMedico, setNotasMedico] = useState("")
  const [planTratamiento, setPlanTratamiento] = useState<{
    items: { descripcion: string; cantidad: number; costoUnitario: string; total: string }[]
    tipoPlan: "interna" | "externa" | ""
    folio: string
    semanas: number
    subsidio: number
    notas: string
  }>({
    items: [
      { descripcion: "EXTRACCIONES", cantidad: 0, costoUnitario: "", total: "" },
      { descripcion: "ENDODONCIA",   cantidad: 0, costoUnitario: "", total: "" },
      { descripcion: "RESINAS",      cantidad: 0, costoUnitario: "", total: "" },
      { descripcion: "CORONA",       cantidad: 0, costoUnitario: "", total: "" },
      { descripcion: "CIRUGÍA",      cantidad: 0, costoUnitario: "", total: "" },
      { descripcion: "LIMPIEZA DENTAL", cantidad: 0, costoUnitario: "", total: "" },
      { descripcion: "PERIODONTAL",  cantidad: 0, costoUnitario: "", total: "" },
    ],
    tipoPlan: "",
    folio: "",
    semanas: 18,
    subsidio: 50,
    notas: "",
  })
  const [showVideoIntro, setShowVideoIntro] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [nipValue, setNipValue] = useState("")
  const [nipVerified, setNipVerified] = useState(false)
  const [nipError, setNipError] = useState("")
  const [loadedDraft, setLoadedDraft] = useState(false)
  const [colorMode, setColorMode] = useState<"light" | "dark">("dark")
  
  // Generar folio y fecha automáticamente
  const [folio] = useState(generateFolio())
  const [fecha] = useState(getCurrentDate())
  
  const [formData, setFormData] = useState({
    // Datos del Consultorio
    razonSocialConsultorio: "Erick Alejandro Mancilla Elijo",
    domicilioConsultorio: "",
    telefonoConsultorio: "",
    mediosContactoConsultorio: "",
    matriz: "",
    domicilioSucursales: "",
    telefonoSucursales: "",
    mediosContactoSucursales: "",
    odontologoTratante: "Erick Alejandro Mancilla Elijo",
    cedulaProfesional: "",
    ssGto: "",
    consultorioAtencion: "" as "Punto Escobedo" | "MAC" | "Delta" | "Charly" | "Otro" | "",
    fechaLlenado: fecha,
    responsableRevision: "",

    // Datos Personales
    folio: folio,
    fecha: fecha,
    nombre: "",
    ocupacion: "",
    edad: "",
    sexo: "masculino" as "masculino" | "femenino",
    celular: "",
    contacto: "",
    whatsapp: "",
    email: "",
    esMenor: undefined as "si" | "no" | undefined,
    nombreMadre: "",
    nombrePadre: "",
    nombreTutor: "",
    ineResponsable: "",
    firmaResponsable: "",
    autorizaConsulta: "",

    // Historia Clínica Actual
    motivoConsulta: "",
    sintomasPaciente: "",
    inicioSintomas: "",
    dolor: undefined as "si" | "no" | undefined,
    dolorDetalles: "",
    inflamacion: undefined as "si" | "no" | undefined,
    inflamacionDetalles: "",
    sangrado: undefined as "si" | "no" | undefined,
    sangradoDetalles: "",
    movilidad: undefined as "si" | "no" | undefined,
    movilidadDetalles: "",
    molestias: undefined as "si" | "no" | undefined,
    molestiasDetalles: "",
    intensidad: "",
    frecuencia: "",

    // Datos Socioeconómicos
    direccion: "",
    colonia: "",
    codigoPostal: "",
    viviendaPropia: undefined as "si" | "no" | undefined,
    viviendaBanoAgua: undefined as "si" | "no" | undefined,
    personasDependientes: "",
    antiguedadTrabajo: "",

    // Antecedentes Heredofamiliares
    diabetesHeredofamiliar: undefined as "si" | "no" | undefined,
    hipertensionHeredofamiliar: undefined as "si" | "no" | undefined,
    cardiovascularesHeredofamiliar: undefined as "si" | "no" | undefined,
    coagulacionHeredofamiliar: undefined as "si" | "no" | undefined,
    cancerHeredofamiliar: undefined as "si" | "no" | undefined,
    hereditariasHeredofamiliar: undefined as "si" | "no" | undefined,
    otrasHeredofamiliar: undefined as "si" | "no" | undefined,
    heredofamiliarDetalles: "",

    // Antecedentes Personales
    saludBuena: undefined as "si" | "no" | undefined,
    saludBuenaDetalles: "",
    hospitalizado: undefined as "si" | "no" | undefined,
    hospitalizadoDetalles: "",
    cirugia: undefined as "si" | "no" | undefined,
    cirugiaDetalles: "",
    transfusiones: undefined as "si" | "no" | undefined,
    transfusionesDetalles: "",
    traumatismos: undefined as "si" | "no" | undefined,
    traumatismosDetalles: "",
    cardiopatias: undefined as "si" | "no" | undefined,
    cardiopatiasDetalles: "",
    respiratorias: undefined as "si" | "no" | undefined,
    respiratoriasDetalles: "",
    epilepsia: undefined as "si" | "no" | undefined,
    epilepsiaDetalles: "",
    marcapasos: undefined as "si" | "no" | undefined,
    marcapasosDetalles: "",
    protesisValvular: undefined as "si" | "no" | undefined,
    protesisValvularDetalles: "",
    bifosfonatos: undefined as "si" | "no" | undefined,
    bifosfonatosDetalles: "",
    oncologico: undefined as "si" | "no" | undefined,
    oncologicoDetalles: "",
    medicoUltimoAnio: undefined as "si" | "no" | undefined,
    medicoUltimoAnioDetalles: "",
    alergicoMedicamento: undefined as "si" | "no" | undefined,
    alergicoMedicamentoCual: "",
    alergiaAnestesicos: undefined as "si" | "no" | undefined,
    alergiaAnestesicosDetalles: "",
    alergiaLatex: undefined as "si" | "no" | undefined,
    alergiaLatexDetalles: "",
    alergiaMaterialDental: undefined as "si" | "no" | undefined,
    alergiaMaterialDentalDetalles: "",
    alergiaOtros: undefined as "si" | "no" | undefined,
    alergiaOtrosDetalles: "",
    tomaMedicamento: undefined as "si" | "no" | undefined,
    tomaMedicamentoCual: "",
    tomaMedicamentoFrecuencia: "",

    // Hábitos, Signos Vitales y Exploración
    tabaquismo: undefined as "si" | "no" | undefined,
    tabaquismoFrecuencia: "",
    alcoholismo: undefined as "si" | "no" | undefined,
    alcoholismoFrecuencia: "",
    drogas: undefined as "si" | "no" | undefined,
    drogasDetalles: "",
    mordidaUnias: undefined as "si" | "no" | undefined,
    bruxismo: undefined as "si" | "no" | undefined,
    morderObjetos: undefined as "si" | "no" | undefined,
    succionLabial: undefined as "si" | "no" | undefined,
    succionDigital: undefined as "si" | "no" | undefined,
    respiracionBucal: undefined as "si" | "no" | undefined,
    linguaPendular: undefined as "si" | "no" | undefined,
    succionChupete: undefined as "si" | "no" | undefined,
    cepilladoDiario: "",
    usaHiloDental: undefined as "si" | "no" | undefined,
    enjuagueBucal: undefined as "si" | "no" | undefined,
    hipertrofiaDental: undefined as "si" | "no" | undefined,
    ingestaAlimentosCarbohidratos: undefined as "si" | "no" | undefined,

    presionArterial: "",
    frecuenciaCardiaca: "",
    frecuenciaRespiratoria: "",
    temperatura: "",
    peso: "",
    talla: "",
    imc: "",
    glucosa: "",
    oxigenacion: "",

    facies: "",
    simetriaFacial: "",
    gangliosLinfaticos: "",
    atm: "",
    movilidadMandibular: "",
    ruidosArticulares: undefined as "si" | "no" | undefined,
    limitacionApertura: undefined as "si" | "no" | undefined,
    dolorPalpacion: undefined as "si" | "no" | undefined,

    labios: "",
    mejillas: "",
    encia: "",
    paladar: "",
    pisoBoca: "",
    lengua: "",
    orofaringe: "",
    salivacion: "",
    higieneBucalIntraoral: "",
    placaBacteriana: undefined as "si" | "no" | undefined,
    sangradoEncias: undefined as "si" | "no" | undefined,
    calculos: undefined as "si" | "no" | undefined,
    halitosis: undefined as "si" | "no" | undefined,
    malOclusion: "",
    diastemas: undefined as "si" | "no" | undefined,
    lineaAlba: undefined as "si" | "no" | undefined,
    mordidaAbierta: undefined as "si" | "no" | undefined,
    mordidaCruzada: undefined as "si" | "no" | undefined,
    anodoncia: undefined as "si" | "no" | undefined,
    supernumerarios: undefined as "si" | "no" | undefined,
    macroglosia: undefined as "si" | "no" | undefined,
    frenilloLingual: undefined as "si" | "no" | undefined,
    observacionesIntraoral: "",

    // Enfermedades Sistémicas
    hipertension: undefined as "si" | "no" | undefined,
    hipertensionDesde: "",
    medicamentosPresion: undefined as "si" | "no" | undefined,
    medicamentosPresionCuales: "",
    diabetes: undefined as "si" | "no" | "no_recuerdo" | "nunca_tomada" | undefined,
    diabetesDesde: "",
    diabetesMedicamentos: "",
    nivelGlucosaFecha: "",
    nivelGlucosaResultado: "",
    
    // Enfermedades Infecciosas
    vih: undefined as "si" | "no" | undefined,
    herpes: undefined as "si" | "no" | undefined,
    sifilis: undefined as "si" | "no" | undefined,
    gonorrea: undefined as "si" | "no" | undefined,
    enfermedadesInfecciosasDetalles: "",
    
    // Alteraciones Renales/Hepáticas
    dialisis: undefined as "si" | "no" | undefined,
    alteracionRenal: undefined as "si" | "no" | undefined,
    alteracionHepatica: undefined as "si" | "no" | undefined,
    hepatitis: undefined as "si" | "no" | undefined,
    alteracionesRenalesDetalles: "",
    
    // Problemas Sanguíneos
    hemorragiasFrecuentes: undefined as "si" | "no" | undefined,
    problemasCoagulacion: undefined as "si" | "no" | undefined,
    sangradoNarizEncias: undefined as "si" | "no" | undefined,
    leucemiaHemofilia: undefined as "si" | "no" | undefined,
    aspirinasAnticoagulantes: undefined as "si" | "no" | undefined,
    problemasSanguineosDetalles: "",
    
    // Embarazo
    embarazada: undefined as "si" | "no" | undefined,
    semanasGestacion: "",
    abortosLegrados: undefined as "si" | "no" | undefined,
    numeroHijos: "",
    
    // Historia Clínica Dental
    ultimaVisitaDentista: "",
    anestesiaBoca: undefined as "si" | "no" | undefined,
    complicacionAnestesia: undefined as "si" | "no" | undefined,
    complicacionVisitaDental: undefined as "si" | "no" | undefined,
    impedimentoAnestesia: undefined as "si" | "no" | undefined,
    otraCondicionMedica: undefined as "si" | "no" | undefined,
    otraCondicionMedicaDetalles: "",

    // Periodontal
    periodontalSangradoSondaje: undefined as "si" | "no" | undefined,
    periodontalBolsas: undefined as "si" | "no" | undefined,
    periodontalBolsasDetalles: "",
    periodontalRetraccionGingival: undefined as "si" | "no" | undefined,
    periodontalRetraccionGingivalDetalles: "",
    periodontalSupuracion: undefined as "si" | "no" | undefined,
    periodontalSupuracionDetalles: "",
    periodontalMovilidad: undefined as "si" | "no" | undefined,
    periodontalMovilidadDetalles: "",
    periodontalFurcas: undefined as "si" | "no" | undefined,
    periodontalFurcasDetalles: "",
    periodontalPerdidaInsercion: undefined as "si" | "no" | undefined,
    periodontalPerdidaInsercionDetalles: "",
    periodontalGingivitis: undefined as "si" | "no" | undefined,
    periodontalPeriodontitis: undefined as "si" | "no" | undefined,
    periodontalPlaca: undefined as "si" | "no" | undefined,
    periodontalSarro: undefined as "si" | "no" | undefined,
    periodontalObservaciones: "",

    // Estudios Auxiliares
    estudioRadiografia: undefined as "si" | "no" | undefined,
    estudioRadiografiaDetalles: "",
    estudioModeloEstudio: undefined as "si" | "no" | undefined,
    estudioModeloEstudioDetalles: "",
    estudioFotografia: undefined as "si" | "no" | undefined,
    estudioFotografiaDetalles: "",
    estudioLaboratorio: undefined as "si" | "no" | undefined,
    estudioLaboratorioDetalles: "",
    estudioOtro: undefined as "si" | "no" | undefined,
    estudioOtroDetalles: "",

    // Tipo de Paciente
    tipoPaciente: "" as "charly" | "nomina" | "bancario" | "particular" | "",
  })

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const storedMode = localStorage.getItem("historiaClinicaColorMode")
    if (storedMode === "light" || storedMode === "dark") {
      setColorMode(storedMode)
      return
    }

    setColorMode(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  }, [])

  const toggleColorMode = () => {
    setColorMode((currentMode) => {
      const nextMode = currentMode === "dark" ? "light" : "dark"
      localStorage.setItem("historiaClinicaColorMode", nextMode)
      return nextMode
    })
  }

  // Cargar borrador guardado
  useEffect(() => {
    if (typeof window === "undefined" || loadedDraft) return

    try {
      const stored = localStorage.getItem("historiaClinicaDraft")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.formData) setFormData((prev) => ({ ...prev, ...parsed.formData }))
        if (typeof parsed.currentSection === "number") setCurrentSection(parsed.currentSection)
      }

      const storedNipVerified = localStorage.getItem("historiaClinicaNipVerified")
      const storedNipValue = localStorage.getItem("historiaClinicaNipValue")
      if (storedNipVerified === "true") setNipVerified(true)
      if (storedNipValue) setNipValue(storedNipValue)
    } catch (error) {
      console.error("Error al cargar borrador:", error)
    } finally {
      setLoadedDraft(true)
    }
  }, [loadedDraft])

  // Guardar borrador y estado de NIP en localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !loadedDraft) return
    try {
      localStorage.setItem("historiaClinicaDraft", JSON.stringify({ formData, currentSection }))
      localStorage.setItem("historiaClinicaNipVerified", nipVerified ? "true" : "false")
      localStorage.setItem("historiaClinicaNipValue", nipValue)
    } catch (error) {
      console.error("Error al guardar borrador:", error)
    }
  }, [formData, currentSection, nipVerified, nipValue, loadedDraft])

  const sections = [
    { title: "Datos del Consultorio", icon: MapPin },
    { title: "Datos Personales", icon: User },
    { title: "Historia Clínica Actual", icon: Stethoscope },
    { title: "Datos Socioeconómicos", icon: Building2 },
    { title: "Antecedentes Personales y Familiares", icon: Heart },
    { title: "Hábitos, Signos Vitales y Exploración", icon: Stethoscope },
    { title: "Enfermedades Sistémicas", icon: Heart },
    { title: "Enfermedades Infecciosas", icon: Heart },
    { title: "Alteraciones Renales/Hepáticas", icon: Heart },
    { title: "Problemas Sanguíneos", icon: Heart },
    { title: "Embarazo", icon: Heart },
    { title: "Historia Clínica Dental", icon: Heart },
    { title: "Periodontal", icon: Heart },
    { title: "Estudios Auxiliares", icon: Heart },
    { title: "Tipo de Paciente", icon: User },
  ]

  const nextSection = () => {
    console.log('Next button clicked, current section:', currentSection)
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      console.log('Already at last section')
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Mostrar video intro primero
  if (showVideoIntro) {
    return (
      <VideoIntro
        onVideoEnd={() => setShowVideoIntro(false)}
        onSkip={() => setShowVideoIntro(false)}
        title="Historia Clínica Dental"
      />
    )
  }

  return (
    <div className={`clinical-page clinical-page--${colorMode} min-h-screen w-full max-w-full relative overflow-x-hidden`}>
      {/* Fondo editorial de estudio */}
      <div className="clinical-ambient absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="clinical-orb clinical-orb--one" />
        <div className="clinical-orb clinical-orb--two" />
        <div className="clinical-orb clinical-orb--three" />
      </div>

      {/* Logo pequeño en esquina superior izquierda */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }}
        className="clinical-logo absolute top-4 left-4 z-50"
      >
        <Card className="clinical-logo-card p-2">
          <Image 
            src="/dents23-logo-final.png" 
            alt="Dent's 23" 
            width={120} 
            height={40}
            className="h-auto max-w-full object-contain"
            style={{ height: "auto" }}
          />
        </Card>
      </motion.div>

      {/* Botón CRM en esquina superior derecha */}
      <div className="clinical-actions absolute top-6 right-6 z-50 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={toggleColorMode}
          className="clinical-theme-button rounded-full"
          aria-label={colorMode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={colorMode === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          {colorMode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Link href="/crm">
          <Button variant="outline" size="sm" className="clinical-crm-button">
            Acceso CRM
          </Button>
        </Link>
      </div>

      <div className="clinical-container relative z-10 w-full max-w-5xl min-w-0 mx-auto px-3 sm:px-5 py-6 sm:py-8">
        {/* Header centrado */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="clinical-hero text-center mb-8 pt-20"
        >
          <div className="clinical-eyebrow" aria-hidden="true">
            <span /> Historia clínica digital <span />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 break-words">
            Bienvenido a<br />Dent's 23
          </h1>
          <p className="clinical-tagline text-lg sm:text-xl font-medium tracking-[0.28em]">WE SERVE PEOPLE</p>
        </motion.div>

        {/* Stepper Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="clinical-stepper mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                key={currentSection}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="clinical-stepper-label rounded-full px-3 py-1"
              >
                <span className="text-white text-xs font-bold">
                  {sections[currentSection]?.title || "Inicio"}
                </span>
              </motion.div>
            </div>
            <div className="clinical-stepper-percent rounded-full px-3 py-1">
              <span className="text-white text-xs font-bold">
                {Math.round(((currentSection + 1) / sections.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex min-w-0 items-center gap-0.5 sm:gap-1.5 mb-3">
            {sections.map((sec, idx) => {
              const isActive = idx === currentSection
              const isCompleted = idx < currentSection
              const Icon = sec.icon
              return (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (idx <= currentSection + 1) setCurrentSection(idx)
                  }}
                  className="relative group min-w-0 flex-1"
                >
                  <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${
                    isActive ? "opacity-100" : isCompleted ? "opacity-80" : "opacity-40"
                  }`}>
                    <div className={`clinical-step-dot w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? "clinical-step-dot--active scale-110"
                        : isCompleted
                        ? "clinical-step-dot--completed"
                        : "clinical-step-dot--upcoming"
                    }`}>
                      {isCompleted ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>
                  </div>
                  {idx < sections.length - 1 && (
                    <div className={`clinical-step-connector absolute top-2.5 sm:top-4 left-1/2 w-full h-0.5 transition-all duration-500 ${
                      isCompleted ? "clinical-step-connector--completed" : "clinical-step-connector--upcoming"
                    }`} />
                  )}
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-teal-700 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap pointer-events-none">
                    {sec.title}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Progress line */}
          <div className="clinical-progress-track w-full h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="clinical-progress-value h-full rounded-full"
            />
          </div>
        </motion.div>

        {/* Formulario */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
        >
          <Card className="clinical-card w-full min-w-0 max-w-full rounded-[1.75rem] overflow-hidden">
            <CardContent className="clinical-card-content min-w-0 max-w-full p-4 sm:p-7 md:p-10">
              <form className="clinical-form min-w-0 max-w-full space-y-8">
                
                {/* SECCIÓN 0: DATOS DEL CONSULTORIO */}
                {currentSection === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-full px-4 py-1.5 mb-3">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Sección 0 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Datos del Consultorio
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Información del consultorio y médico tratante</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="razonSocialConsultorio" className="text-base font-semibold">Razón social del consultorio</Label>
                        <Input id="razonSocialConsultorio" value={formData.razonSocialConsultorio} onChange={(e) => handleInputChange("razonSocialConsultorio", e.target.value)} className="h-12" />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="domicilioConsultorio" className="text-base font-semibold">Domicilio</Label>
                        <Input id="domicilioConsultorio" value={formData.domicilioConsultorio} onChange={(e) => handleInputChange("domicilioConsultorio", e.target.value)} placeholder="Calle y número" className="h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefonoConsultorio" className="text-base font-semibold">Teléfono</Label>
                        <Input id="telefonoConsultorio" type="tel" value={formData.telefonoConsultorio} onChange={(e) => handleInputChange("telefonoConsultorio", e.target.value)} className="h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mediosContactoConsultorio" className="text-base font-semibold">Medios de contacto</Label>
                        <Input id="mediosContactoConsultorio" value={formData.mediosContactoConsultorio} onChange={(e) => handleInputChange("mediosContactoConsultorio", e.target.value)} placeholder="Email, WhatsApp, etc." className="h-12" />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="matriz" className="text-base font-semibold">Matriz</Label>
                        <Input id="matriz" value={formData.matriz} onChange={(e) => handleInputChange("matriz", e.target.value)} className="h-12" />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="domicilioSucursales" className="text-base font-semibold">Domicilio de sucursales</Label>
                        <Input id="domicilioSucursales" value={formData.domicilioSucursales} onChange={(e) => handleInputChange("domicilioSucursales", e.target.value)} className="h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefonoSucursales" className="text-base font-semibold">Teléfono de sucursales</Label>
                        <Input id="telefonoSucursales" type="tel" value={formData.telefonoSucursales} onChange={(e) => handleInputChange("telefonoSucursales", e.target.value)} className="h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mediosContactoSucursales" className="text-base font-semibold">Medios de contacto de sucursales</Label>
                        <Input id="mediosContactoSucursales" value={formData.mediosContactoSucursales} onChange={(e) => handleInputChange("mediosContactoSucursales", e.target.value)} className="h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="odontologoTratante" className="text-base font-semibold">Odontólogo tratante</Label>
                        <Input id="odontologoTratante" value={formData.odontologoTratante} onChange={(e) => handleInputChange("odontologoTratante", e.target.value)} className="h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cedulaProfesional" className="text-base font-semibold">Cédula profesional</Label>
                        <Input id="cedulaProfesional" value={formData.cedulaProfesional} onChange={(e) => handleInputChange("cedulaProfesional", e.target.value)} className="h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ssGto" className="text-base font-semibold">S.S. GTO.</Label>
                        <Input id="ssGto" value={formData.ssGto} onChange={(e) => handleInputChange("ssGto", e.target.value)} className="h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="consultorioAtencion" className="text-base font-semibold">Consultorio donde se está atendiendo</Label>
                        <select id="consultorioAtencion" value={formData.consultorioAtencion} onChange={(e) => handleInputChange("consultorioAtencion", e.target.value)} className="w-full h-12 px-3 rounded-md border border-input bg-background text-lg">
                          <option value="">Seleccione</option>
                          <option value="Punto Escobedo">Punto Escobedo</option>
                          <option value="MAC">MAC</option>
                          <option value="Delta">Delta</option>
                          <option value="Charly">Charly</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fechaLlenado" className="text-base font-semibold">Fecha en la que se llena este expediente</Label>
                        <Input id="fechaLlenado" type="date" value={formData.fechaLlenado} onChange={(e) => handleInputChange("fechaLlenado", e.target.value)} className="h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="responsableRevision" className="text-base font-semibold">Responsable de la revisión</Label>
                        <Input id="responsableRevision" value={formData.responsableRevision} onChange={(e) => handleInputChange("responsableRevision", e.target.value)} placeholder="Dr. (a)" className="h-12" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SECCIÓN 1: DATOS PERSONALES */}
                {currentSection === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Título de la sección */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-full px-4 py-1.5 mb-3">
                        <User className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Sección 1 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Datos Personales
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Información básica del paciente</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/80 rounded-2xl p-5 mb-6 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-200">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-teal-600 uppercase tracking-wider">Folio del Expediente</p>
                          <p className="text-2xl font-extrabold text-teal-800 tracking-tight">{folio}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-teal-200/60">
                        <p className="text-sm text-teal-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          <strong>Fecha:</strong> {new Date(fecha).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nombre Completo */}
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="nombre" className="text-base font-semibold">
                          Nombre Completo <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange("nombre", e.target.value)}
                            placeholder="Nombre completo del paciente"
                            className="pl-10 h-12 text-lg"
                            required
                          />
                        </div>
                      </div>

                      {/* Ocupación */}
                      <div className="space-y-2">
                        <Label htmlFor="ocupacion" className="text-base font-semibold">
                          Ocupación
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="ocupacion"
                            value={formData.ocupacion}
                            onChange={(e) => handleInputChange("ocupacion", e.target.value)}
                            placeholder="Ocupación actual"
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>

                      {/* Edad (Desplegable) */}
                      <div className="space-y-2">
                        <Label htmlFor="edad" className="text-base font-semibold">
                          Edad <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id="edad"
                          value={formData.edad}
                          onChange={(e) => handleInputChange("edad", e.target.value)}
                          className="w-full h-12 px-3 rounded-md border border-input bg-background text-lg"
                          required
                        >
                          <option value="">Seleccione edad</option>
                          {Array.from({ length: 120 }, (_, i) => i + 1).map(age => (
                            <option key={age} value={age}>{age} años</option>
                          ))}
                        </select>
                      </div>

                      {/* Sexo (Iconos) */}
                      <div className="md:col-span-2">
                        <GenderSelector
                          label="Sexo"
                          value={formData.sexo}
                          onChange={(value) => handleInputChange("sexo", value)}
                        />
                      </div>

                      {/* Número de Celular */}
                      <div className="space-y-2">
                        <Label htmlFor="celular" className="text-base font-semibold">
                          No. Celular <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="celular"
                            type="tel"
                            value={formData.celular}
                            onChange={(e) => handleInputChange("celular", e.target.value)}
                            placeholder="10 dígitos"
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>

                      {/* Número de Contacto */}
                      <div className="space-y-2">
                        <Label htmlFor="contacto" className="text-base font-semibold">
                          No. Contacto
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="contacto"
                            type="tel"
                            value={formData.contacto}
                            onChange={(e) => handleInputChange("contacto", e.target.value)}
                            placeholder="Teléfono adicional"
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>

                      {/* WhatsApp */}
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp" className="text-base font-semibold">
                          WhatsApp
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-5 h-5 text-green-500" />
                          <Input
                            id="whatsapp"
                            type="tel"
                            value={formData.whatsapp}
                            onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                            placeholder="10 dígitos"
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>

                      {/* Correo Electrónico */}
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="email" className="text-base font-semibold">
                          Correo Electrónico
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="pl-10 h-12"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Paciente menor de edad */}
                    <div className="space-y-4">
                      <ThumbsSelector
                        label="¿El paciente es menor de edad?"
                        value={formData.esMenor}
                        onChange={(value) => {
                          handleInputChange("esMenor", value)
                          if (value === "no") {
                            handleInputChange("nombreMadre", "")
                            handleInputChange("nombrePadre", "")
                            handleInputChange("nombreTutor", "")
                            handleInputChange("ineResponsable", "")
                            handleInputChange("firmaResponsable", "")
                            handleInputChange("autorizaConsulta", "")
                          }
                        }}
                      />

                      {formData.esMenor === "si" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="nombreMadre" className="text-base font-semibold">Nombre de la madre</Label>
                              <Input id="nombreMadre" value={formData.nombreMadre} onChange={(e) => handleInputChange("nombreMadre", e.target.value)} className="h-12" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="nombrePadre" className="text-base font-semibold">Nombre del padre</Label>
                              <Input id="nombrePadre" value={formData.nombrePadre} onChange={(e) => handleInputChange("nombrePadre", e.target.value)} className="h-12" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <Label htmlFor="nombreTutor" className="text-base font-semibold">Nombre del tutor responsable</Label>
                              <Input id="nombreTutor" value={formData.nombreTutor} onChange={(e) => handleInputChange("nombreTutor", e.target.value)} className="h-12" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <Label htmlFor="autorizaConsulta" className="text-base font-semibold">¿Quién autoriza la consulta?</Label>
                              <Input id="autorizaConsulta" value={formData.autorizaConsulta} onChange={(e) => handleInputChange("autorizaConsulta", e.target.value)} placeholder="Nombre de la persona que autoriza la consulta" className="h-12" />
                            </div>
                          </div>

                          <SignaturePhotoCapture
                            signatureLabel="Firma del responsable"
                            photoLabel="Fotografía INE del responsable"
                            signatureValue={formData.firmaResponsable}
                            photoValue={formData.ineResponsable}
                            onSignatureChange={(signature) => handleInputChange("firmaResponsable", signature)}
                            onPhotoChange={(photo) => handleInputChange("ineResponsable", photo)}
                          />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* SECCIÓN 2: HISTORIA CLÍNICA ACTUAL */}
                {currentSection === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-full px-4 py-1.5 mb-3">
                        <Stethoscope className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Sección 2 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Historia Clínica Actual
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Motivo de la consulta y síntomas</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Motivo de la consulta */}
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="motivoConsulta" className="text-base font-semibold">
                          Motivo de la consulta <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="motivoConsulta"
                          value={formData.motivoConsulta}
                          onChange={(e) => handleInputChange("motivoConsulta", e.target.value)}
                          placeholder="¿Qué le trae hoy al consultorio?"
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Síntomas expresados por el paciente */}
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="sintomasPaciente" className="text-base font-semibold">
                          Síntomas expresados por el paciente
                        </Label>
                        <Textarea
                          id="sintomasPaciente"
                          value={formData.sintomasPaciente}
                          onChange={(e) => handleInputChange("sintomasPaciente", e.target.value)}
                          placeholder="Describa los síntomas con sus propias palabras"
                          className="min-h-[120px]"
                        />
                      </div>

                      {/* Desde cuándo comenzó */}
                      <div className="space-y-2">
                        <Label htmlFor="inicioSintomas" className="text-base font-semibold">
                          ¿Desde cuándo comenzó?
                        </Label>
                        <Input
                          id="inicioSintomas"
                          value={formData.inicioSintomas}
                          onChange={(e) => handleInputChange("inicioSintomas", e.target.value)}
                          placeholder="Días, semanas, meses..."
                          className="h-12"
                        />
                      </div>

                      {/* Intensidad */}
                      <div className="space-y-2">
                        <Label htmlFor="intensidad" className="text-base font-semibold">
                          Intensidad (0 = sin molestia, 10 = insoportable)
                        </Label>
                        <select
                          id="intensidad"
                          value={formData.intensidad}
                          onChange={(e) => handleInputChange("intensidad", e.target.value)}
                          className="w-full h-12 px-3 rounded-md border border-input bg-background text-lg"
                        >
                          <option value="">Seleccione</option>
                          {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>

                      {/* Frecuencia */}
                      <div className="space-y-2">
                        <Label htmlFor="frecuencia" className="text-base font-semibold">
                          Frecuencia
                        </Label>
                        <select
                          id="frecuencia"
                          value={formData.frecuencia}
                          onChange={(e) => handleInputChange("frecuencia", e.target.value)}
                          className="w-full h-12 px-3 rounded-md border border-input bg-background text-lg"
                        >
                          <option value="">Seleccione</option>
                          <option value="ocasional">Ocasional</option>
                          <option value="persistente">Persistente</option>
                          <option value="constante">Constante</option>
                          <option value="al-comer">Al comer</option>
                          <option value="al-masticar">Al masticar</option>
                          <option value="al-tomar-liquidos">Al tomar líquidos fríos/calientes</option>
                          <option value="al-presionar">Al presionar</option>
                          <option value="durante-la-noche">Durante la noche</option>
                        </select>
                      </div>

                      {/* Dolor */}
                      <div className="space-y-2">
                        <ThumbsSelector
                          label="¿Dolor?"
                          value={formData.dolor}
                          onChange={(value) => handleInputChange("dolor", value)}
                        />
                        {formData.dolor === "si" && (
                          <Input
                            value={formData.dolorDetalles}
                            onChange={(e) => handleInputChange("dolorDetalles", e.target.value)}
                            placeholder="¿Dónde y cómo?"
                            className="h-12"
                          />
                        )}
                      </div>

                      {/* Inflamación */}
                      <div className="space-y-2">
                        <ThumbsSelector
                          label="¿Inflamación?"
                          value={formData.inflamacion}
                          onChange={(value) => handleInputChange("inflamacion", value)}
                        />
                        {formData.inflamacion === "si" && (
                          <Input
                            value={formData.inflamacionDetalles}
                            onChange={(e) => handleInputChange("inflamacionDetalles", e.target.value)}
                            placeholder="Ubicación y duración"
                            className="h-12"
                          />
                        )}
                      </div>

                      {/* Sangrado */}
                      <div className="space-y-2">
                        <ThumbsSelector
                          label="¿Sangrado?"
                          value={formData.sangrado}
                          onChange={(value) => handleInputChange("sangrado", value)}
                        />
                        {formData.sangrado === "si" && (
                          <Input
                            value={formData.sangradoDetalles}
                            onChange={(e) => handleInputChange("sangradoDetalles", e.target.value)}
                            placeholder="Encías, heridas, cantidad..."
                            className="h-12"
                          />
                        )}
                      </div>

                      {/* Movilidad */}
                      <div className="space-y-2">
                        <ThumbsSelector
                          label="¿Movilidad?"
                          value={formData.movilidad}
                          onChange={(value) => handleInputChange("movilidad", value)}
                        />
                        {formData.movilidad === "si" && (
                          <Input
                            value={formData.movilidadDetalles}
                            onChange={(e) => handleInputChange("movilidadDetalles", e.target.value)}
                            placeholder="¿Qué diente(s) se mueve(n)?"
                            className="h-12"
                          />
                        )}
                      </div>

                      {/* Molestias */}
                      <div className="md:col-span-2 space-y-2">
                        <ThumbsSelector
                          label="¿Molestias generales?"
                          value={formData.molestias}
                          onChange={(value) => handleInputChange("molestias", value)}
                        />
                        {formData.molestias === "si" && (
                          <Textarea
                            value={formData.molestiasDetalles}
                            onChange={(e) => handleInputChange("molestiasDetalles", e.target.value)}
                            placeholder="Describa las molestias"
                            className="min-h-[100px]"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SECCIÓN 3: DATOS SOCIOECONÓMICOS */}
                {currentSection === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-8"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-full px-4 py-1.5 mb-3">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sección 3 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Datos Socioeconómicos
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Información de vivienda y trabajo</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Dirección */}
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="direccion" className="text-base font-semibold">
                          Dirección <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="direccion"
                            value={formData.direccion}
                            onChange={(e) => handleInputChange("direccion", e.target.value)}
                            placeholder="Calle y número"
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>

                      {/* Colonia */}
                      <div className="space-y-2">
                        <Label htmlFor="colonia" className="text-base font-semibold">
                          Colonia <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="colonia"
                          value={formData.colonia}
                          onChange={(e) => handleInputChange("colonia", e.target.value)}
                          placeholder="Colonia"
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Código Postal */}
                      <div className="space-y-2">
                        <Label htmlFor="codigoPostal" className="text-base font-semibold">
                          Código Postal <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="codigoPostal"
                          value={formData.codigoPostal}
                          onChange={(e) => handleInputChange("codigoPostal", e.target.value)}
                          placeholder="5 dígitos"
                          maxLength={5}
                          className="h-12"
                          required
                        />
                      </div>

                      {/* Su vivienda es propia */}
                      <div className="md:col-span-2">
                        <ThumbsSelector
                          label="¿Su vivienda es propia?"
                          value={formData.viviendaPropia}
                          onChange={(value) => handleInputChange("viviendaPropia", value)}
                          required
                        />
                      </div>

                      {/* Su vivienda cuenta con baño y agua potable */}
                      <div className="md:col-span-2">
                        <ThumbsSelector
                          label="¿Su vivienda cuenta con baño y agua potable?"
                          value={formData.viviendaBanoAgua}
                          onChange={(value) => handleInputChange("viviendaBanoAgua", value)}
                          required
                        />
                      </div>

                      {/* Cuántas personas dependen de usted */}
                      <div className="space-y-2">
                        <Label htmlFor="personasDependientes" className="text-base font-semibold">
                          ¿Cuántas personas dependen de usted?
                        </Label>
                        <div className="flex gap-2">
                          {[0, 1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleInputChange("personasDependientes", num.toString())}
                              className={`flex-1 h-14 rounded-lg border-2 font-bold text-lg transition-all ${
                                formData.personasDependientes === num.toString()
                                  ? "border-[#0891B2] bg-cyan-50 text-[#0E7490]"
                                  : "border-gray-300 hover:border-[#0891B2]/50"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Antigüedad en su trabajo actual */}
                      <div className="space-y-2">
                        <Label htmlFor="antiguedadTrabajo" className="text-base font-semibold">
                          Antigüedad en su trabajo actual
                        </Label>
                        <select
                          id="antiguedadTrabajo"
                          value={formData.antiguedadTrabajo}
                          onChange={(e) => handleInputChange("antiguedadTrabajo", e.target.value)}
                          className="w-full h-12 px-3 rounded-md border border-input bg-background text-lg"
                        >
                          <option value="">Seleccione años</option>
                          <option value="0">0 años</option>
                          <option value="menos-1">Menos de 1 año</option>
                          {Array.from({ length: 50 }, (_, i) => i + 1).map(years => (
                            <option key={years} value={years}>{years} {years === 1 ? 'año' : 'años'}</option>
                          ))}
                          <option value="mas-50">Más de 50 años</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SECCIÓN 4: ANTECEDENTES PERSONALES Y FAMILIARES */}
                {currentSection === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-full px-4 py-1.5 mb-3">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Sección 4 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Antecedentes Personales y Familiares
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Información sobre su salud y antecedentes familiares</p>
                    </motion.div>

                    {/* Antecedentes heredofamiliares */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 space-y-5">
                      <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                        <span className="text-2xl">🧬</span>
                        Antecedentes heredofamiliares
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ThumbsSelector
                          label="Diabetes"
                          value={formData.diabetesHeredofamiliar}
                          onChange={(value) => handleInputChange("diabetesHeredofamiliar", value)}
                        />
                        <ThumbsSelector
                          label="Hipertensión"
                          value={formData.hipertensionHeredofamiliar}
                          onChange={(value) => handleInputChange("hipertensionHeredofamiliar", value)}
                        />
                        <ThumbsSelector
                          label="Cardiovasculares"
                          value={formData.cardiovascularesHeredofamiliar}
                          onChange={(value) => handleInputChange("cardiovascularesHeredofamiliar", value)}
                        />
                        <ThumbsSelector
                          label="Trastornos de coagulación"
                          value={formData.coagulacionHeredofamiliar}
                          onChange={(value) => handleInputChange("coagulacionHeredofamiliar", value)}
                        />
                        <ThumbsSelector
                          label="Cáncer"
                          value={formData.cancerHeredofamiliar}
                          onChange={(value) => handleInputChange("cancerHeredofamiliar", value)}
                        />
                        <ThumbsSelector
                          label="Enfermedades hereditarias"
                          value={formData.hereditariasHeredofamiliar}
                          onChange={(value) => handleInputChange("hereditariasHeredofamiliar", value)}
                        />
                        <ThumbsSelector
                          label="Otras"
                          value={formData.otrasHeredofamiliar}
                          onChange={(value) => handleInputChange("otrasHeredofamiliar", value)}
                        />
                      </div>

                      {(formData.diabetesHeredofamiliar === "si" || formData.hipertensionHeredofamiliar === "si" || formData.cardiovascularesHeredofamiliar === "si" || formData.coagulacionHeredofamiliar === "si" || formData.cancerHeredofamiliar === "si" || formData.hereditariasHeredofamiliar === "si" || formData.otrasHeredofamiliar === "si") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Label htmlFor="heredofamiliarDetalles" className="text-amber-900 font-semibold">Especifique parentesco y condición</Label>
                          <Textarea
                            id="heredofamiliarDetalles"
                            value={formData.heredofamiliarDetalles}
                            onChange={(e) => handleInputChange("heredofamiliarDetalles", e.target.value)}
                            placeholder="Ej. padre con diabetes, abuela con cáncer..."
                            className="mt-2 min-h-[100px]"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* 4.1 Estado de salud */}
                    <div className="space-y-4">
                      <ThumbsSelector
                        label="4.1 ¿Su estado de salud actual es bueno?"
                        value={formData.saludBuena}
                        onChange={(value) => {
                          handleInputChange("saludBuena", value)
                          if (value === "si") {
                            handleInputChange("saludBuenaDetalles", "")
                          }
                        }}
                        required
                      />
                      
                      {formData.saludBuena === "no" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4"
                        >
                          <Label htmlFor="saludBuenaDetalles" className="text-red-600 font-semibold">
                            Por favor, explique su condición de salud *
                          </Label>
                          <Input
                            id="saludBuenaDetalles"
                            value={formData.saludBuenaDetalles}
                            onChange={(e) => handleInputChange("saludBuenaDetalles", e.target.value)}
                            placeholder="Describa su condición de salud"
                            className="mt-2 border-red-300 focus:border-red-500"
                            required
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* 4.2 Visita al médico */}
                    <div className="space-y-4">
                      <ThumbsSelector
                        label="4.2 ¿Ha acudido al médico en el último año?"
                        value={formData.medicoUltimoAnio}
                        onChange={(value) => {
                          handleInputChange("medicoUltimoAnio", value)
                          if (value === "no") {
                            handleInputChange("medicoUltimoAnioDetalles", "")
                          }
                        }}
                        required
                      />
                      
                      {formData.medicoUltimoAnio === "si" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4"
                        >
                          <Label htmlFor="medicoUltimoAnioDetalles" className="text-blue-600 font-semibold">
                            ¿Por qué motivo? *
                          </Label>
                          <Input
                            id="medicoUltimoAnioDetalles"
                            value={formData.medicoUltimoAnioDetalles}
                            onChange={(e) => handleInputChange("medicoUltimoAnioDetalles", e.target.value)}
                            placeholder="Motivo de la visita médica"
                            className="mt-2 border-blue-300 focus:border-blue-500"
                            required
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Antecedentes patológicos personales */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-5 space-y-5">
                      <h3 className="font-bold text-indigo-900 text-lg flex items-center gap-2">
                        <span className="text-2xl">🩺</span>
                        Antecedentes patológicos personales
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ThumbsSelector
                          label="¿Ha sido hospitalizado?"
                          value={formData.hospitalizado}
                          onChange={(value) => {
                            handleInputChange("hospitalizado", value)
                            if (value === "no") handleInputChange("hospitalizadoDetalles", "")
                          }}
                        />
                        {formData.hospitalizado === "si" && (
                          <Input
                            value={formData.hospitalizadoDetalles}
                            onChange={(e) => handleInputChange("hospitalizadoDetalles", e.target.value)}
                            placeholder="Motivo y fecha"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Ha sido intervenido quirúrgicamente?"
                          value={formData.cirugia}
                          onChange={(value) => {
                            handleInputChange("cirugia", value)
                            if (value === "no") handleInputChange("cirugiaDetalles", "")
                          }}
                        />
                        {formData.cirugia === "si" && (
                          <Input
                            value={formData.cirugiaDetalles}
                            onChange={(e) => handleInputChange("cirugiaDetalles", e.target.value)}
                            placeholder="Tipo de cirugía y fecha"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Ha recibido transfusiones sanguíneas?"
                          value={formData.transfusiones}
                          onChange={(value) => {
                            handleInputChange("transfusiones", value)
                            if (value === "no") handleInputChange("transfusionesDetalles", "")
                          }}
                        />
                        {formData.transfusiones === "si" && (
                          <Input
                            value={formData.transfusionesDetalles}
                            onChange={(e) => handleInputChange("transfusionesDetalles", e.target.value)}
                            placeholder="Cuándo y motivo"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Ha tenido traumatismos?"
                          value={formData.traumatismos}
                          onChange={(value) => {
                            handleInputChange("traumatismos", value)
                            if (value === "no") handleInputChange("traumatismosDetalles", "")
                          }}
                        />
                        {formData.traumatismos === "si" && (
                          <Input
                            value={formData.traumatismosDetalles}
                            onChange={(e) => handleInputChange("traumatismosDetalles", e.target.value)}
                            placeholder="Ubicación y secuelas"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Cardiopatías?"
                          value={formData.cardiopatias}
                          onChange={(value) => {
                            handleInputChange("cardiopatias", value)
                            if (value === "no") handleInputChange("cardiopatiasDetalles", "")
                          }}
                        />
                        {formData.cardiopatias === "si" && (
                          <Input
                            value={formData.cardiopatiasDetalles}
                            onChange={(e) => handleInputChange("cardiopatiasDetalles", e.target.value)}
                            placeholder="Especifique"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Enfermedades respiratorias?"
                          value={formData.respiratorias}
                          onChange={(value) => {
                            handleInputChange("respiratorias", value)
                            if (value === "no") handleInputChange("respiratoriasDetalles", "")
                          }}
                        />
                        {formData.respiratorias === "si" && (
                          <Input
                            value={formData.respiratoriasDetalles}
                            onChange={(e) => handleInputChange("respiratoriasDetalles", e.target.value)}
                            placeholder="Asma, EPOC, etc."
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Epilepsia o convulsiones?"
                          value={formData.epilepsia}
                          onChange={(value) => {
                            handleInputChange("epilepsia", value)
                            if (value === "no") handleInputChange("epilepsiaDetalles", "")
                          }}
                        />
                        {formData.epilepsia === "si" && (
                          <Input
                            value={formData.epilepsiaDetalles}
                            onChange={(e) => handleInputChange("epilepsiaDetalles", e.target.value)}
                            placeholder="Frecuencia y medicación"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Marcapasos o marcapasos/deshibrilador?"
                          value={formData.marcapasos}
                          onChange={(value) => {
                            handleInputChange("marcapasos", value)
                            if (value === "no") handleInputChange("marcapasosDetalles", "")
                          }}
                        />
                        {formData.marcapasos === "si" && (
                          <Input
                            value={formData.marcapasosDetalles}
                            onChange={(e) => handleInputChange("marcapasosDetalles", e.target.value)}
                            placeholder="Motivo y tiempo con el dispositivo"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Prótesis valvular o cardíaca?"
                          value={formData.protesisValvular}
                          onChange={(value) => {
                            handleInputChange("protesisValvular", value)
                            if (value === "no") handleInputChange("protesisValvularDetalles", "")
                          }}
                        />
                        {formData.protesisValvular === "si" && (
                          <Input
                            value={formData.protesisValvularDetalles}
                            onChange={(e) => handleInputChange("protesisValvularDetalles", e.target.value)}
                            placeholder="Tipo de prótesis"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Toma bifosfonatos u osteonecrosis?"
                          value={formData.bifosfonatos}
                          onChange={(value) => {
                            handleInputChange("bifosfonatos", value)
                            if (value === "no") handleInputChange("bifosfonatosDetalles", "")
                          }}
                        />
                        {formData.bifosfonatos === "si" && (
                          <Input
                            value={formData.bifosfonatosDetalles}
                            onChange={(e) => handleInputChange("bifosfonatosDetalles", e.target.value)}
                            placeholder="Cuál y desde cuándo"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="¿Tratamiento oncológico actual o previo?"
                          value={formData.oncologico}
                          onChange={(value) => {
                            handleInputChange("oncologico", value)
                            if (value === "no") handleInputChange("oncologicoDetalles", "")
                          }}
                        />
                        {formData.oncologico === "si" && (
                          <Input
                            value={formData.oncologicoDetalles}
                            onChange={(e) => handleInputChange("oncologicoDetalles", e.target.value)}
                            placeholder="Tipo de cáncer y tratamiento"
                            className="h-12"
                          />
                        )}
                      </div>
                    </div>

                    {/* 4.3 Alérgico a medicamentos - CON ALERTA AL CRM */}
                    <div className="space-y-4">
                      <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">⚠️</span>
                          <span className="font-bold text-amber-900">PREGUNTA CRÍTICA</span>
                        </div>
                        <ThumbsSelector
                          label="4.3 ¿Es alérgico a algún medicamento?"
                          value={formData.alergicoMedicamento}
                          onChange={(value) => {
                            handleInputChange("alergicoMedicamento", value)
                            if (value === "no") {
                              handleInputChange("alergicoMedicamentoCual", "")
                            } else if (value === "si") {
                              // Generar alerta al CRM
                              alertSystem.addAlert(
                                'alergias',
                                'alta',
                                'Paciente con alergias a medicamentos',
                                'Revisar detalles antes de prescribir cualquier medicamento'
                              )
                            }
                          }}
                          required
                        />
                      </div>
                      
                      {formData.alergicoMedicamento === "si" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4"
                        >
                          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                            <Label htmlFor="alergicoMedicamentoCual" className="text-red-700 font-bold text-lg">
                              🚨 ¿A cuál medicamento? * (ALERTA AL CRM)
                            </Label>
                            <Input
                              id="alergicoMedicamentoCual"
                              value={formData.alergicoMedicamentoCual}
                              onChange={(e) => {
                                handleInputChange("alergicoMedicamentoCual", e.target.value)
                                if (e.target.value) {
                                  alertSystem.addAlert(
                                    'alergias',
                                    'alta',
                                    `Alergia a: ${e.target.value}`,
                                    'PRECAUCIÓN: No administrar este medicamento'
                                  )
                                }
                              }}
                              placeholder="Nombre del medicamento"
                              className="mt-2 border-red-500 focus:border-red-700 text-lg font-semibold"
                              required
                            />
                            <p className="text-xs text-red-600 mt-2">
                              Esta información se marcará como ALERTA en el CRM
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Otras alergias */}
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-200 rounded-xl p-5 space-y-5">
                      <h3 className="font-bold text-rose-900 text-lg flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        Otras alergias
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ThumbsSelector
                          label="Anestésicos locales"
                          value={formData.alergiaAnestesicos}
                          onChange={(value) => {
                            handleInputChange("alergiaAnestesicos", value)
                            if (value === "no") handleInputChange("alergiaAnestesicosDetalles", "")
                          }}
                        />
                        {formData.alergiaAnestesicos === "si" && (
                          <Input
                            value={formData.alergiaAnestesicosDetalles}
                            onChange={(e) => handleInputChange("alergiaAnestesicosDetalles", e.target.value)}
                            placeholder="Especifique la reacción"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="Látex"
                          value={formData.alergiaLatex}
                          onChange={(value) => {
                            handleInputChange("alergiaLatex", value)
                            if (value === "no") handleInputChange("alergiaLatexDetalles", "")
                          }}
                        />
                        {formData.alergiaLatex === "si" && (
                          <Input
                            value={formData.alergiaLatexDetalles}
                            onChange={(e) => handleInputChange("alergiaLatexDetalles", e.target.value)}
                            placeholder="Especifique la reacción"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="Material dental"
                          value={formData.alergiaMaterialDental}
                          onChange={(value) => {
                            handleInputChange("alergiaMaterialDental", value)
                            if (value === "no") handleInputChange("alergiaMaterialDentalDetalles", "")
                          }}
                        />
                        {formData.alergiaMaterialDental === "si" && (
                          <Input
                            value={formData.alergiaMaterialDentalDetalles}
                            onChange={(e) => handleInputChange("alergiaMaterialDentalDetalles", e.target.value)}
                            placeholder="Especifique material"
                            className="h-12"
                          />
                        )}

                        <ThumbsSelector
                          label="Otras alergias"
                          value={formData.alergiaOtros}
                          onChange={(value) => {
                            handleInputChange("alergiaOtros", value)
                            if (value === "no") handleInputChange("alergiaOtrosDetalles", "")
                          }}
                        />
                        {formData.alergiaOtros === "si" && (
                          <Input
                            value={formData.alergiaOtrosDetalles}
                            onChange={(e) => handleInputChange("alergiaOtrosDetalles", e.target.value)}
                            placeholder="Especifique alérgeno y reacción"
                            className="h-12"
                          />
                        )}
                      </div>
                    </div>

                    {/* 4.4 Toma medicamentos - CON ALERTA AL CRM */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">💊</span>
                          <span className="font-bold text-blue-900">PREGUNTA IMPORTANTE</span>
                        </div>
                        <ThumbsSelector
                          label="4.4 ¿Toma algún medicamento regularmente?"
                          value={formData.tomaMedicamento}
                          onChange={(value) => {
                            handleInputChange("tomaMedicamento", value)
                            if (value === "no") {
                              handleInputChange("tomaMedicamentoCual", "")
                            } else if (value === "si") {
                              // Generar alerta al CRM
                              alertSystem.addAlert(
                                'medicamentos',
                                'media',
                                'Paciente toma medicamentos regularmente',
                                'Verificar interacciones medicamentosas'
                              )
                            }
                          }}
                          required
                        />
                      </div>
                      
                      {formData.tomaMedicamento === "si" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4"
                        >
                          <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                            <Label htmlFor="tomaMedicamentoCual" className="text-blue-700 font-bold text-lg">
                              💊 ¿Cuál medicamento? * (ALERTA AL CRM)
                            </Label>
                            <Input
                              id="tomaMedicamentoCual"
                              value={formData.tomaMedicamentoCual}
                              onChange={(e) => {
                                handleInputChange("tomaMedicamentoCual", e.target.value)
                                if (e.target.value) {
                                  alertSystem.addAlert(
                                    'medicamentos',
                                    'media',
                                    `Medicamento actual: ${e.target.value}`,
                                    'Considerar interacciones antes de prescribir'
                                  )
                                }
                              }}
                              placeholder="Nombre y dosis del medicamento"
                              className="mt-2 border-blue-500 focus:border-blue-700 text-lg"
                              required
                            />
                            <Label htmlFor="tomaMedicamentoFrecuencia" className="text-blue-700 font-semibold mt-4 block">
                              ¿Con qué frecuencia lo toma?
                            </Label>
                            <Input
                              id="tomaMedicamentoFrecuencia"
                              value={formData.tomaMedicamentoFrecuencia}
                              onChange={(e) => handleInputChange("tomaMedicamentoFrecuencia", e.target.value)}
                              placeholder="Ej. cada 8 horas, una vez al día"
                              className="mt-2 border-blue-300 focus:border-blue-500"
                            />
                            <p className="text-xs text-blue-600 mt-2">
                              Esta información se marcará como ALERTA en el CRM
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Resumen de Alertas */}
                    {(formData.alergicoMedicamento === "si" || formData.tomaMedicamento === "si" || formData.alergiaAnestesicos === "si" || formData.alergiaLatex === "si" || formData.alergiaMaterialDental === "si" || formData.alergiaOtros === "si" || formData.hospitalizado === "si" || formData.cirugia === "si" || formData.transfusiones === "si" || formData.epilepsia === "si" || formData.marcapasos === "si" || formData.protesisValvular === "si" || formData.bifosfonatos === "si" || formData.oncologico === "si" || formData.cardiopatias === "si" || formData.respiratorias === "si") && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-red-100 to-amber-100 border-2 border-red-500 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🚨</span>
                          <div>
                            <h4 className="font-bold text-red-900 text-lg">Alertas Generadas para el CRM</h4>
                            <p className="text-sm text-red-700">
                              {alertSystem.getAlertCount().total} alerta(s) médica(s) registrada(s)
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* SECCIÓN 5: HÁBITOS, SIGNOS VITALES Y EXPLORACIÓN */}
                {currentSection === 5 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-3">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Sección 5 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Hábitos, Signos Vitales y Exploración
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Hábitos, signos vitales y exploración física</p>
                    </motion.div>

                    {/* Hábitos */}
                    <div className="bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-200 rounded-xl p-5 space-y-5">
                      <h3 className="font-bold text-green-900 text-lg flex items-center gap-2">
                        <span className="text-2xl">🌿</span>
                        Hábitos
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <ThumbsSelector
                            label="¿Fuma o consume tabaco?"
                            value={formData.tabaquismo}
                            onChange={(value) => {
                              handleInputChange("tabaquismo", value)
                              if (value === "no") handleInputChange("tabaquismoFrecuencia", "")
                            }}
                          />
                          {formData.tabaquismo === "si" && (
                            <Input
                              value={formData.tabaquismoFrecuencia}
                              onChange={(e) => handleInputChange("tabaquismoFrecuencia", e.target.value)}
                              placeholder="Frecuencia"
                              className="h-12"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <ThumbsSelector
                            label="¿Consume bebidas alcohólicas?"
                            value={formData.alcoholismo}
                            onChange={(value) => {
                              handleInputChange("alcoholismo", value)
                              if (value === "no") handleInputChange("alcoholismoFrecuencia", "")
                            }}
                          />
                          {formData.alcoholismo === "si" && (
                            <Input
                              value={formData.alcoholismoFrecuencia}
                              onChange={(e) => handleInputChange("alcoholismoFrecuencia", e.target.value)}
                              placeholder="Frecuencia"
                              className="h-12"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <ThumbsSelector
                            label="¿Usa drogas o sustancias?"
                            value={formData.drogas}
                            onChange={(value) => {
                              handleInputChange("drogas", value)
                              if (value === "no") handleInputChange("drogasDetalles", "")
                            }}
                          />
                          {formData.drogas === "si" && (
                            <Input
                              value={formData.drogasDetalles}
                              onChange={(e) => handleInputChange("drogasDetalles", e.target.value)}
                              placeholder="Cuál y frecuencia"
                              className="h-12"
                            />
                          )}
                        </div>

                        <ThumbsSelector
                          label="Mordida de uñas"
                          value={formData.mordidaUnias}
                          onChange={(value) => handleInputChange("mordidaUnias", value)}
                        />
                        <ThumbsSelector
                          label="Bruxismo (rechinar de dientes)"
                          value={formData.bruxismo}
                          onChange={(value) => handleInputChange("bruxismo", value)}
                        />
                        <ThumbsSelector
                          label="Morder objetos"
                          value={formData.morderObjetos}
                          onChange={(value) => handleInputChange("morderObjetos", value)}
                        />
                        <ThumbsSelector
                          label="Succión labial"
                          value={formData.succionLabial}
                          onChange={(value) => handleInputChange("succionLabial", value)}
                        />
                        <ThumbsSelector
                          label="Succión digital"
                          value={formData.succionDigital}
                          onChange={(value) => handleInputChange("succionDigital", value)}
                        />
                        <ThumbsSelector
                          label="Respiración bucal"
                          value={formData.respiracionBucal}
                          onChange={(value) => handleInputChange("respiracionBucal", value)}
                        />
                        <ThumbsSelector
                          label="Lengua pendular"
                          value={formData.linguaPendular}
                          onChange={(value) => handleInputChange("linguaPendular", value)}
                        />
                        <ThumbsSelector
                          label="Succión de chupete"
                          value={formData.succionChupete}
                          onChange={(value) => handleInputChange("succionChupete", value)}
                        />
                        <ThumbsSelector
                          label="Hipertrofia de elementos dentales"
                          value={formData.hipertrofiaDental}
                          onChange={(value) => handleInputChange("hipertrofiaDental", value)}
                        />
                        <ThumbsSelector
                          label="Ingesta frecuente de carbohidratos"
                          value={formData.ingestaAlimentosCarbohidratos}
                          onChange={(value) => handleInputChange("ingestaAlimentosCarbohidratos", value)}
                        />
                        <ThumbsSelector
                          label="¿Usa hilo dental?"
                          value={formData.usaHiloDental}
                          onChange={(value) => handleInputChange("usaHiloDental", value)}
                        />
                        <ThumbsSelector
                          label="¿Usa enjuague bucal?"
                          value={formData.enjuagueBucal}
                          onChange={(value) => handleInputChange("enjuagueBucal", value)}
                        />

                        <div className="space-y-2">
                          <Label htmlFor="cepilladoDiario" className="text-base font-semibold">Cepillados al día</Label>
                          <Input
                            id="cepilladoDiario"
                            type="number"
                            value={formData.cepilladoDiario}
                            onChange={(e) => handleInputChange("cepilladoDiario", e.target.value)}
                            placeholder="Ej. 2"
                            className="h-12"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Signos vitales */}
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 rounded-xl p-5 space-y-5">
                      <h3 className="font-bold text-sky-900 text-lg flex items-center gap-2">
                        <span className="text-2xl">🩺</span>
                        Signos vitales
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="presionArterial" className="text-base font-semibold">Presión arterial</Label>
                          <Input
                            id="presionArterial"
                            value={formData.presionArterial}
                            onChange={(e) => handleInputChange("presionArterial", e.target.value)}
                            placeholder="120/80 mmHg"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="frecuenciaCardiaca" className="text-base font-semibold">Frecuencia cardíaca</Label>
                          <Input
                            id="frecuenciaCardiaca"
                            value={formData.frecuenciaCardiaca}
                            onChange={(e) => handleInputChange("frecuenciaCardiaca", e.target.value)}
                            placeholder="lpm"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="frecuenciaRespiratoria" className="text-base font-semibold">Frecuencia respiratoria</Label>
                          <Input
                            id="frecuenciaRespiratoria"
                            value={formData.frecuenciaRespiratoria}
                            onChange={(e) => handleInputChange("frecuenciaRespiratoria", e.target.value)}
                            placeholder="rpm"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="temperatura" className="text-base font-semibold">Temperatura</Label>
                          <Input
                            id="temperatura"
                            value={formData.temperatura}
                            onChange={(e) => handleInputChange("temperatura", e.target.value)}
                            placeholder="°C"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="peso" className="text-base font-semibold">Peso (kg)</Label>
                          <Input
                            id="peso"
                            type="number"
                            value={formData.peso}
                            onChange={(e) => {
                              handleInputChange("peso", e.target.value)
                              const p = parseFloat(e.target.value)
                              const t = parseFloat(formData.talla)
                              if (p && t) {
                                handleInputChange("imc", (p / (t * t)).toFixed(1))
                              } else {
                                handleInputChange("imc", "")
                              }
                            }}
                            placeholder="kg"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="talla" className="text-base font-semibold">Talla (m)</Label>
                          <Input
                            id="talla"
                            type="number"
                            value={formData.talla}
                            onChange={(e) => {
                              handleInputChange("talla", e.target.value)
                              const p = parseFloat(formData.peso)
                              const t = parseFloat(e.target.value)
                              if (p && t) {
                                handleInputChange("imc", (p / (t * t)).toFixed(1))
                              } else {
                                handleInputChange("imc", "")
                              }
                            }}
                            placeholder="m"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="imc" className="text-base font-semibold">IMC</Label>
                          <Input
                            id="imc"
                            value={formData.imc}
                            onChange={(e) => handleInputChange("imc", e.target.value)}
                            placeholder="Índice de masa corporal"
                            className="h-12"
                            readOnly
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="glucosa" className="text-base font-semibold">Glucosa capilar</Label>
                          <Input
                            id="glucosa"
                            value={formData.glucosa}
                            onChange={(e) => handleInputChange("glucosa", e.target.value)}
                            placeholder="mg/dL"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="oxigenacion" className="text-base font-semibold">SpO2</Label>
                          <Input
                            id="oxigenacion"
                            value={formData.oxigenacion}
                            onChange={(e) => handleInputChange("oxigenacion", e.target.value)}
                            placeholder="%"
                            className="h-12"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Exploración extraoral */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-200 rounded-xl p-5 space-y-5">
                      <h3 className="font-bold text-violet-900 text-lg flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        Exploración extraoral
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="facies" className="text-base font-semibold">Facies</Label>
                          <Input
                            id="facies"
                            value={formData.facies}
                            onChange={(e) => handleInputChange("facies", e.target.value)}
                            placeholder="Ej. mesofacial, dolicofacial"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="simetriaFacial" className="text-base font-semibold">Simetría facial</Label>
                          <Input
                            id="simetriaFacial"
                            value={formData.simetriaFacial}
                            onChange={(e) => handleInputChange("simetriaFacial", e.target.value)}
                            placeholder="Simétrica / asimétrica"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gangliosLinfaticos" className="text-base font-semibold">Ganglios linfáticos</Label>
                          <Input
                            id="gangliosLinfaticos"
                            value={formData.gangliosLinfaticos}
                            onChange={(e) => handleInputChange("gangliosLinfaticos", e.target.value)}
                            placeholder="Normales / aumentados"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="atm" className="text-base font-semibold">ATM</Label>
                          <Input
                            id="atm"
                            value={formData.atm}
                            onChange={(e) => handleInputChange("atm", e.target.value)}
                            placeholder="Normal / anormal"
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="movilidadMandibular" className="text-base font-semibold">Movilidad mandibular</Label>
                          <Input
                            id="movilidadMandibular"
                            value={formData.movilidadMandibular}
                            onChange={(e) => handleInputChange("movilidadMandibular", e.target.value)}
                            placeholder="Ej. apertura 40 mm"
                            className="h-12"
                          />
                        </div>

                        <ThumbsSelector
                          label="Ruidos articulares"
                          value={formData.ruidosArticulares}
                          onChange={(value) => handleInputChange("ruidosArticulares", value)}
                        />
                        <ThumbsSelector
                          label="Limitación de apertura"
                          value={formData.limitacionApertura}
                          onChange={(value) => handleInputChange("limitacionApertura", value)}
                        />
                        <ThumbsSelector
                          label="Dolor a la palpación"
                          value={formData.dolorPalpacion}
                          onChange={(value) => handleInputChange("dolorPalpacion", value)}
                        />
                      </div>
                    </div>

                    {/* Exploración intraoral */}
                    <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 border-2 border-fuchsia-200 rounded-xl p-5 space-y-5">
                      <h3 className="font-bold text-fuchsia-900 text-lg flex items-center gap-2">
                        <span className="text-2xl">🦷</span>
                        Exploración intraoral
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Labios", key: "labios" },
                          { label: "Mejillas", key: "mejillas" },
                          { label: "Encía", key: "encia" },
                          { label: "Paladar", key: "paladar" },
                          { label: "Piso de boca", key: "pisoBoca" },
                          { label: "Lengua", key: "lengua" },
                          { label: "Orofaringe", key: "orofaringe" },
                          { label: "Salivación", key: "salivacion" },
                          { label: "Higiene bucal", key: "higieneBucalIntraoral" },
                          { label: "Maloclusión", key: "malOclusion" },
                        ].map(({ label, key }) => (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={key} className="text-base font-semibold">{label}</Label>
                            <Input
                              id={key}
                              value={formData[key as keyof typeof formData] as string}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              placeholder="Normal / observaciones"
                              className="h-12"
                            />
                          </div>
                        ))}

                        <ThumbsSelector
                          label="Placa bacteriana"
                          value={formData.placaBacteriana}
                          onChange={(value) => handleInputChange("placaBacteriana", value)}
                        />
                        <ThumbsSelector
                          label="Sangrado de encías"
                          value={formData.sangradoEncias}
                          onChange={(value) => handleInputChange("sangradoEncias", value)}
                        />
                        <ThumbsSelector
                          label="Cálculos o sarro"
                          value={formData.calculos}
                          onChange={(value) => handleInputChange("calculos", value)}
                        />
                        <ThumbsSelector
                          label="Halitosis"
                          value={formData.halitosis}
                          onChange={(value) => handleInputChange("halitosis", value)}
                        />
                        <ThumbsSelector
                          label="Diastemas"
                          value={formData.diastemas}
                          onChange={(value) => handleInputChange("diastemas", value)}
                        />
                        <ThumbsSelector
                          label="Línea alba"
                          value={formData.lineaAlba}
                          onChange={(value) => handleInputChange("lineaAlba", value)}
                        />
                        <ThumbsSelector
                          label="Mordida abierta"
                          value={formData.mordidaAbierta}
                          onChange={(value) => handleInputChange("mordidaAbierta", value)}
                        />
                        <ThumbsSelector
                          label="Mordida cruzada"
                          value={formData.mordidaCruzada}
                          onChange={(value) => handleInputChange("mordidaCruzada", value)}
                        />
                        <ThumbsSelector
                          label="Anodoncia"
                          value={formData.anodoncia}
                          onChange={(value) => handleInputChange("anodoncia", value)}
                        />
                        <ThumbsSelector
                          label="Supernumerarios"
                          value={formData.supernumerarios}
                          onChange={(value) => handleInputChange("supernumerarios", value)}
                        />
                        <ThumbsSelector
                          label="Macroglosia"
                          value={formData.macroglosia}
                          onChange={(value) => handleInputChange("macroglosia", value)}
                        />
                        <ThumbsSelector
                          label="Frenillo lingual anormal"
                          value={formData.frenilloLingual}
                          onChange={(value) => handleInputChange("frenilloLingual", value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="observacionesIntraoral" className="text-base font-semibold">Observaciones</Label>
                        <Textarea
                          id="observacionesIntraoral"
                          value={formData.observacionesIntraoral}
                          onChange={(e) => handleInputChange("observacionesIntraoral", e.target.value)}
                          placeholder="Hallazgos adicionales"
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SECCIÓN 6: ENFERMEDADES SISTÉMICAS */}
                {currentSection === 6 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-full px-4 py-1.5 mb-3">
                        <Stethoscope className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Sección 6 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Enfermedades Sistémicas
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Condiciones que pueden afectar el tratamiento dental</p>
                    </motion.div>
                    {/* 5.1 Hipertensión arterial */}
                    <div className="space-y-4">
                      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">❤️</span>
                          <span className="font-bold text-red-900">PREGUNTA CRÍTICA</span>
                        </div>
                        <ThumbsSelector
                          label="5.1 ¿Sufre usted de hipertensión arterial?"
                          value={formData.hipertension}
                          onChange={(value) => {
                            handleInputChange("hipertension", value)
                            if (value === "no") {
                              handleInputChange("hipertensionDesde", "")
                            } else if (value === "si") {
                              alertSystem.addAlert(
                                'enfermedades',
                                'alta',
                                'Paciente con hipertensión arterial',
                                'Monitorear presión arterial antes de procedimientos'
                              )
                            }
                          }}
                          required
                        />
                      </div>
                      
                      {formData.hipertension === "si" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4"
                        >
                          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                            <Label htmlFor="hipertensionDesde" className="text-red-700 font-bold text-lg">
                              ❤️ ¿Desde cuándo? * (ALERTA AL CRM)
                            </Label>
                            <Input
                              id="hipertensionDesde"
                              value={formData.hipertensionDesde}
                              onChange={(e) => {
                                handleInputChange("hipertensionDesde", e.target.value)
                                if (e.target.value) {
                                  alertSystem.addAlert(
                                    'enfermedades',
                                    'alta',
                                    `Hipertensión desde: ${e.target.value}`,
                                    'Verificar control de presión arterial'
                                  )
                                }
                              }}
                              placeholder="Ej: 2 años, 6 meses"
                              className="mt-2 border-red-500 focus:border-red-700 text-lg"
                              required
                            />
                            <p className="text-xs text-red-600 mt-2">
                              ⚠️ Esta información se marcará como ALERTA en el CRM
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* 5.2 Medicamentos para presión arterial */}
                    <div className="space-y-4">
                      <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">💊</span>
                          <span className="font-bold text-orange-900">PREGUNTA IMPORTANTE</span>
                        </div>
                        <ThumbsSelector
                          label="5.2 ¿Toma medicamentos para controlar la presión arterial?"
                          value={formData.medicamentosPresion}
                          onChange={(value) => {
                            handleInputChange("medicamentosPresion", value)
                            if (value === "no") {
                              handleInputChange("medicamentosPresionCuales", "")
                            } else if (value === "si") {
                              alertSystem.addAlert(
                                'medicamentos',
                                'alta',
                                'Paciente toma medicamentos para presión arterial',
                                'Considerar interacciones medicamentosas'
                              )
                            }
                          }}
                          required
                        />
                      </div>
                      
                      {formData.medicamentosPresion === "si" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4"
                        >
                          <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
                            <Label htmlFor="medicamentosPresionCuales" className="text-orange-700 font-bold text-lg">
                              💊 ¿Cuáles medicamentos? * (ALERTA AL CRM)
                            </Label>
                            <Input
                              id="medicamentosPresionCuales"
                              value={formData.medicamentosPresionCuales}
                              onChange={(e) => {
                                handleInputChange("medicamentosPresionCuales", e.target.value)
                                if (e.target.value) {
                                  alertSystem.addAlert(
                                    'medicamentos',
                                    'alta',
                                    `Medicamentos para presión: ${e.target.value}`,
                                    'Verificar antes de administrar anestesia'
                                  )
                                }
                              }}
                              placeholder="Nombre y dosis de los medicamentos"
                              className="mt-2 border-orange-500 focus:border-orange-700 text-lg"
                              required
                            />
                            <p className="text-xs text-orange-600 mt-2">
                              ⚠️ Esta información se marcará como ALERTA en el CRM
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* 5.3 Diabetes */}
                    <div className="space-y-4">
                      <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🩸</span>
                          <span className="font-bold text-purple-900">PREGUNTA CRÍTICA</span>
                        </div>
                        <DiabetesSelector
                          label="5.3 ¿Padece de diabetes o sospecha tenerla?"
                          value={formData.diabetes}
                          onChange={(value) => {
                            handleInputChange("diabetes", value)
                            if (value === "no" || value === "no_recuerdo" || value === "nunca_tomada") {
                              handleInputChange("diabetesDesde", "")
                              handleInputChange("diabetesMedicamentos", "")
                            } else if (value === "si") {
                              alertSystem.addAlert(
                                'enfermedades',
                                'alta',
                                'Paciente con diabetes',
                                'CRÍTICO: Verificar nivel de glucosa y cicatrización'
                              )
                            }
                          }}
                          required
                        />
                      </div>
                      
                      {formData.diabetes === "si" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 space-y-4"
                        >
                          <div className="bg-purple-50 border-2 border-purple-500 rounded-lg p-4 space-y-4">
                            <div>
                              <Label htmlFor="diabetesDesde" className="text-purple-700 font-bold text-lg">
                                🩸 ¿Desde cuándo? * (ALERTA AL CRM)
                              </Label>
                              <Input
                                id="diabetesDesde"
                                value={formData.diabetesDesde}
                                onChange={(e) => {
                                  handleInputChange("diabetesDesde", e.target.value)
                                  if (e.target.value) {
                                    alertSystem.addAlert(
                                      'enfermedades',
                                      'alta',
                                      `Diabetes desde: ${e.target.value}`,
                                      'Monitorear cicatrización y control glucémico'
                                    )
                                  }
                                }}
                                placeholder="Ej: 5 años, 1 año"
                                className="mt-2 border-purple-500 focus:border-purple-700 text-lg"
                                required
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="diabetesMedicamentos" className="text-purple-700 font-bold text-lg">
                                💊 ¿Qué medicamentos toma? * (ALERTA AL CRM)
                              </Label>
                              <Input
                                id="diabetesMedicamentos"
                                value={formData.diabetesMedicamentos}
                                onChange={(e) => {
                                  handleInputChange("diabetesMedicamentos", e.target.value)
                                  if (e.target.value) {
                                    alertSystem.addAlert(
                                      'medicamentos',
                                      'alta',
                                      `Medicamentos para diabetes: ${e.target.value}`,
                                      'Considerar hipoglucemia durante procedimientos'
                                    )
                                  }
                                }}
                                placeholder="Ej: Metformina, Insulina"
                                className="mt-2 border-purple-500 focus:border-purple-700 text-lg"
                                required
                              />
                            </div>
                            
                            <p className="text-xs text-purple-600">
                              ⚠️ Esta información se marcará como ALERTA CRÍTICA en el CRM
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* 5.4 Nivel de glucosa */}
                    <div className="space-y-4">
                      <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">📊</span>
                          <span className="font-bold text-blue-900">INFORMACIÓN IMPORTANTE</span>
                        </div>
                        <Label className="text-base font-semibold text-blue-900 mb-4 block">
                          5.4 ¿Cuándo fue la última vez que revisó su nivel de glucosa?
                        </Label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor="nivelGlucosaFecha" className="text-blue-700 font-semibold">
                              Fecha aproximada
                            </Label>
                            <Input
                              id="nivelGlucosaFecha"
                              type="date"
                              value={formData.nivelGlucosaFecha}
                              onChange={(e) => {
                                handleInputChange("nivelGlucosaFecha", e.target.value)
                                if (e.target.value && formData.nivelGlucosaResultado) {
                                  alertSystem.addAlert(
                                    'enfermedades',
                                    'media',
                                    `Última glucosa: ${formData.nivelGlucosaResultado} mg/dL (${e.target.value})`,
                                    'Verificar control glucémico actual'
                                  )
                                }
                              }}
                              className="mt-2 border-blue-400"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="nivelGlucosaResultado" className="text-blue-700 font-semibold">
                              Resultado (mg/dL)
                            </Label>
                            <Input
                              id="nivelGlucosaResultado"
                              type="number"
                              value={formData.nivelGlucosaResultado}
                              onChange={(e) => {
                                handleInputChange("nivelGlucosaResultado", e.target.value)
                                const valor = parseInt(e.target.value)
                                if (valor && formData.nivelGlucosaFecha) {
                                  const severidad = valor > 180 || valor < 70 ? 'alta' : 'media'
                                  alertSystem.addAlert(
                                    'enfermedades',
                                    severidad,
                                    `Glucosa: ${valor} mg/dL ${valor > 180 ? '(ALTA)' : valor < 70 ? '(BAJA)' : ''}`,
                                    valor > 180 || valor < 70 ? 'PRECAUCIÓN: Nivel fuera de rango normal' : 'Monitorear durante procedimiento'
                                  )
                                }
                              }}
                              placeholder="Ej: 120"
                              className="mt-2 border-blue-400"
                            />
                          </div>
                        </div>
                        
                        <p className="text-xs text-blue-600 mt-3">
                          💡 Nivel normal en ayunas: 70-100 mg/dL
                        </p>
                      </div>
                    </div>

                    {/* Resumen de Alertas Sistémicas */}
                    {(formData.hipertension === "si" || formData.medicamentosPresion === "si" || formData.diabetes === "si") && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-red-100 via-orange-100 to-purple-100 border-2 border-red-500 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🚨</span>
                          <div>
                            <h4 className="font-bold text-red-900 text-lg">Alertas de Enfermedades Sistémicas</h4>
                            <p className="text-sm text-red-700">
                              {alertSystem.getAlertCount().alta} alerta(s) de alta prioridad registrada(s)
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              ⚠️ Estas condiciones requieren atención especial durante procedimientos dentales
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* SECCIÓN 7: ENFERMEDADES INFECCIOSAS */}
                {currentSection === 7 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-full px-4 py-1.5 mb-3">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Sección 7 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Enfermedades Infecciosas
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Para protocolos de bioseguridad</p>
                    </motion.div>
                    <div className="bg-pink-50 border-2 border-pink-400 rounded-lg p-4 mb-6">
                      <h3 className="font-bold text-pink-900 text-lg mb-2">🦠 ENFERMEDADES INFECCIOSAS</h3>
                      <p className="text-sm text-pink-700">Responda las siguientes 4 preguntas</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 6.1 VIH */}
                      <ThumbsSelector
                        label="6.1 VIH"
                        value={formData.vih}
                        onChange={(value) => handleInputChange("vih", value)}
                        required
                      />

                      {/* 6.2 Herpes */}
                      <ThumbsSelector
                        label="6.2 Herpes"
                        value={formData.herpes}
                        onChange={(value) => handleInputChange("herpes", value)}
                        required
                      />

                      {/* 6.3 Sífilis */}
                      <ThumbsSelector
                        label="6.3 Sífilis"
                        value={formData.sifilis}
                        onChange={(value) => handleInputChange("sifilis", value)}
                        required
                      />

                      {/* 6.4 Gonorrea */}
                      <ThumbsSelector
                        label="6.4 Gonorrea"
                        value={formData.gonorrea}
                        onChange={(value) => handleInputChange("gonorrea", value)}
                        required
                      />
                    </div>

                    {/* Renglón condicional si alguna es positiva */}
                    {(formData.vih === "si" || formData.herpes === "si" || formData.sifilis === "si" || formData.gonorrea === "si") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6"
                      >
                        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                          <Label htmlFor="enfermedadesInfecciosasDetalles" className="text-red-700 font-bold text-lg">
                            🦠 Por favor, proporcione más detalles *
                          </Label>
                          <Input
                            id="enfermedadesInfecciosasDetalles"
                            value={formData.enfermedadesInfecciosasDetalles}
                            onChange={(e) => {
                              handleInputChange("enfermedadesInfecciosasDetalles", e.target.value)
                              if (e.target.value) {
                                alertSystem.addAlert(
                                  'enfermedades',
                                  'alta',
                                  'Paciente con enfermedad infecciosa',
                                  `Detalles: ${e.target.value} - PROTOCOLO DE BIOSEGURIDAD ESTRICTO`
                                )
                              }
                            }}
                            placeholder="Tratamiento actual, tiempo de diagnóstico, etc."
                            className="mt-2 border-red-500 focus:border-red-700 text-lg"
                            required
                          />
                          <p className="text-xs text-red-600 mt-2">
                            ⚠️ ALERTA CRÍTICA: Se aplicarán protocolos especiales de bioseguridad
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* SECCIÓN 8: ALTERACIONES RENALES/HEPÁTICAS */}
                {currentSection === 8 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full px-4 py-1.5 mb-3">
                        <Heart className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Sección 8 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Alteraciones Renales/Hepáticas
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Función renal y hepática</p>
                    </motion.div>
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                      <h3 className="font-bold text-yellow-900 text-lg mb-2">🫘 ALTERACIONES RENALES Y/O HEPÁTICAS</h3>
                      <p className="text-sm text-yellow-700">Responda las siguientes 4 preguntas</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 7.1 Diálisis */}
                      <ThumbsSelector
                        label="7.1 ¿Le han aplicado diálisis?"
                        value={formData.dialisis}
                        onChange={(value) => handleInputChange("dialisis", value)}
                        required
                      />

                      {/* 7.2 Alteración renal */}
                      <ThumbsSelector
                        label="7.2 ¿Alguna alteración renal?"
                        value={formData.alteracionRenal}
                        onChange={(value) => handleInputChange("alteracionRenal", value)}
                        required
                      />

                      {/* 7.3 Alteración hepática */}
                      <ThumbsSelector
                        label="7.3 ¿Alguna alteración hepática?"
                        value={formData.alteracionHepatica}
                        onChange={(value) => handleInputChange("alteracionHepatica", value)}
                        required
                      />

                      {/* 7.4 Hepatitis */}
                      <ThumbsSelector
                        label="7.4 ¿Hepatitis?"
                        value={formData.hepatitis}
                        onChange={(value) => handleInputChange("hepatitis", value)}
                        required
                      />
                    </div>

                    {/* Renglón condicional si alguna es positiva */}
                    {(formData.dialisis === "si" || formData.alteracionRenal === "si" || formData.alteracionHepatica === "si" || formData.hepatitis === "si") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6"
                      >
                        <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
                          <Label htmlFor="alteracionesRenalesDetalles" className="text-orange-700 font-bold text-lg">
                            🫘 Por favor, proporcione más detalles *
                          </Label>
                          <Input
                            id="alteracionesRenalesDetalles"
                            value={formData.alteracionesRenalesDetalles}
                            onChange={(e) => {
                              handleInputChange("alteracionesRenalesDetalles", e.target.value)
                              if (e.target.value) {
                                alertSystem.addAlert(
                                  'enfermedades',
                                  'alta',
                                  'Alteración renal/hepática',
                                  `Detalles: ${e.target.value} - Ajustar dosis de medicamentos`
                                )
                              }
                            }}
                            placeholder="Tipo de alteración, tratamiento, etc."
                            className="mt-2 border-orange-500 focus:border-orange-700 text-lg"
                            required
                          />
                          <p className="text-xs text-orange-600 mt-2">
                            ⚠️ ALERTA: Considerar función renal/hepática para medicamentos
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* SECCIÓN 9: PROBLEMAS SANGUÍNEOS */}
                {currentSection === 9 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-full px-4 py-1.5 mb-3">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Sección 9 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Problemas Sanguíneos
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Coagulación y sangrado</p>
                    </motion.div>
                    <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-6">
                      <h3 className="font-bold text-red-900 text-lg mb-2">🩸 PROBLEMAS SANGUÍNEOS</h3>
                      <p className="text-sm text-red-700">Responda las siguientes 5 preguntas</p>
                    </div>

                    <div className="space-y-6">
                      {/* 8.1 Hemorragias frecuentes */}
                      <ThumbsSelector
                        label="8.1 ¿Presenta o ha presentado hemorragias frecuentes?"
                        value={formData.hemorragiasFrecuentes}
                        onChange={(value) => handleInputChange("hemorragiasFrecuentes", value)}
                        required
                      />

                      {/* 8.2 Problemas de coagulación */}
                      <ThumbsSelector
                        label="8.2 ¿Tiene problemas de coagulación o sangrado?"
                        value={formData.problemasCoagulacion}
                        onChange={(value) => handleInputChange("problemasCoagulacion", value)}
                        required
                      />

                      {/* 8.3 Sangrado de nariz o encías */}
                      <ThumbsSelector
                        label="8.3 ¿Presenta sangrado frecuente de nariz o encías?"
                        value={formData.sangradoNarizEncias}
                        onChange={(value) => handleInputChange("sangradoNarizEncias", value)}
                        required
                      />

                      {/* 8.4 Leucemia o hemofilia */}
                      <ThumbsSelector
                        label="8.4 ¿Le han diagnosticado leucemia o hemofilia?"
                        value={formData.leucemiaHemofilia}
                        onChange={(value) => handleInputChange("leucemiaHemofilia", value)}
                        required
                      />

                      {/* 8.5 Aspirinas o anticoagulantes */}
                      <ThumbsSelector
                        label="8.5 ¿Toma constantemente aspirinas o anticoagulantes?"
                        value={formData.aspirinasAnticoagulantes}
                        onChange={(value) => handleInputChange("aspirinasAnticoagulantes", value)}
                        required
                      />
                    </div>

                    {/* Renglón condicional si alguna es positiva */}
                    {(formData.hemorragiasFrecuentes === "si" || formData.problemasCoagulacion === "si" || formData.sangradoNarizEncias === "si" || formData.leucemiaHemofilia === "si" || formData.aspirinasAnticoagulantes === "si") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6"
                      >
                        <div className="bg-red-50 border-2 border-red-600 rounded-lg p-4">
                          <Label htmlFor="problemasSanguineosDetalles" className="text-red-700 font-bold text-lg">
                            🩸 Por favor, proporcione más detalles *
                          </Label>
                          <Input
                            id="problemasSanguineosDetalles"
                            value={formData.problemasSanguineosDetalles}
                            onChange={(e) => {
                              handleInputChange("problemasSanguineosDetalles", e.target.value)
                              if (e.target.value) {
                                alertSystem.addAlert(
                                  'enfermedades',
                                  'alta',
                                  'Problema de coagulación/sangrado',
                                  `Detalles: ${e.target.value} - PRECAUCIÓN EN PROCEDIMIENTOS INVASIVOS`
                                )
                              }
                            }}
                            placeholder="Medicamentos, diagnóstico, frecuencia, etc."
                            className="mt-2 border-red-600 focus:border-red-800 text-lg"
                            required
                          />
                          <p className="text-xs text-red-600 mt-2">
                            ⚠️ ALERTA CRÍTICA: Riesgo de sangrado - Protocolo especial requerido
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* SECCIÓN 10: EMBARAZO - Solo para sexo femenino */}
                {currentSection === 10 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {formData.sexo === "femenino" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-2"
                      >
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-full px-4 py-1.5 mb-3">
                          <Heart className="w-4 h-4 text-pink-500" />
                          <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Sección 10 de 15</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                          Embarazo
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm">Información para pacientes femeninas</p>
                      </motion.div>
                    )}
                    {formData.sexo === "femenino" ? (
                      <>
                        <div className="bg-pink-50 border-2 border-pink-400 rounded-lg p-4 mb-6">
                          <h3 className="font-bold text-pink-900 text-lg mb-2">🤰 EMBARAZO</h3>
                          <p className="text-sm text-pink-700">Información importante para pacientes femeninas</p>
                        </div>

                    {/* 9.1 ¿Se encuentra embarazada? */}
                    <ThumbsSelector
                      label="9.1 ¿Se encuentra embarazada?"
                      value={formData.embarazada}
                      onChange={(value) => {
                        handleInputChange("embarazada", value)
                        if (value === "no") {
                          handleInputChange("semanasGestacion", "")
                        } else if (value === "si") {
                          alertSystem.addAlert(
                            'condiciones_especiales',
                            'alta',
                            'Paciente embarazada',
                            'IMPORTANTE: Evitar radiografías y ciertos medicamentos'
                          )
                        }
                      }}
                      required
                    />

                    {/* 9.2 Semanas de gestación */}
                    {formData.embarazada === "si" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <div className="bg-pink-50 border-2 border-pink-500 rounded-lg p-4">
                          <Label htmlFor="semanasGestacion" className="text-pink-700 font-bold text-lg">
                            🤰 ¿Cuántas semanas de gestación tiene? *
                          </Label>
                          <Input
                            id="semanasGestacion"
                            type="number"
                            value={formData.semanasGestacion}
                            onChange={(e) => {
                              handleInputChange("semanasGestacion", e.target.value)
                              if (e.target.value) {
                                alertSystem.addAlert(
                                  'condiciones_especiales',
                                  'alta',
                                  `Embarazo: ${e.target.value} semanas`,
                                  'Protocolo especial para embarazadas'
                                )
                              }
                            }}
                            placeholder="Número de semanas"
                            className="mt-2 border-pink-500 focus:border-pink-700 text-lg"
                            min="1"
                            max="42"
                            required
                          />
                          <p className="text-xs text-pink-600 mt-2">
                            ⚠️ ALERTA: Protocolo especial para pacientes embarazadas
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* 9.3 Abortos o legrados */}
                    <ThumbsSelector
                      label="9.3 ¿Ha sufrido abortos o legrados?"
                      value={formData.abortosLegrados}
                      onChange={(value) => handleInputChange("abortosLegrados", value)}
                      required
                    />

                    {/* 9.4 Número de hijos */}
                    <div className="space-y-2">
                      <Label htmlFor="numeroHijos" className="text-base font-semibold">
                        9.4 ¿Cuántos hijos tiene?
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleInputChange("numeroHijos", num.toString())}
                            className={`px-4 py-3 rounded-lg border-2 font-bold text-lg transition-all ${
                              formData.numeroHijos === num.toString()
                                ? "border-pink-500 bg-pink-50 text-pink-700"
                                : "border-gray-300 hover:border-pink-300"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/80 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-200">
                            <User className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-extrabold text-slate-800 text-xl mb-2">Sección No Aplicable</h3>
                          <p className="text-slate-600">
                            Esta sección es solo para pacientes de sexo femenino.
                          </p>
                          <p className="text-sm text-slate-500 mt-4">
                            Puedes continuar a la siguiente sección.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* SECCIÓN 11: HISTORIA CLÍNICA DENTAL */}
                {currentSection === 11 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-full px-4 py-1.5 mb-3">
                        <Stethoscope className="w-4 h-4 text-cyan-600" />
                        <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Sección 11 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Historia Clínica Dental
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Experiencias dentales previas</p>
                    </motion.div>
                    <div className="bg-cyan-50 border-2 border-cyan-400 rounded-lg p-4 mb-6">
                      <h3 className="font-bold text-cyan-900 text-lg mb-2">🦷 HISTORIA CLÍNICA DENTAL</h3>
                      <p className="text-sm text-cyan-700">Información sobre sus experiencias dentales previas</p>
                    </div>

                    {/* 10.1 Última visita al dentista */}
                    <div className="space-y-2">
                      <Label htmlFor="ultimaVisitaDentista" className="text-base font-semibold">
                        10.1 ¿Cuándo fue la última vez que visitó a un dentista?
                      </Label>
                      <Input
                        id="ultimaVisitaDentista"
                        type="date"
                        value={formData.ultimaVisitaDentista}
                        onChange={(e) => handleInputChange("ultimaVisitaDentista", e.target.value)}
                        className="h-12"
                      />
                    </div>

                    {/* 10.2 Anestesia en boca */}
                    <ThumbsSelector
                      label="10.2 ¿Lo han anestesiado en su boca alguna vez?"
                      value={formData.anestesiaBoca}
                      onChange={(value) => handleInputChange("anestesiaBoca", value)}
                      required
                    />

                    {/* 10.3 Complicación con anestesia */}
                    <ThumbsSelector
                      label="10.3 ¿Ha tenido alguna complicación con la anestesia dental?"
                      value={formData.complicacionAnestesia}
                      onChange={(value) => {
                        handleInputChange("complicacionAnestesia", value)
                        if (value === "si") {
                          alertSystem.addAlert(
                            'condiciones_especiales',
                            'alta',
                            'Complicación previa con anestesia dental',
                            'PRECAUCIÓN: Revisar historial antes de anestesiar'
                          )
                        }
                      }}
                      required
                    />

                    {/* 10.4 Complicación durante visita dental */}
                    <ThumbsSelector
                      label="10.4 ¿Ha sufrido alguna complicación durante su visita al dentista?"
                      value={formData.complicacionVisitaDental}
                      onChange={(value) => {
                        handleInputChange("complicacionVisitaDental", value)
                        if (value === "si") {
                          alertSystem.addAlert(
                            'condiciones_especiales',
                            'media',
                            'Complicación previa en visita dental',
                            'Revisar detalles del historial'
                          )
                        }
                      }}
                      required
                    />

                    {/* 10.5 Impedimento médico para anestesia */}
                    <ThumbsSelector
                      label="10.5 ¿Existe algún impedimento médico por el cual no podamos anestesiarlo?"
                      value={formData.impedimentoAnestesia}
                      onChange={(value) => {
                        handleInputChange("impedimentoAnestesia", value)
                        if (value === "si") {
                          alertSystem.addAlert(
                            'condiciones_especiales',
                            'alta',
                            'IMPEDIMENTO MÉDICO PARA ANESTESIA',
                            'CRÍTICO: NO ANESTESIAR - Consultar con médico'
                          )
                        }
                      }}
                      required
                    />

                    {/* ODONTOGRAMA */}
                    <div className="space-y-3">
                      <div className="bg-cyan-50 border-2 border-cyan-300 rounded-lg p-3">
                        <h4 className="font-bold text-cyan-900 text-base mb-1">🦷 Odontograma — Plan de Tratamiento</h4>
                        <p className="text-xs text-cyan-700">Selecciona el tratamiento y haz clic en cada diente. Los datos se copiarán automáticamente al formulario de autorización.</p>
                      </div>
                      <Odontograma
                        value={odontogramaData}
                        onChange={(data) => {
                          setOdontogramaData(data)
                          localStorage.setItem('odontogramaData', JSON.stringify(data))
                          const { tratamiento, diagnostico } = generateTratamientoText(data)
                          localStorage.setItem('odontogramaTratamiento', tratamiento)
                          localStorage.setItem('odontogramaDiagnostico', diagnostico)

                          // Calcular cantidades por tratamiento desde el odontograma
                          const counts: Record<string, number> = {}
                          Object.values(data.dientes).forEach(d => {
                            d.tratamientos.forEach(tx => {
                              if (tx) counts[tx] = (counts[tx] || 0) + 1
                            })
                          })
                          // Mapeo tratamiento → nombre de fila en la orden de servicio
                          const TX_MAP: Record<string, string> = {
                            EXT: "EXTRACCIONES",
                            END: "ENDODONCIA",
                            RS: "RESINAS",
                            CORONA: "CORONA",
                            QX: "CIRUGÍA",
                            LIMPIEZA: "LIMPIEZA DENTAL",
                          }
                          setPlanTratamiento(prev => {
                            // Mantener filas existentes actualizando cantidades donde el nombre coincida
                            const updatedItems = prev.items.map(item => {
                              const txKey = Object.keys(TX_MAP).find(k => TX_MAP[k] === item.descripcion)
                              if (txKey && counts[txKey] !== undefined) {
                                return { ...item, cantidad: counts[txKey] }
                              }
                              return item
                            })
                            // Agregar filas nuevas para tratamientos del odontograma que no existan aún
                            const existingNames = updatedItems.map(i => i.descripcion)
                            const newRows = Object.keys(TX_MAP)
                              .filter(k => counts[k] && !existingNames.includes(TX_MAP[k]))
                              .map(k => ({ descripcion: TX_MAP[k], cantidad: counts[k], costoUnitario: "", total: "" }))
                            return { ...prev, items: [...updatedItems, ...newRows] }
                          })
                        }}
                        notasMedico={notasMedico}
                        onNotasMedicoChange={(val) => {
                          setNotasMedico(val)
                          localStorage.setItem('notasMedico', val)
                        }}
                      />
                    </div>

                    {/* ORDEN DE SERVICIO DENTAL — formato idéntico al Excel */}
                    {(() => {
                      const calcTotal = (cant: number, costo: string) => {
                        const c = parseFloat(costo.replace(/,/g, ""))
                        if (isNaN(c) || cant === 0) return 0
                        return c * cant
                      }
                      const totalTratamiento = planTratamiento.items.reduce((acc, item) => {
                        return acc + calcTotal(item.cantidad, item.costoUnitario)
                      }, 0)
                      const montoSubsidio = planTratamiento.tipoPlan === "interna"
                        ? totalTratamiento * (planTratamiento.subsidio / 100)
                        : 0
                      const montoAPagar = planTratamiento.tipoPlan === "interna"
                        ? totalTratamiento - montoSubsidio
                        : totalTratamiento
                      const montoPorSemana = planTratamiento.semanas > 0
                        ? montoAPagar / planTratamiento.semanas
                        : 0
                      const fmt = (v: number) => v.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

                      return (
                        <div className="border-2 border-gray-800 rounded-lg overflow-hidden text-sm mt-4">
                          {/* Encabezado */}
                          <div className="bg-gray-800 text-white text-center py-2">
                            <p className="font-bold text-base tracking-widest uppercase">ORDEN DE SERVICIO DENTAL</p>
                          </div>

                          {/* Tipo + Folio + Fecha */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-4 py-2 bg-gray-100 border-b border-gray-300">
                            <div className="flex flex-wrap gap-3">
                              {(["interna", "externa"] as const).map(tipo => (
                                <label key={tipo} className="flex items-center gap-1 cursor-pointer font-semibold uppercase text-xs">
                                  <input
                                    type="radio"
                                    name="tipoPlan"
                                    value={tipo}
                                    checked={planTratamiento.tipoPlan === tipo}
                                    onChange={() => setPlanTratamiento(p => ({ ...p, tipoPlan: tipo, semanas: tipo === "interna" ? 18 : 52 }))}
                                    className="accent-gray-800"
                                  />
                                  SERVICIO {tipo.toUpperCase()}
                                </label>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold">FOLIO:</span>
                              <input
                                type="text"
                                value={planTratamiento.folio}
                                onChange={e => setPlanTratamiento(p => ({ ...p, folio: e.target.value }))}
                                className="border-b border-gray-500 bg-transparent w-20 text-center outline-none px-1"
                                placeholder="0001"
                              />
                            </div>
                          </div>

                          {/* Tabla TRATAMIENTO */}
                          <div className="min-w-0 px-3 sm:px-4 py-3">
                            <p className="font-bold uppercase text-xs mb-2 text-gray-600">TRATAMIENTO A REALIZAR</p>
                            <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
                            <table className="w-full min-w-[580px] border border-gray-400 text-xs">
                              <thead>
                                <tr className="bg-gray-200 text-gray-800">
                                  <th className="border border-gray-400 px-3 py-1.5 text-left font-bold uppercase">TRATAMIENTO</th>
                                  <th className="border border-gray-400 px-3 py-1.5 text-center font-bold uppercase w-16">CANT.</th>
                                  <th className="border border-gray-400 px-3 py-1.5 text-right font-bold uppercase w-32">COSTO UNITARIO</th>
                                  <th className="border border-gray-400 px-3 py-1.5 text-right font-bold uppercase w-28">TOTAL</th>
                                  <th className="border border-gray-400 w-8"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {planTratamiento.items.map((item, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="border border-gray-300 px-2 py-1">
                                      <input
                                        type="text"
                                        value={item.descripcion}
                                        onChange={e => {
                                          const items = [...planTratamiento.items]
                                          items[idx] = { ...items[idx], descripcion: e.target.value }
                                          setPlanTratamiento(p => ({ ...p, items }))
                                        }}
                                        className="w-full bg-transparent outline-none font-semibold uppercase"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                      <input
                                        type="number"
                                        min={0}
                                        value={item.cantidad}
                                        onChange={e => {
                                          const items = [...planTratamiento.items]
                                          items[idx] = { ...items[idx], cantidad: parseInt(e.target.value) || 0 }
                                          setPlanTratamiento(p => ({ ...p, items }))
                                        }}
                                        className="w-full bg-transparent outline-none text-center font-bold"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1">
                                      <input
                                        type="text"
                                        value={item.costoUnitario}
                                        onChange={e => {
                                          const items = [...planTratamiento.items]
                                          items[idx] = { ...items[idx], costoUnitario: e.target.value }
                                          setPlanTratamiento(p => ({ ...p, items }))
                                        }}
                                        placeholder="0"
                                        className="w-full bg-transparent outline-none text-right"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-2 py-1 text-right font-semibold text-gray-800">
                                      {fmt(calcTotal(item.cantidad, item.costoUnitario))}
                                    </td>
                                    <td className="border border-gray-300 text-center">
                                      {planTratamiento.items.length > 1 && (
                                        <button type="button"
                                          onClick={() => setPlanTratamiento(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))}
                                          className="text-red-400 hover:text-red-600 font-bold px-1">×</button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                                {/* Fila TOTAL */}
                                <tr className="bg-gray-200 font-bold">
                                  <td colSpan={3} className="border border-gray-400 px-3 py-1.5 text-right uppercase">TOTAL</td>
                                  <td className="border border-gray-400 px-2 py-1.5 text-right">${fmt(totalTratamiento)}</td>
                                  <td className="border border-gray-400"></td>
                                </tr>
                              </tbody>
                            </table>
                            </div>

                            <button
                              type="button"
                              onClick={() => setPlanTratamiento(p => ({ ...p, items: [...p.items, { descripcion: "", cantidad: 0, costoUnitario: "", total: "" }] }))}
                              className="mt-2 w-full border-2 border-dashed border-gray-400 text-gray-500 font-semibold rounded py-1.5 text-xs hover:bg-gray-50 transition-all"
                            >+ Agregar renglón</button>
                          </div>

                          {/* FORMA DE PAGO */}
                          <div className="border-t-2 border-gray-400 px-4 py-3 bg-gray-50">
                            <p className="font-bold uppercase text-xs mb-3 text-gray-600">FORMA DE PAGO</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                              <div className="flex justify-between border-b border-gray-300 py-1">
                                <span className="font-semibold text-gray-700">COSTO TOTAL DEL TRATAMIENTO</span>
                                <span className="font-bold">${fmt(totalTratamiento)}</span>
                              </div>

                              {planTratamiento.tipoPlan === "interna" && (
                                <>
                                  <div className="flex justify-between items-center border-b border-gray-300 py-1">
                                    <span className="font-semibold text-gray-700">SUBSIDIO EMPRESA</span>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min={0} max={100}
                                        value={planTratamiento.subsidio}
                                        onChange={e => setPlanTratamiento(p => ({ ...p, subsidio: parseInt(e.target.value) || 0 }))}
                                        className="w-12 border border-gray-300 rounded px-1 text-center outline-none bg-white text-xs"
                                      />
                                      <span>%</span>
                                      <span className="font-bold text-red-600 ml-2">${fmt(montoSubsidio)}</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-300 py-1">
                                    <span className="font-semibold text-gray-700">MONTO A PAGAR CON SUBSIDIO</span>
                                    <span className="font-bold text-emerald-700">${fmt(montoAPagar)}</span>
                                  </div>
                                </>
                              )}

                              {planTratamiento.tipoPlan === "externa" && (
                                <div className="flex items-center gap-2 border-b border-gray-300 py-1 col-span-2">
                                  <span className="font-semibold text-gray-700">PRÉSTAMO EMPRESARIAL (máx. 52 semanas)</span>
                                  <span className="text-gray-500 text-xs">EL MONTO MÍNIMO A PAGAR POR SEMANA ES DE $200</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center border-b border-gray-300 py-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-700">SEMANAS A PAGAR</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={planTratamiento.semanas}
                                    onChange={e => setPlanTratamiento(p => ({ ...p, semanas: parseInt(e.target.value) || 1 }))}
                                    className="w-16 border border-gray-300 rounded px-2 py-0.5 outline-none bg-white text-xs text-center"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between border-b border-gray-300 py-1">
                                <span className="font-semibold text-gray-700">MONTO A PAGAR POR SEMANA</span>
                                <span className="font-bold text-blue-700">${fmt(montoPorSemana)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Nota */}
                          <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
                            <p className="text-xs font-semibold text-yellow-800">NOTA: EL DESCUENTO SE REALIZARÁ VÍA NÓMINA DE MANERA SEMANAL HASTA LIQUIDAR.</p>
                          </div>

                          {/* Firmas */}
                          <div className="border-t-2 border-gray-400 px-4 py-3">
                            <p className="font-bold uppercase text-xs mb-3 text-gray-600">FIRMAS DE CONFORMIDAD</p>
                            <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-8">
                              <div className="flex-1 text-center">
                                <div className="border-b-2 border-gray-600 mb-1 h-8"></div>
                                <p className="text-xs font-semibold uppercase text-gray-700">FIRMA DEL COLABORADOR</p>
                              </div>
                              <div className="flex-1 text-center">
                                <div className="border-b-2 border-gray-600 mb-1 h-8 flex items-end justify-center">
                                  <span className="text-xs text-gray-500 pb-0.5">Dr. Erick Mancilla Chio</span>
                                </div>
                                <p className="text-xs font-semibold uppercase text-gray-700">FIRMA DEL MÉDICO TRATANTE</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* 10.6 Otra condición médica */}
                    <div className="space-y-4">
                      <ThumbsSelector
                        label="10.6 ¿Padece alguna enfermedad, condición médica o dato relevante que no se haya mencionado?"
                        value={formData.otraCondicionMedica}
                        onChange={(value) => {
                          handleInputChange("otraCondicionMedica", value)
                          if (value === "no") {
                            handleInputChange("otraCondicionMedicaDetalles", "")
                          }
                        }}
                        required
                      />

                      {formData.otraCondicionMedica === "si" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-4">
                            <Label htmlFor="otraCondicionMedicaDetalles" className="text-amber-700 font-bold text-lg">
                              📝 Por favor, describa la condición *
                            </Label>
                            <Input
                              id="otraCondicionMedicaDetalles"
                              value={formData.otraCondicionMedicaDetalles}
                              onChange={(e) => {
                                handleInputChange("otraCondicionMedicaDetalles", e.target.value)
                                if (e.target.value) {
                                  alertSystem.addAlert(
                                    'condiciones_especiales',
                                    'media',
                                    'Condición médica adicional',
                                    `Detalles: ${e.target.value}`
                                  )
                                }
                              }}
                              placeholder="Describa la condición o dato relevante"
                              className="mt-2 border-amber-500 focus:border-amber-700 text-lg"
                              required
                            />
                            <p className="text-xs text-amber-600 mt-2">
                              ℹ️ Esta información será revisada por el doctor
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* SECCIÓN 12: PERIODONTAL */}
                {currentSection === 12 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-full px-4 py-1.5 mb-3">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Sección 12 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Periodontal
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Evaluación del estado periodontal</p>
                    </motion.div>

                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-5 space-y-5">
                      <h3 className="font-bold text-pink-900 text-lg flex items-center gap-2">
                        <span className="text-2xl">🦷</span>
                        Evaluación periodontal
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ThumbsSelector
                          label="Sangrado al sondaje"
                          value={formData.periodontalSangradoSondaje}
                          onChange={(value) => handleInputChange("periodontalSangradoSondaje", value)}
                        />

                        <div className="space-y-2">
                          <ThumbsSelector
                            label="Bolsas periodontales"
                            value={formData.periodontalBolsas}
                            onChange={(value) => {
                              handleInputChange("periodontalBolsas", value)
                              if (value === "no") handleInputChange("periodontalBolsasDetalles", "")
                            }}
                          />
                          {formData.periodontalBolsas === "si" && (
                            <Input
                              value={formData.periodontalBolsasDetalles}
                              onChange={(e) => handleInputChange("periodontalBolsasDetalles", e.target.value)}
                              placeholder="Dientes y profundidad"
                              className="h-12"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <ThumbsSelector
                            label="Retracción gingival"
                            value={formData.periodontalRetraccionGingival}
                            onChange={(value) => {
                              handleInputChange("periodontalRetraccionGingival", value)
                              if (value === "no") handleInputChange("periodontalRetraccionGingivalDetalles", "")
                            }}
                          />
                          {formData.periodontalRetraccionGingival === "si" && (
                            <Input
                              value={formData.periodontalRetraccionGingivalDetalles}
                              onChange={(e) => handleInputChange("periodontalRetraccionGingivalDetalles", e.target.value)}
                              placeholder="Dientes afectados"
                              className="h-12"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <ThumbsSelector
                            label="Supuración"
                            value={formData.periodontalSupuracion}
                            onChange={(value) => {
                              handleInputChange("periodontalSupuracion", value)
                              if (value === "no") handleInputChange("periodontalSupuracionDetalles", "")
                            }}
                          />
                          {formData.periodontalSupuracion === "si" && (
                            <Input
                              value={formData.periodontalSupuracionDetalles}
                              onChange={(e) => handleInputChange("periodontalSupuracionDetalles", e.target.value)}
                              placeholder="Dientes afectados"
                              className="h-12"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <ThumbsSelector
                            label="Movilidad dentaria"
                            value={formData.periodontalMovilidad}
                            onChange={(value) => {
                              handleInputChange("periodontalMovilidad", value)
                              if (value === "no") handleInputChange("periodontalMovilidadDetalles", "")
                            }}
                          />
                          {formData.periodontalMovilidad === "si" && (
                            <Input
                              value={formData.periodontalMovilidadDetalles}
                              onChange={(e) => handleInputChange("periodontalMovilidadDetalles", e.target.value)}
                              placeholder="Dientes y grado"
                              className="h-12"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <ThumbsSelector
                            label="Furcas expuestas"
                            value={formData.periodontalFurcas}
                            onChange={(value) => {
                              handleInputChange("periodontalFurcas", value)
                              if (value === "no") handleInputChange("periodontalFurcasDetalles", "")
                            }}
                          />
                          {formData.periodontalFurcas === "si" && (
                            <Input
                              value={formData.periodontalFurcasDetalles}
                              onChange={(e) => handleInputChange("periodontalFurcasDetalles", e.target.value)}
                              placeholder="Dientes afectados"
                              className="h-12"
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <ThumbsSelector
                            label="Pérdida de inserción"
                            value={formData.periodontalPerdidaInsercion}
                            onChange={(value) => {
                              handleInputChange("periodontalPerdidaInsercion", value)
                              if (value === "no") handleInputChange("periodontalPerdidaInsercionDetalles", "")
                            }}
                          />
                          {formData.periodontalPerdidaInsercion === "si" && (
                            <Input
                              value={formData.periodontalPerdidaInsercionDetalles}
                              onChange={(e) => handleInputChange("periodontalPerdidaInsercionDetalles", e.target.value)}
                              placeholder="Dientes y mm"
                              className="h-12"
                            />
                          )}
                        </div>

                        <ThumbsSelector
                          label="Gingivitis"
                          value={formData.periodontalGingivitis}
                          onChange={(value) => handleInputChange("periodontalGingivitis", value)}
                        />
                        <ThumbsSelector
                          label="Periodontitis"
                          value={formData.periodontalPeriodontitis}
                          onChange={(value) => handleInputChange("periodontalPeriodontitis", value)}
                        />
                        <ThumbsSelector
                          label="Placa bacteriana visible"
                          value={formData.periodontalPlaca}
                          onChange={(value) => handleInputChange("periodontalPlaca", value)}
                        />
                        <ThumbsSelector
                          label="Sarro/cálculo"
                          value={formData.periodontalSarro}
                          onChange={(value) => handleInputChange("periodontalSarro", value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="periodontalObservaciones" className="text-base font-semibold">Observaciones</Label>
                        <Textarea
                          id="periodontalObservaciones"
                          value={formData.periodontalObservaciones}
                          onChange={(e) => handleInputChange("periodontalObservaciones", e.target.value)}
                          placeholder="Hallazgos adicionales o plan periodontal"
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SECCIÓN 13: ESTUDIOS AUXILIARES */}
                {currentSection === 13 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-full px-4 py-1.5 mb-3">
                        <Stethoscope className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sección 13 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Estudios Auxiliares
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Exámenes y registros complementarios</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <ThumbsSelector
                          label="Radiografías"
                          value={formData.estudioRadiografia}
                          onChange={(value) => {
                            handleInputChange("estudioRadiografia", value)
                            if (value === "no") handleInputChange("estudioRadiografiaDetalles", "")
                          }}
                        />
                        {formData.estudioRadiografia === "si" && (
                          <Input
                            value={formData.estudioRadiografiaDetalles}
                            onChange={(e) => handleInputChange("estudioRadiografiaDetalles", e.target.value)}
                            placeholder="Tipo y dientes"
                            className="h-12"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <ThumbsSelector
                          label="Modelo de estudio"
                          value={formData.estudioModeloEstudio}
                          onChange={(value) => {
                            handleInputChange("estudioModeloEstudio", value)
                            if (value === "no") handleInputChange("estudioModeloEstudioDetalles", "")
                          }}
                        />
                        {formData.estudioModeloEstudio === "si" && (
                          <Input
                            value={formData.estudioModeloEstudioDetalles}
                            onChange={(e) => handleInputChange("estudioModeloEstudioDetalles", e.target.value)}
                            placeholder="Observaciones"
                            className="h-12"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <ThumbsSelector
                          label="Fotografía intraoral/extraoral"
                          value={formData.estudioFotografia}
                          onChange={(value) => {
                            handleInputChange("estudioFotografia", value)
                            if (value === "no") handleInputChange("estudioFotografiaDetalles", "")
                          }}
                        />
                        {formData.estudioFotografia === "si" && (
                          <Input
                            value={formData.estudioFotografiaDetalles}
                            onChange={(e) => handleInputChange("estudioFotografiaDetalles", e.target.value)}
                            placeholder="Tipo y cantidad"
                            className="h-12"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <ThumbsSelector
                          label="Estudios de laboratorio"
                          value={formData.estudioLaboratorio}
                          onChange={(value) => {
                            handleInputChange("estudioLaboratorio", value)
                            if (value === "no") handleInputChange("estudioLaboratorioDetalles", "")
                          }}
                        />
                        {formData.estudioLaboratorio === "si" && (
                          <Input
                            value={formData.estudioLaboratorioDetalles}
                            onChange={(e) => handleInputChange("estudioLaboratorioDetalles", e.target.value)}
                            placeholder="Tipo de estudio"
                            className="h-12"
                          />
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <ThumbsSelector
                          label="Otros estudios"
                          value={formData.estudioOtro}
                          onChange={(value) => {
                            handleInputChange("estudioOtro", value)
                            if (value === "no") handleInputChange("estudioOtroDetalles", "")
                          }}
                        />
                        {formData.estudioOtro === "si" && (
                          <Textarea
                            value={formData.estudioOtroDetalles}
                            onChange={(e) => handleInputChange("estudioOtroDetalles", e.target.value)}
                            placeholder="Especifique"
                            className="min-h-[100px]"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SECCIÓN 14: TIPO DE PACIENTE */}
                {currentSection === 14 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mb-2"
                    >
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-3">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Sección 14 de 15</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Tipo de Paciente
                      </h2>
                      <p className="text-slate-500 mt-2 text-sm">Último paso - seleccione su tipo</p>
                    </motion.div>
                    <div className="bg-white border-2 border-teal-300 rounded-lg p-6 shadow-sm">
                      <h3 className="font-bold text-xl text-teal-900 mb-2 text-center">🔐 Ingrese NIP para continuar</h3>
                      <p className="text-sm text-teal-700 text-center mb-4">Después de llenar la Historia Clínica, ingrese el NIP para desbloquear la selección de tipo de paciente.</p>
                      
                      <div className="flex flex-col md:flex-row items-center gap-3">
                        <Input
                          type="password"
                          inputMode="numeric"
                          maxLength={8}
                          value={nipValue}
                          onChange={(e) => {
                            setNipValue(e.target.value)
                            if (nipError) setNipError("")
                          }}
                          placeholder="Ej. 0015"
                          className="md:flex-1 text-lg text-center"
                        />
                        {nipVerified ? (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setNipVerified(false)
                              setNipValue("")
                            }}
                          >
                            Cambiar NIP
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => {
                              if (nipValue.trim() === NIP_CODE) {
                                setNipVerified(true)
                                setNipError("")
                              } else {
                                setNipVerified(false)
                                setNipError("NIP incorrecto. Intente nuevamente.")
                              }
                            }}
                            className="bg-gradient-to-r from-[#0891B2] to-[#0E7490] hover:from-[#0E7490] hover:to-[#155E75]"
                          >
                            Validar NIP
                          </Button>
                        )}
                      </div>

                      <div className="mt-2 text-center">
                        {nipVerified && <p className="text-green-700 font-semibold">✅ NIP correcto. Puede seleccionar el tipo de paciente.</p>}
                        {!nipVerified && nipError && <p className="text-red-600 font-semibold">{nipError}</p>}
                        {!nipVerified && !nipError && <p className="text-gray-600 text-sm">NIP de ejemplo permitido: <span className="font-semibold">0015</span></p>}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-400 rounded-lg p-6 mb-6">
                      <h3 className="font-bold text-teal-900 text-2xl mb-2 text-center">👥 TIPO DE PACIENTE</h3>
                      <p className="text-base text-teal-700 text-center">Seleccione el tipo de paciente para continuar con el proceso correspondiente</p>
                    </div>

                    {nipVerified ? (
                      <TipoPacienteSelector
                        label="Seleccione el tipo de paciente"
                        value={formData.tipoPaciente}
                        onChange={(value) => handleInputChange("tipoPaciente", value)}
                        required
                      />
                    ) : (
                      <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-center text-gray-600">
                        Ingrese y valide el NIP para desbloquear la selección.
                      </div>
                    )}

                    {nipVerified && formData.tipoPaciente && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-lg p-6 text-center"
                      >
                        <h4 className="font-bold text-xl text-green-900 mb-2">✅ Tipo de Paciente Seleccionado</h4>
                        <p className="text-lg text-green-700">
                          {formData.tipoPaciente === "charly" && "🔑 Paciente Charly - Clave para el Dr."}
                          {formData.tipoPaciente === "nomina" && "🏢 Paciente Vía Nómina"}
                          {formData.tipoPaciente === "bancario" && "🏦 Financiamiento Bancario"}
                          {formData.tipoPaciente === "particular" && "💵 Paciente Particular"}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {formData.tipoPaciente === "bancario" && "Será redirigido a: Autorización + Consentimiento → Contrato Bancario"}
                          {formData.tipoPaciente === "particular" && "Será redirigido a la hoja de pagos"}
                          {(formData.tipoPaciente === "charly" || formData.tipoPaciente === "nomina") && "Será redirigido a: Autorización + Consentimiento"}
                        </p>
                      </motion.div>
                    )}

                    {/* Botón de Enviar */}
                    <div className="pt-6">
                      <Button
                        type="button"
                        disabled={!nipVerified || !formData.tipoPaciente}
                        onClick={async () => {
                          if (!nipVerified) {
                            alert('⚠️ Por favor valida el NIP para continuar.')
                            return
                          }

                          if (!formData.tipoPaciente) {
                            alert('⚠️ Por favor seleccione un tipo de paciente antes de continuar.')
                            return
                          }

                          try {
                            console.log('💾 Guardando Historia Clínica en Supabase...')
                            
                            // Guardar en Supabase
                            const savedHistoria = await saveHistoriaClinica(formData)
                            
                            if (savedHistoria) {
                              console.log('✅ Historia Clínica guardada en Supabase:', savedHistoria.id)
                              
                              // Guardar en patientDataStore para el contrato y consentimiento
                              patientDataStore.setHistoriaClinica(formData, savedHistoria.id)
                              
                              // También guardar en localStorage como respaldo
                              localStorage.setItem('historiaClinicaData', JSON.stringify(formData))
                              localStorage.setItem('historiaClinicaId', savedHistoria.id)
                              localStorage.setItem('tipoPaciente', formData.tipoPaciente)
                              localStorage.setItem('planTratamiento', JSON.stringify(planTratamiento))
                              localStorage.setItem('notasMedico', notasMedico)
                              
                              // Redirigir según el tipo de paciente
                              switch (formData.tipoPaciente) {
                                case 'bancario':
                                  window.location.href = '/autorizacion-consentimiento'
                                  break
                                case 'particular':
                                  window.location.href = '/pagos-particular'
                                  break
                                case 'charly':
                                case 'nomina':
                                  window.location.href = '/autorizacion-consentimiento'
                                  break
                                default:
                                  window.location.href = '/autorizacion-consentimiento'
                              }
                            } else {
                              alert('❌ Error al guardar la historia clínica. Por favor intenta de nuevo.')
                            }
                          } catch (error) {
                            console.error('Error:', error)
                            alert('❌ Error al guardar la historia clínica. Por favor intenta de nuevo.')
                          }
                        }}
                        size="lg"
                        className="w-full bg-gradient-to-r from-[#0891B2] to-[#0E7490] hover:from-[#0E7490] hover:to-[#155E75] text-white text-xl py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✅ Continuar al Siguiente Paso
                      </Button>
                      <p className="text-center text-sm text-gray-600 mt-3">
                        {formData.tipoPaciente === 'bancario' && 'Autorización + Consentimiento → Contrato Bancario → Consentimiento Final'}
                        {formData.tipoPaciente === 'particular' && 'Será redirigido a la hoja de pagos'}
                        {(formData.tipoPaciente === 'charly' || formData.tipoPaciente === 'nomina') && 'Autorización + Consentimiento → Consentimiento Final'}
                        {!formData.tipoPaciente && 'Seleccione un tipo de paciente para continuar'}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Navegación */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="clinical-nav flex w-full min-w-0 max-w-full flex-col sm:flex-row gap-3 justify-between items-center pt-6 pb-4 border-t sticky bottom-0 z-30 px-0 sm:px-2"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                    <Button
                      type="button"
                      onClick={prevSection}
                      disabled={currentSection === 0}
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto rounded-full px-8 py-6 border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-700 transition-all duration-300 shadow-sm hover:shadow-md text-slate-600 font-semibold"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Anterior
                    </Button>
                  </motion.div>

                  {/* Section indicator pill */}
                  <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 rounded-full px-4 py-2">
                    {sections.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          idx === currentSection
                            ? "bg-teal-500 w-6"
                            : idx < currentSection
                            ? "bg-teal-300"
                            : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>

                  {currentSection === sections.length - 1 ? (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                      <Button
                        type="button"
                        onClick={() => {
                          console.log('Enviando historia clínica...', formData)
                          alert("¡Historia Clínica Completada! 🎉\n\nAhora será redirigido al Contrato de Autorización de Descuentos.")
                          window.location.href = '/contrato'
                        }}
                        size="lg"
                        className="w-full sm:w-auto rounded-full px-8 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-teal-200/50 font-semibold transition-all duration-300"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Finalizar
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                      <Button
                        type="button"
                        onClick={nextSection}
                        size="lg"
                        className="w-full sm:w-auto rounded-full px-8 py-6 bg-gradient-to-r from-[#0891B2] to-[#0E7490] hover:from-[#0E7490] hover:to-[#155E75] text-white shadow-lg shadow-teal-200/40 font-semibold transition-all duration-300"
                      >
                        Siguiente
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
