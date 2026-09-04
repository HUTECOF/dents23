"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface ModernQuestionProps {
  question: string
  name: string
  value?: string
  onValueChange: (value: "si" | "no") => void
  index?: number
}

export function ModernQuestion({ 
  question, 
  name, 
  value, 
  onValueChange,
  index = 0
}: ModernQuestionProps) {
  const [showCheck, setShowCheck] = useState(false)

  const handleClick = (val: "si" | "no") => {
    onValueChange(val)
    setShowCheck(true)
    setTimeout(() => setShowCheck(false), 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="w-full"
    >
      <Card className={`
        p-6 sm:p-8 transition-all duration-300 relative overflow-hidden
        ${value ? 'bg-medical-teal/5 border-medical-teal/30 shadow-lg' : 'bg-card/80 border-border/50'}
        backdrop-blur-sm
      `}>
        {/* Efecto de check cuando se responde */}
        {showCheck && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-4 right-4"
          >
            <CheckCircle2 className="w-6 h-6 text-medical-teal" />
          </motion.div>
        )}

        {/* Pregunta */}
        <div className="text-center mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            {question}
          </h3>
          {value && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-medical-teal font-medium"
            >
              Respondido: {value === 'si' ? 'Sí' : 'No'}
            </motion.p>
          )}
        </div>

        {/* Opciones */}
        <div className="flex justify-center gap-4 sm:gap-8">
          {/* Botón NO */}
          <motion.button
            onClick={() => handleClick("no")}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`
              group relative
              w-28 h-28 sm:w-32 sm:h-32
              rounded-2xl
              transition-all duration-300
              ${value === 'no' 
                ? 'bg-red-500/20 border-2 border-red-500 shadow-lg shadow-red-500/20' 
                : 'bg-red-500/10 border-2 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50'
              }
            `}
          >
            {/* Efecto de onda al seleccionar */}
            {value === 'no' && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-red-500/20"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <ThumbsDown className={`
                w-12 h-12 sm:w-14 sm:h-14 mb-2 transition-all duration-300
                ${value === 'no' ? 'text-red-500' : 'text-red-500/70 group-hover:text-red-500'}
              `} />
              <span className={`
                text-sm sm:text-base font-bold transition-all duration-300
                ${value === 'no' ? 'text-red-500' : 'text-red-500/70 group-hover:text-red-500'}
              `}>
                No
              </span>
            </div>
          </motion.button>

          {/* Botón SÍ */}
          <motion.button
            onClick={() => handleClick("si")}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`
              group relative
              w-28 h-28 sm:w-32 sm:h-32
              rounded-2xl
              transition-all duration-300
              ${value === 'si' 
                ? 'bg-green-500/20 border-2 border-green-500 shadow-lg shadow-green-500/20' 
                : 'bg-green-500/10 border-2 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50'
              }
            `}
          >
            {/* Efecto de onda al seleccionar */}
            {value === 'si' && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-green-500/20"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <ThumbsUp className={`
                w-12 h-12 sm:w-14 sm:h-14 mb-2 transition-all duration-300
                ${value === 'si' ? 'text-green-500' : 'text-green-500/70 group-hover:text-green-500'}
              `} />
              <span className={`
                text-sm sm:text-base font-bold transition-all duration-300
                ${value === 'si' ? 'text-green-500' : 'text-green-500/70 group-hover:text-green-500'}
              `}>
                Sí
              </span>
            </div>
          </motion.button>
        </div>
      </Card>
    </motion.div>
  )
}
