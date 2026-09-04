"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Smile, Meh, Frown, ArrowRight, Camera, Pen, Settings } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import SignaturePhotoCapture from "@/components/signature-photo-capture"
import { patientDataStore } from "@/lib/patient-data-store"
import { saveHistoriaClinica } from "@/lib/supabase-helpers"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AprobacionCredito } from "@/components/aprobacion-credito"
import { supabase } from "@/lib/supabase"

const todasLasPreguntas = [
  // DATOS PERSONALES
  { id: "empresa", pregunta: "¿En qué empresa trabajas?", tipo: "texto", placeholder: "Nombre de la empresa" },
  { id: "antiguedad", pregunta: "¿Cuánto tiempo llevas en la empresa?", tipo: "texto", placeholder: "Ej. 5 años" },
  { id: "viviendaPropia", pregunta: "¿Tienes vivienda propia?", tipo: "pulgar" },
  { id: "fecha", pregunta: "¿Cuál es la fecha de hoy?", tipo: "date" },
  { id: "nombre", pregunta: "¿Cuál es tu nombre completo?", tipo: "texto", placeholder: "Nombre completo", required: true },
  { id: "ocupacion", pregunta: "¿Cuál es tu ocupación?", tipo: "texto", placeholder: "Tu ocupación" },
  { id: "direccion", pregunta: "¿Cuál es tu dirección?", tipo: "texto", placeholder: "Dirección completa" },
  { id: "edad", pregunta: "¿Cuál es tu edad?", tipo: "number", placeholder: "Tu edad" },
  { id: "sexo", pregunta: "¿Cuál es tu sexo?", tipo: "sexo" },
  { id: "email", pregunta: "¿Cuál es tu correo electrónico?", tipo: "email", placeholder: "correo@ejemplo.com" },
  { id: "celular", pregunta: "¿Cuál es tu número de celular?", tipo: "texto", placeholder: "Número de celular" },
  { id: "telefono", pregunta: "¿Tienes teléfono fijo?", tipo: "texto", placeholder: "Número de teléfono (opcional)" },
  { id: "recomendadoPor", pregunta: "¿Quién te recomendó?", tipo: "texto", placeholder: "¿Quién nos recomendó?" },
  { id: "ingresoMensual", pregunta: "¿Cuál es tu ingreso mensual aproximado?", tipo: "number", placeholder: "Ingreso mensual en MXN" },
  
  // ANTECEDENTES PERSONALES
  { id: "alergico", pregunta: "¿Es usted alérgico a algún medicamento?", tipo: "pulgar", tieneInput: true, inputId: "alergicoCual", inputPlaceholder: "¿Cuál medicamento?" },
  { id: "saludBuena", pregunta: "¿Su estado de salud lo considera bueno?", tipo: "emoji" },
  { id: "medicoUltimoAnio", pregunta: "¿Ha acudido al médico en el último año?", tipo: "pulgar" },
  { id: "enfermedadUltimos6Meses", pregunta: "¿Ha padecido alguna enfermedad en los últimos 6 meses?", tipo: "pulgar", tieneInput: true, inputId: "enfermedadCual", inputPlaceholder: "¿Qué enfermedad?" },
  { id: "hipertension", pregunta: "¿Hipertensión arterial?", tipo: "pulgar", tieneInput: true, inputId: "hipertensionNivel", inputPlaceholder: "Ingrese su presión arterial (Ej: 130/85)" },
  { id: "tomandoMedicamento", pregunta: "¿Está tomando algún medicamento?", tipo: "pulgar", tieneInput: true, inputId: "medicamentoCual", inputPlaceholder: "¿Cuál medicamento?" },
  { id: "enfermedadInfecciosa", pregunta: "¿Padece o ha padecido alguna enfermedad infecciosa?", tipo: "pulgar", tieneInput: true, inputId: "enfermedadTipo", inputPlaceholder: "Sida, Hepatitis, Herpes, Paratoiditis, Varicela, Tuberculosis" },
  { id: "diabetes", pregunta: "¿Padece diabetes o ha desayunado?", tipo: "pulgar", tieneInput: true, inputId: "diabetesInfo", inputPlaceholder: "Nivel de glucosa (Ej: 110 mg/dL hace 2 meses)" },
  { id: "alteracionesRenales", pregunta: "¿Alteraciones renales? ¿Diálisis? ¿Insuficiencia renal? ¿Hemodiálisis?", tipo: "pulgar" },
  { id: "cancer", pregunta: "¿Cáncer? ¿Le aplicaron quimioterapia y/o radioterapia?", tipo: "pulgar" },
  { id: "sangradoExcesivo", pregunta: "¿Presenta sangrado excesivo? ¿Hemorragias frecuentes? ¿Sangrado nasal?", tipo: "pulgar" },
  { id: "leucemia", pregunta: "¿Leucemia? ¿Hemofilia? ¿Sangrado espontáneo de encías?", tipo: "pulgar" },
  { id: "embarazada", pregunta: "¿Se encuentra embarazada, cuántas semanas?", tipo: "pulgar", tieneInput: true, inputId: "embarazoSemanas", inputPlaceholder: "¿Cuántas semanas? ¿Lagrado?" },
  { id: "epilepsia", pregunta: "¿Ataques de epilepsia?", tipo: "pulgar" },
  { id: "medicamentosAnticoagulantes", pregunta: "¿Usa medicamentos anticoagulantes? ¿Tranquilizantes?", tipo: "pulgar" },
  { id: "aspirinas", pregunta: "¿Toma usted aspirinas? ¿Con qué frecuencia?", tipo: "pulgar", tieneInput: true, inputId: "aspirinasFrecuencia", inputPlaceholder: "¿Con qué frecuencia?" },
  
  // HISTORIA CLÍNICA DENTAL
  { id: "ultimaVisitaDentista", pregunta: "¿Cuándo fue la última visita al dentista?", tipo: "texto", placeholder: "Fecha aproximada" },
  { id: "dolorDental", pregunta: "¿Presenta dolor dental actualmente? ¿Con qué frecuencia?", tipo: "pulgar", tieneInput: true, inputId: "dolorFrecuencia", inputPlaceholder: "¿Con qué frecuencia?" },
  { id: "anestesia", pregunta: "¿Le han anestesiado? ¿Ha presentado alguna reacción alérgica a la anestesia?", tipo: "pulgar", tieneInput: true, inputId: "anestesiaReaccion", inputPlaceholder: "¿Qué tipo de reacción?" },
  { id: "complicacionVisitaDental", pregunta: "¿Ha sufrido alguna complicación durante su visita dental?", tipo: "pulgar", tieneInput: true, inputId: "complicacionCual", inputPlaceholder: "¿Qué complicación?" },
  { id: "impedimentoAnestesia", pregunta: "¿Padece o ha padecido alguna enfermedad que no se haya mencionado en este cuestionario?", tipo: "pulgar", tieneInput: true, inputId: "enfermedadOtra", inputPlaceholder: "¿Cuál enfermedad?" },
  
  // DATOS FINANCIEROS DEL TRATAMIENTO
  { id: "montoTratamiento", pregunta: "¿Cuál es el monto total de tu tratamiento?", tipo: "number", placeholder: "Monto en MXN" },
  { id: "numeroCuotas", pregunta: "¿En cuántas cuotas quieres pagar?", tipo: "cuotas" },
  { id: "montoCuota", pregunta: "¿Cuánto pagarías por cuota?", tipo: "number", placeholder: "Monto por cuota en MXN" },
  { id: "fechaPrimerPago", pregunta: "¿Cuándo harías tu primer pago?", tipo: "date" },
  
  // FIRMA Y FOTO
  { id: "firmaFoto", pregunta: "Por último, necesitamos tu firma y foto", tipo: "firmaFoto" },
]

