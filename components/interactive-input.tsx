"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState } from "react"

interface InteractiveInputProps {
  pregunta: string
  placeholder: string
  tipo?: "text" | "email" | "number" | "date"
  icono?: React.ReactNode
  onRespuesta: (valor: string) => void
  numeroActual: number
  totalPreguntas: number
  required?: boolean
}

export function InteractiveInput({
  pregunta,
  placeholder,
  tipo = "text",
  icono,
  onRespuesta,
  numeroActual,
  totalPreguntas,
  required = false
}: InteractiveInputProps) {
  
  const [valor, setValor] = useState("")
  const progreso = (numeroActual / totalPreguntas) * 100

  const handleContinuar = () => {
    if (required && !valor.trim()) {
      return
    }
    onRespuesta(valor)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleContinuar()
    }
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
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 text-foreground leading-tight"
          >
            {pregunta}
          </motion.h2>

          {/* Input */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="relative">
              {icono && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-medical-teal">
                  {icono}
                </div>
              )}
              <Input
                type={tipo}
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className={`
                  h-16 text-lg text-center
                  ${icono ? 'pl-12' : ''}
                  border-2 border-border/50
                  focus:border-medical-teal focus:ring-4 focus:ring-medical-teal/20
                  transition-all duration-300
                  rounded-2xl
                `}
                autoFocus
              />
            </div>

            <Button
              onClick={handleContinuar}
              disabled={required && !valor.trim()}
              size="lg"
              className="w-full h-14 text-lg rounded-xl bg-medical-teal hover:bg-medical-teal/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Continuar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Indicador */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            {required ? "* Campo obligatorio" : "Presiona Enter para continuar"}
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}
