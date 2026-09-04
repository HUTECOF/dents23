"use client"

import { motion } from "framer-motion"
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown } from "lucide-react"

interface InteractiveQuestionProps {
  pregunta: string
  tipo: "emoji" | "pulgar" | "texto"
  onRespuesta: (valor: string) => void
  numeroActual: number
  totalPreguntas: number
}

export function InteractiveQuestion({
  pregunta,
  tipo,
  onRespuesta,
  numeroActual,
  totalPreguntas
}: InteractiveQuestionProps) {
  
  const progreso = (numeroActual / totalPreguntas) * 100

  const handleClick = (valor: string) => {
    onRespuesta(valor)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-teal/10 via-background to-medical-teal/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        {/* Barra de Progreso */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Pregunta {numeroActual} de {totalPreguntas}
            </span>
            <span className="text-sm font-semibold text-medical-teal">
              {Math.round(progreso)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-medical-teal to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Card de Pregunta */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-border/50"
        >
          {/* Pregunta */}
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 text-foreground leading-tight"
          >
            {pregunta}
          </motion.h2>

          {/* Opciones de Respuesta */}
          <div className="flex justify-center gap-6 sm:gap-8">
            {tipo === "emoji" && (
              <>
                <OpcionEmoji
                  icono={<Frown className="w-16 h-16 sm:w-20 sm:h-20" />}
                  label="No"
                  color="bg-red-500/10 hover:bg-red-500/20 border-red-500/30"
                  colorHover="hover:border-red-500"
                  onClick={() => handleClick("no")}
                  delay={0.4}
                />
                <OpcionEmoji
                  icono={<Meh className="w-16 h-16 sm:w-20 sm:h-20" />}
                  label="Tal vez"
                  color="bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30"
                  colorHover="hover:border-yellow-500"
                  onClick={() => handleClick("talvez")}
                  delay={0.5}
                />
                <OpcionEmoji
                  icono={<Smile className="w-16 h-16 sm:w-20 sm:h-20" />}
                  label="Sí"
                  color="bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                  colorHover="hover:border-green-500"
                  onClick={() => handleClick("si")}
                  delay={0.6}
                />
              </>
            )}

            {tipo === "pulgar" && (
              <>
                <OpcionPulgar
                  icono={<ThumbsDown className="w-20 h-20 sm:w-24 sm:h-24" />}
                  label="No"
                  color="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-500"
                  colorHover="hover:border-red-500 hover:shadow-red-500/20"
                  onClick={() => handleClick("no")}
                  delay={0.4}
                />
                <OpcionPulgar
                  icono={<ThumbsUp className="w-20 h-20 sm:w-24 sm:h-24" />}
                  label="Sí"
                  color="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-500"
                  colorHover="hover:border-green-500 hover:shadow-green-500/20"
                  onClick={() => handleClick("si")}
                  delay={0.5}
                />
              </>
            )}
          </div>

          {/* Indicador de Tap */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            Toca una opción para continuar
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Componente de Opción con Emoji
function OpcionEmoji({
  icono,
  label,
  color,
  colorHover,
  onClick,
  delay
}: {
  icono: React.ReactNode
  label: string
  color: string
  colorHover: string
  onClick: () => void
  delay: number
}) {
  return (
    <motion.button
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay 
      }}
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center
        w-28 h-28 sm:w-32 sm:h-32
        rounded-2xl border-2 transition-all duration-300
        ${color} ${colorHover}
        shadow-lg hover:shadow-xl
      `}
    >
      <div className="mb-2">{icono}</div>
      <span className="text-sm font-semibold">{label}</span>
    </motion.button>
  )
}

// Componente de Opción con Pulgar
function OpcionPulgar({
  icono,
  label,
  color,
  colorHover,
  onClick,
  delay
}: {
  icono: React.ReactNode
  label: string
  color: string
  colorHover: string
  onClick: () => void
  delay: number
}) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay 
      }}
      whileHover={{ scale: 1.15, y: -10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center
        w-36 h-36 sm:w-40 sm:h-40
        rounded-3xl border-3 transition-all duration-300
        ${color} ${colorHover}
        shadow-xl hover:shadow-2xl
      `}
    >
      <div className="mb-3">{icono}</div>
      <span className="text-lg font-bold">{label}</span>
    </motion.button>
  )
}
