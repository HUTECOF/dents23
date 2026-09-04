"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles } from "lucide-react"
import { useEffect } from "react"
import confetti from "canvas-confetti"

interface SuccessScreenProps {
  titulo: string
  mensaje: string
  onContinuar: () => void
}

export function SuccessScreen({
  titulo,
  mensaje,
  onContinuar
}: SuccessScreenProps) {

  useEffect(() => {
    // Confetti al montar
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#0891B2', '#06B6D4', '#84CC16', '#A3E635'] // Colores Dent's 23
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#0891B2', '#06B6D4', '#84CC16', '#A3E635'] // Colores Dent's 23
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-teal/20 via-background to-medical-teal/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-border/50 text-center">
          
          {/* Icono de Éxito */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <CheckCircle2 className="w-24 h-24 text-medical-teal" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-medical-teal/20"
              />
            </div>
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            {titulo}
          </motion.h1>

          {/* Mensaje */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground mb-8"
          >
            {mensaje}
          </motion.p>

          {/* Sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-2 mb-8"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              >
                <Sparkles className="w-6 h-6 text-medical-teal" />
              </motion.div>
            ))}
          </motion.div>

          {/* Botón */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={onContinuar}
              size="lg"
              className="px-12 h-14 text-lg rounded-xl bg-medical-teal hover:bg-medical-teal/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Continuar al Siguiente Paso
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
