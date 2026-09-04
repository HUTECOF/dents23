"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, Smile, Meh, Frown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

interface AntecedentesInteractivosProps {
  formData: any
  onComplete: (data: any) => void
}

const preguntas = [
  { id: "alergico", pregunta: "¿Es usted alérgico a algún medicamento?", tipo: "pulgar", tieneInput: true, inputPlaceholder: "¿Cuál medicamento?" },
  { id: "saludBuena", pregunta: "¿Su estado de salud lo considera bueno?", tipo: "emoji" },
  { id: "medicoUltimoAnio", pregunta: "¿Ha acudido al médico en el último año?", tipo: "pulgar" },
  { id: "enfermedadUltimos6Meses", pregunta: "¿Ha padecido alguna enfermedad en los últimos 6 meses?", tipo: "pulgar" },
  { id: "hipertension", pregunta: "¿Padece de hipertensión?", tipo: "pulgar" },
  { id: "tomandoMedicamento", pregunta: "¿Está tomando algún medicamento actualmente?", tipo: "pulgar" },
  { id: "diabetes", pregunta: "¿Padece diabetes?", tipo: "pulgar", tieneInput: true, inputPlaceholder: "Último resultado de glucosa y fecha (Ej: 95 mg/dL - 15/Nov/2024)", ayuda: "Nivel normal en ayunas: 70 a 100 mg/dL" },
  { id: "alteracionesRenales", pregunta: "¿Tiene alteraciones renales?", tipo: "pulgar" },
  { id: "cancer", pregunta: "¿Ha padecido cáncer?", tipo: "pulgar" },
  { id: "sangradoExcesivo", pregunta: "¿Tiene tendencia al sangrado excesivo?", tipo: "pulgar" },
  { id: "embarazada", pregunta: "¿Estás embarazada? (si aplica)", tipo: "pulgar" },
  { id: "epilepsia", pregunta: "¿Padeces epilepsia?", tipo: "pulgar" },
  { id: "medicamentosAnticoagulantes", pregunta: "¿Tomas medicamentos anticoagulantes?", tipo: "pulgar" },
  { id: "aspirinas", pregunta: "¿Tomas aspirinas regularmente?", tipo: "pulgar" },
]

export function AntecedentesInteractivos({ formData, onComplete }: AntecedentesInteractivosProps) {
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState<any>(formData || {})
  const [mostrarInput, setMostrarInput] = useState(false)

  const preguntaActual = preguntas[paso]
  const progreso = ((paso + 1) / preguntas.length) * 100

  const handleRespuesta = (valor: string) => {
    const nuevasRespuestas = {
      ...respuestas,
      [preguntaActual.id]: valor
    }
    setRespuestas(nuevasRespuestas)

    // Si la pregunta tiene input y respondió "si", mostrar input
    if (preguntaActual.tieneInput && valor === "si") {
      setMostrarInput(true)
    } else {
      avanzarPregunta(nuevasRespuestas)
    }
  }

  const avanzarPregunta = (nuevasRespuestas: any) => {
    if (paso < preguntas.length - 1) {
      setTimeout(() => {
        setPaso(paso + 1)
        setMostrarInput(false)
      }, 300)
    } else {
      // Completado
      setTimeout(() => {
        onComplete(nuevasRespuestas)
      }, 300)
    }
  }

  const handleInputComplete = () => {
    avanzarPregunta(respuestas)
  }

  const renderOpciones = () => {
    if (preguntaActual.tipo === "pulgar") {
      return (
        <div className="flex justify-center gap-8">
          <motion.button
            onClick={() => handleRespuesta("no")}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-red-500/10 border-2 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <ThumbsDown className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mb-2" />
              <span className="text-lg font-bold text-red-500">No</span>
            </div>
          </motion.button>

          <motion.button
            onClick={() => handleRespuesta("si")}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-green-500/10 border-2 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <ThumbsUp className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mb-2" />
              <span className="text-lg font-bold text-green-500">Sí</span>
            </div>
          </motion.button>
        </div>
      )
    }

    if (preguntaActual.tipo === "emoji") {
      return (
        <div className="flex justify-center gap-6">
          <motion.button
            onClick={() => handleRespuesta("no")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="group transition-all duration-300"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all">
              <Frown className="w-14 h-14 sm:w-16 sm:h-16 text-red-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">Mal</p>
          </motion.button>

          <motion.button
            onClick={() => handleRespuesta("talvez")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="group transition-all duration-300"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-all">
              <Meh className="w-14 h-14 sm:w-16 sm:h-16 text-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">Regular</p>
          </motion.button>

          <motion.button
            onClick={() => handleRespuesta("si")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="group transition-all duration-300"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-all">
              <Smile className="w-14 h-14 sm:w-16 sm:h-16 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">Excelente</p>
          </motion.button>
        </div>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra de Progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Pregunta {paso + 1} de {preguntas.length}</span>
          <span>{Math.round(progreso)}%</span>
        </div>
        <Progress value={progreso} className="h-2" />
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
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 p-8 sm:p-12">
            <div className="text-center space-y-8">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {preguntaActual.pregunta}
              </h3>

              {!mostrarInput && (
                <div className="pt-4">
                  {renderOpciones()}
                </div>
              )}

              {mostrarInput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {preguntaActual.id === "diabetes" && (
                    <>
                      {preguntaActual.ayuda && (
                        <div className="bg-medical-teal/10 border-2 border-medical-teal/30 rounded-lg p-4 mb-4">
                          <p className="text-medical-teal font-semibold text-center">
                            ℹ️ {preguntaActual.ayuda}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap justify-center gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => {
                            setRespuestas({
                              ...respuestas,
                              [`${preguntaActual.id}Cual`]: "Nunca me la he tomado"
                            })
                            setTimeout(handleInputComplete, 300)
                          }}
                          className="px-4 py-2 rounded-lg bg-blue-500/10 border-2 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 text-blue-600 font-medium transition-all"
                        >
                          Nunca me la he tomado
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRespuestas({
                              ...respuestas,
                              [`${preguntaActual.id}Cual`]: "No sé"
                            })
                            setTimeout(handleInputComplete, 300)
                          }}
                          className="px-4 py-2 rounded-lg bg-amber-500/10 border-2 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 text-amber-600 font-medium transition-all"
                        >
                          No sé
                        </button>
                      </div>
                    </>
                  )}
                  <Input
                    value={respuestas[`${preguntaActual.id}Cual`] || ""}
                    onChange={(e) => setRespuestas({
                      ...respuestas,
                      [`${preguntaActual.id}Cual`]: e.target.value
                    })}
                    placeholder={preguntaActual.inputPlaceholder}
                    className="text-center text-lg h-14"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleInputComplete()
                      }
                    }}
                  />
                  <button
                    onClick={handleInputComplete}
                    className="text-sm text-medical-teal hover:underline"
                  >
                    Presiona Enter o haz click para continuar
                  </button>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