export default function FormularioCompletoPage() {
  const router = useRouter()
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState<any>({})
  const [valorTemporal, setValorTemporal] = useState("")
  const [mostrarInput, setMostrarInput] = useState(false)
  const [mostrarAprobacion, setMostrarAprobacion] = useState(false)

  const preguntaActual = todasLasPreguntas[paso]
  const progreso = ((paso + 1) / todasLasPreguntas.length) * 100

  const handleRespuesta = (valor: string) => {
    const nuevasRespuestas = {
      ...respuestas,
      [preguntaActual.id]: valor
    }
    setRespuestas(nuevasRespuestas)

    // Si la pregunta tiene input adicional y respondió "si"
    if (preguntaActual.tieneInput && valor === "si") {
      setMostrarInput(true)
    } else {
      avanzarPregunta(nuevasRespuestas)
    }
  }

  const handleTextoSubmit = () => {
    if (preguntaActual.required && !valorTemporal.trim()) {
      alert("Este campo es obligatorio")
      return
    }

    const nuevasRespuestas = {
      ...respuestas,
      [preguntaActual.id]: valorTemporal
    }
    setRespuestas(nuevasRespuestas)
    setValorTemporal("")
    avanzarPregunta(nuevasRespuestas)
  }

  const handleInputAdicional = () => {
    if (preguntaActual.inputId) {
      const nuevasRespuestas = {
        ...respuestas,
        [preguntaActual.inputId]: valorTemporal
      }
      setRespuestas(nuevasRespuestas)
      setValorTemporal("")
      setMostrarInput(false)
      avanzarPregunta(nuevasRespuestas)
    }
  }

  const handleFirmaFoto = (firma: string, foto: string) => {
    const nuevasRespuestas = {
      ...respuestas,
      firmaPaciente: firma,
      fotoPaciente: foto
    }
    setRespuestas(nuevasRespuestas)
    finalizarFormulario(nuevasRespuestas)
  }

  const avanzarPregunta = (nuevasRespuestas: any) => {
    if (paso < todasLasPreguntas.length - 1) {
      setTimeout(() => {
        setPaso(paso + 1)
      }, 300)
    }
  }

  const finalizarFormulario = async (nuevasRespuestas: any) => {
    // Guardar en Supabase
    const savedHistoria = await saveHistoriaClinica(nuevasRespuestas)
    
    if (savedHistoria) {
      patientDataStore.setHistoriaClinica(nuevasRespuestas, savedHistoria.id)
      
      // Actualizar progreso: Formulario Completo (50%)
      try {
        await supabase.rpc('actualizar_progreso_prospecto', {
          historia_id: savedHistoria.id,
          paso_actual: 'formulario_completo',
          completado: true
        })
        console.log("✅ Progreso actualizado: Formulario Completo (50%)")
      } catch (error) {
        console.error("❌ Error al actualizar progreso:", error)
      }
    } else {
      patientDataStore.setHistoriaClinica(nuevasRespuestas)
    }

    // Mostrar pantalla de aprobación de crédito
    setMostrarAprobacion(true)
  }

  const handleCerrarAprobacion = async () => {
    setMostrarAprobacion(false)
    
    // Actualizar progreso: Aprobación de Crédito (65%)
    const historiaClinicaId = patientDataStore.getHistoriaClinicaId()
    if (historiaClinicaId) {
      try {
        await supabase.rpc('actualizar_progreso_prospecto', {
          historia_id: historiaClinicaId,
          paso_actual: 'aprobacion_credito',
          completado: true
        })
        console.log("✅ Progreso actualizado: Aprobación de Crédito (65%)")
      } catch (error) {
        console.error("❌ Error al actualizar progreso:", error)
      }
    }
    
    // Redirigir al contrato
    router.push('/contrato')
  }

  const renderPregunta = () => {
    // FIRMA Y FOTO
    if (preguntaActual.tipo === "firmaFoto") {
      return (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {preguntaActual.pregunta}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Necesitamos tu firma digital y una foto para completar tu registro
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border-2 border-cyan-200">
            <SignaturePhotoCapture
              onSignatureChange={(sig) => setRespuestas({ ...respuestas, firmaPaciente: sig })}
              onPhotoChange={(photo) => setRespuestas({ ...respuestas, fotoPaciente: photo })}
              signatureValue={respuestas.firmaPaciente}
              photoValue={respuestas.fotoPaciente}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                if (!respuestas.firmaPaciente || !respuestas.fotoPaciente) {
                  alert("⚠️ Por favor completa ambos campos:\n\n✍️ Firma digital\n📸 Foto del paciente")
                  return
                }
                handleFirmaFoto(respuestas.firmaPaciente, respuestas.fotoPaciente)
              }}
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold text-lg h-16 shadow-lg"
            >
              ✅ Finalizar Historia Clínica
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Pen className="w-4 h-4" />
                <span>{respuestas.firmaPaciente ? '✓ Firma' : 'Pendiente'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>{respuestas.fotoPaciente ? '✓ Foto' : 'Pendiente'}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // INPUT DE TEXTO/EMAIL/NUMBER/DATE
    if (["texto", "email", "number", "date"].includes(preguntaActual.tipo)) {
      return (
        <div className="space-y-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center leading-tight">
            {preguntaActual.pregunta}
          </h3>
          <div className="space-y-4">
            <Input
              type={preguntaActual.tipo === "texto" ? "text" : preguntaActual.tipo}
              value={valorTemporal}
              onChange={(e) => setValorTemporal(e.target.value)}
              placeholder={preguntaActual.placeholder}
              className="text-center text-lg h-16 text-xl"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTextoSubmit()
                }
              }}
            />
            <Button
              onClick={handleTextoSubmit}
              size="lg"
              className="w-full bg-medical-teal hover:bg-medical-teal/90 text-white font-bold text-lg h-14"
            >
              Continuar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Presiona Enter para continuar
            </p>
          </div>
        </div>
      )
    }

    // SEXO
    if (preguntaActual.tipo === "sexo") {
      return (
        <div className="space-y-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center leading-tight">
            {preguntaActual.pregunta}
          </h3>
          <div className="flex justify-center gap-8">
            <motion.button
              onClick={() => handleRespuesta("masculino")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-40 h-40 rounded-3xl bg-blue-500/10 border-2 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300 flex flex-col items-center justify-center"
            >
              <span className="text-6xl mb-2">♂</span>
              <span className="text-lg font-bold text-blue-500">Masculino</span>
            </motion.button>
            <motion.button
              onClick={() => handleRespuesta("femenino")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-40 h-40 rounded-3xl bg-pink-500/10 border-2 border-pink-500/30 hover:bg-pink-500/20 hover:border-pink-500/50 transition-all duration-300 flex flex-col items-center justify-center"
            >
              <span className="text-6xl mb-2">♀</span>
              <span className="text-lg font-bold text-pink-500">Femenino</span>
            </motion.button>
          </div>
        </div>
      )
    }

    // INPUT ADICIONAL (después de responder "si")
    if (mostrarInput) {
      return (
        <div className="space-y-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground text-center leading-tight">
            {preguntaActual.inputPlaceholder}
          </h3>
          <div className="space-y-4">
            <Input
              value={valorTemporal}
              onChange={(e) => setValorTemporal(e.target.value)}
              placeholder={preguntaActual.inputPlaceholder}
              className="text-center text-lg h-16"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleInputAdicional()
                }
              }}
            />
            <Button
              onClick={handleInputAdicional}
              size="lg"
              className="w-full bg-medical-teal hover:bg-medical-teal/90 text-white font-bold text-lg h-14"
            >
              Continuar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      )
    }

    // PULGARES (SI/NO)
    if (preguntaActual.tipo === "pulgar") {
      return (
        <div className="space-y-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center leading-tight">
            {preguntaActual.pregunta}
          </h3>
          <div className="flex justify-center gap-8">
            <motion.button
              onClick={() => handleRespuesta("no")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-40 h-40 rounded-3xl bg-red-500/10 border-2 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <ThumbsDown className="w-20 h-20 text-red-500 mb-2" />
                <span className="text-lg font-bold text-red-500">No</span>
              </div>
            </motion.button>
            <motion.button
              onClick={() => handleRespuesta("si")}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="w-40 h-40 rounded-3xl bg-green-500/10 border-2 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <ThumbsUp className="w-20 h-20 text-green-500 mb-2" />
                <span className="text-lg font-bold text-green-500">Sí</span>
              </div>
            </motion.button>
          </div>
        </div>
      )
    }

    // CUOTAS (3, 6, 9, 12 meses)
    if (preguntaActual.tipo === "cuotas") {
      return (
        <div className="space-y-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center leading-tight">
            {preguntaActual.pregunta}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[3, 6, 9, 12].map((cuotas) => (
              <motion.button
                key={cuotas}
                onClick={() => handleRespuesta(cuotas.toString())}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className="h-32 sm:h-40 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold text-center flex flex-col items-center justify-center shadow-lg transition-all"
              >
                <span className="text-4xl sm:text-5xl mb-2">{cuotas}</span>
                <span className="text-sm sm:text-base">meses</span>
              </motion.button>
            ))}
          </div>
        </div>
      )
    }

    // EMOJIS (MAL/REGULAR/EXCELENTE)
    if (preguntaActual.tipo === "emoji") {
      return (
        <div className="space-y-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-center leading-tight">
            {preguntaActual.pregunta}
          </h3>
          <div className="flex justify-center gap-6">
            <motion.button
              onClick={() => handleRespuesta("no")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <div className="w-28 h-28 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                <Frown className="w-16 h-16 text-red-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">Mal</p>
            </motion.button>
            <motion.button
              onClick={() => handleRespuesta("talvez")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <div className="w-28 h-28 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-all">
                <Meh className="w-16 h-16 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">Regular</p>
            </motion.button>
            <motion.button
              onClick={() => handleRespuesta("si")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <div className="w-28 h-28 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                <Smile className="w-16 h-16 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">Excelente</p>
            </motion.button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen relative p-4 sm:p-6 overflow-hidden">
      {/* Fondo Teal con Gradiente - Tonalidad más clara */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#14b8a6] via-[#0d9488] to-[#0f766e] z-0" />
      
      {/* Partículas Flotantes */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Logo en Esquina Superior Izquierda - Solo Desktop */}
      <div className="hidden sm:block fixed top-6 left-6 z-50">
        <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 px-5 py-3 hover:scale-105 transition-transform duration-300">
          <Image 
            src="/dents23-logo-final.png" 
            alt="Dent's 23" 
            width={200} 
            height={60}
            className="h-14 w-auto"
          />
        </div>
      </div>

      {/* Botón CRM */}
      <div className="fixed top-4 right-4 z-50">
        <Link href="/crm">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/90 backdrop-blur-sm text-[#0d5a5f] border-white/50 hover:bg-white hover:scale-105 transition-all shadow-lg font-semibold"
          >
            <Settings className="w-4 h-4 mr-2" />
            Acceso CRM
          </Button>
        </Link>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-8"
        >
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2"
          >
            Bienvenido a<br />Dent's 23
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-cyan-300 text-lg sm:text-xl font-medium tracking-wider uppercase mb-8"
          >
            We Serve People
          </motion.p>
          
          {/* Indicadores de Etapa */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs sm:text-sm">
            <div className={`flex items-center gap-2 ${paso < 13 ? 'text-cyan-300 font-semibold' : 'text-white/60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso < 13 ? 'bg-cyan-400 text-white' : 'bg-white/20 text-white/60'}`}>
                {paso < 13 ? '📝' : '✓'}
              </div>
              <span className="hidden sm:inline">Datos</span>
            </div>
            <span className="hidden sm:inline-block text-white/40">→</span>
            <div className={`flex items-center gap-2 ${paso >= 13 && paso < 27 ? 'text-cyan-300 font-semibold' : paso >= 27 ? 'text-white/80' : 'text-white/60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso >= 13 && paso < 27 ? 'bg-cyan-400 text-white' : paso >= 27 ? 'bg-cyan-400/50 text-white' : 'bg-white/20 text-white/60'}`}>
                {paso >= 27 ? '✓' : paso >= 13 ? '🏥' : '○'}
              </div>
              <span className="hidden sm:inline">Antecedentes</span>
            </div>
            <span className="hidden sm:inline-block text-white/40">→</span>
            <div className={`flex items-center gap-2 ${paso >= 27 && paso < 33 ? 'text-cyan-300 font-semibold' : paso >= 33 ? 'text-white/80' : 'text-white/60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso >= 27 && paso < 33 ? 'bg-cyan-400 text-white' : paso >= 33 ? 'bg-cyan-400/50 text-white' : 'bg-white/20 text-white/60'}`}>
                {paso >= 33 ? '✓' : paso >= 27 ? '🦷' : '○'}
              </div>
              <span className="hidden sm:inline">Dental</span>
            </div>
            <span className="hidden sm:inline-block text-white/40">→</span>
            <div className={`flex items-center gap-2 ${paso >= 33 && paso < 37 ? 'text-cyan-300 font-semibold' : paso >= 37 ? 'text-white/80' : 'text-white/60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso >= 33 && paso < 37 ? 'bg-cyan-400 text-white' : paso >= 37 ? 'bg-cyan-400/50 text-white' : 'bg-white/20 text-white/60'}`}>
                {paso >= 37 ? '✓' : paso >= 33 ? '💰' : '○'}
              </div>
              <span className="hidden sm:inline">Financiero</span>
            </div>
            <span className="hidden sm:inline-block text-white/40">→</span>
            <div className={`flex items-center gap-2 ${paso >= 37 ? 'text-cyan-300 font-semibold' : 'text-white/60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso >= 37 ? 'bg-cyan-400 text-white' : 'bg-white/20 text-white/60'}`}>
                {paso >= 37 ? '✍️' : '○'}
              </div>
              <span className="hidden sm:inline">Firma</span>
            </div>
          </div>
        </motion.div>

        {/* Barra de Progreso */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-sm text-white/80">
            <span>Pregunta {paso + 1} de {todasLasPreguntas.length}</span>
            <span>{Math.round(progreso)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300"
              initial={{ width: 0 }}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Pregunta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={paso}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white rounded-3xl shadow-2xl border-0 p-8 sm:p-12">
              {renderPregunta()}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Logo Pequeño Debajo - Solo Móvil */}
        <div className="sm:hidden flex justify-center mt-6">
          <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-md rounded-xl shadow-lg border border-white/30 px-4 py-2.5 w-[85%] max-w-sm">
            <Image 
              src="/dents23-logo-final.png" 
              alt="Dent's 23" 
              width={280} 
              height={80}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Modal de Aprobación de Crédito */}
      <AprobacionCredito
        open={mostrarAprobacion}
        onClose={handleCerrarAprobacion}
        datosFinancieros={{
          ingresoMensual: parseInt(respuestas.ingresoMensual) || 0,
          empresa: respuestas.empresa,
          antiguedad: respuestas.antiguedad
        }}
      />
    </div>
  )
}
