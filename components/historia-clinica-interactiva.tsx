"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { InteractiveQuestion } from "./interactive-question"
import { InteractiveInput } from "./interactive-input"
import { SuccessScreen } from "./success-screen"
import { Building2, Calendar, User, Mail, Phone, MapPin, Briefcase } from "lucide-react"

interface Pregunta {
  id: string
  tipo: "emoji" | "pulgar" | "texto" | "email" | "number" | "date"
  pregunta: string
  placeholder?: string
  icono?: React.ReactNode
  required?: boolean
}

const preguntas: Pregunta[] = [
  // Datos Personales
  { id: "empresa", tipo: "texto", pregunta: "¿En qué empresa trabajas?", placeholder: "Nombre de la empresa", icono: <Building2 className="w-5 h-5" /> },
  { id: "antiguedad", tipo: "texto", pregunta: "¿Cuánto tiempo llevas en la empresa?", placeholder: "Ej. 5 años", icono: <Calendar className="w-5 h-5" /> },
  { id: "fecha", tipo: "date", pregunta: "¿Cuál es la fecha de hoy?", icono: <Calendar className="w-5 h-5" /> },
  { id: "nombre", tipo: "texto", pregunta: "¿Cuál es tu nombre completo?", placeholder: "Nombre completo", icono: <User className="w-5 h-5" />, required: true },
  { id: "ocupacion", tipo: "texto", pregunta: "¿Cuál es tu ocupación?", placeholder: "Tu ocupación", icono: <Briefcase className="w-5 h-5" /> },
  { id: "direccion", tipo: "texto", pregunta: "¿Cuál es tu dirección?", placeholder: "Dirección completa", icono: <MapPin className="w-5 h-5" /> },
  { id: "edad", tipo: "number", pregunta: "¿Cuál es tu edad?", placeholder: "Tu edad" },
  { id: "email", tipo: "email", pregunta: "¿Cuál es tu correo electrónico?", placeholder: "correo@ejemplo.com", icono: <Mail className="w-5 h-5" /> },
  { id: "celular", tipo: "texto", pregunta: "¿Cuál es tu número de celular?", placeholder: "Número de celular", icono: <Phone className="w-5 h-5" /> },
  { id: "telefono", tipo: "texto", pregunta: "¿Tienes teléfono fijo?", placeholder: "Número de teléfono (opcional)", icono: <Phone className="w-5 h-5" /> },
  
  // Antecedentes Personales
  { id: "alergico", tipo: "pulgar", pregunta: "¿Eres alérgico a algún medicamento?" },
  { id: "saludBuena", tipo: "emoji", pregunta: "¿Consideras que tu estado de salud es bueno?" },
  { id: "medicoUltimoAnio", tipo: "pulgar", pregunta: "¿Has acudido al médico en el último año?" },
  { id: "enfermedadUltimos6Meses", tipo: "pulgar", pregunta: "¿Has padecido alguna enfermedad en los últimos 6 meses?" },
  { id: "hipertension", tipo: "pulgar", pregunta: "¿Padeces de hipertensión?" },
  { id: "tomandoMedicamento", tipo: "pulgar", pregunta: "¿Estás tomando algún medicamento actualmente?" },
  { id: "diabetes", tipo: "pulgar", pregunta: "¿Padeces diabetes?" },
  { id: "alteracionesRenales", tipo: "pulgar", pregunta: "¿Tienes alteraciones renales?" },
  { id: "cancer", tipo: "pulgar", pregunta: "¿Has padecido cáncer?" },
  { id: "sangradoExcesivo", tipo: "pulgar", pregunta: "¿Tienes tendencia al sangrado excesivo?" },
  { id: "embarazada", tipo: "pulgar", pregunta: "¿Estás embarazada? (si aplica)" },
  { id: "epilepsia", tipo: "pulgar", pregunta: "¿Padeces epilepsia?" },
  { id: "medicamentosAnticoagulantes", tipo: "pulgar", pregunta: "¿Tomas medicamentos anticoagulantes?" },
  { id: "aspirinas", tipo: "pulgar", pregunta: "¿Tomas aspirinas regularmente?" },
  
  // Historia Clínica Dental
  { id: "ultimaVisitaDentista", tipo: "emoji", pregunta: "¿Has visitado al dentista recientemente?" },
  { id: "dolorDental", tipo: "pulgar", pregunta: "¿Tienes dolor dental actualmente?" },
  { id: "anestesia", tipo: "emoji", pregunta: "¿Has recibido anestesia dental antes?" },
  { id: "reaccionAlergicaAnestesia", tipo: "pulgar", pregunta: "¿Has tenido reacción alérgica a la anestesia?" },
  { id: "complicacionVisitaDental", tipo: "pulgar", pregunta: "¿Has tenido complicaciones en visitas dentales previas?" },
  { id: "impedimentoAnestesia", tipo: "pulgar", pregunta: "¿Existe algún impedimento médico para aplicarte anestesia?" },
]

interface HistoriaClinicaInteractivaProps {
  onComplete: (datos: Record<string, string>) => void
}

export function HistoriaClinicaInteractiva({ onComplete }: HistoriaClinicaInteractivaProps) {
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [mostrarExito, setMostrarExito] = useState(false)

  const totalPreguntas = preguntas.length
  const pregunta = preguntas[preguntaActual]

  const handleRespuesta = (valor: string) => {
    const nuevasRespuestas = {
      ...respuestas,
      [pregunta.id]: valor
    }
    setRespuestas(nuevasRespuestas)

    // Siguiente pregunta
    if (preguntaActual < totalPreguntas - 1) {
      setTimeout(() => {
        setPreguntaActual(preguntaActual + 1)
      }, 300)
    } else {
      // Completado
      setTimeout(() => {
        setMostrarExito(true)
      }, 300)
    }
  }

  const handleContinuar = () => {
    onComplete(respuestas)
  }

  if (mostrarExito) {
    return (
      <SuccessScreen
        titulo="¡Historia Clínica Completada!"
        mensaje="Gracias por proporcionar tu información. Ahora continuaremos con el contrato de autorización."
        onContinuar={handleContinuar}
      />
    )
  }

  return (
    <AnimatePresence mode="wait">
      {(pregunta.tipo === "emoji" || pregunta.tipo === "pulgar") ? (
        <InteractiveQuestion
          key={pregunta.id}
          pregunta={pregunta.pregunta}
          tipo={pregunta.tipo}
          onRespuesta={handleRespuesta}
          numeroActual={preguntaActual + 1}
          totalPreguntas={totalPreguntas}
        />
      ) : (
        <InteractiveInput
          key={pregunta.id}
          pregunta={pregunta.pregunta}
          placeholder={pregunta.placeholder || ""}
          tipo={pregunta.tipo as any}
          icono={pregunta.icono}
          onRespuesta={handleRespuesta}
          numeroActual={preguntaActual + 1}
          totalPreguntas={totalPreguntas}
          required={pregunta.required}
        />
      )}
    </AnimatePresence>
  )
}
