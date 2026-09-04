"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Shield, FileCheck, UserCheck, Sparkles, Lock } from "lucide-react"
import { useEffect, useState } from "react"

interface VerificationAnimationProps {
  onComplete: () => void
}

export default function VerificationAnimation({ onComplete }: VerificationAnimationProps) {
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Progreso continuo
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + (100 / 150) // 15 segundos = 150 décimas
      })
    }, 100)

    // Cambio de etapas
    const stageTimings = [0, 3000, 6000, 9000, 12000, 15000]
    const stageTimeouts = stageTimings.map((timing, index) => 
      setTimeout(() => {
        if (index < 5) {
          setStage(index)
        } else {
          onComplete()
        }
      }, timing)
    )

    return () => {
      clearInterval(progressInterval)
      stageTimeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [onComplete])

  const stages = [
    {
      icon: FileCheck,
      title: "Verificando Documentos",
      description: "Validando historia clínica y formularios",
      color: "text-blue-500"
    },
    {
      icon: Shield,
      title: "Análisis de Seguridad",
      description: "Verificando integridad de datos",
      color: "text-purple-500"
    },
    {
      icon: UserCheck,
      title: "Validación de Identidad",
      description: "Confirmando información del paciente",
      color: "text-green-500"
    },
    {
      icon: Lock,
      title: "Encriptación de Datos",
      description: "Protegiendo información médica",
      color: "text-orange-500"
    },
    {
      icon: Sparkles,
      title: "Generando Documento",
      description: "Preparando PDF con toda la información",
      color: "text-pink-500"
    }
  ]

  const currentStage = stages[stage]
  const Icon = currentStage.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl px-4 sm:px-8">
        
        {/* Partículas de fondo animadas */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-medical-teal/20 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                scale: 0
              }}
              animate={{ 
                y: [null, Math.random() * -100 + "%"],
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Contenedor principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-card/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl border border-border/50"
        >
          
          {/* Icono central animado */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <motion.div
              key={stage}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative"
            >
              {/* Anillo exterior pulsante */}
              <motion.div
                className="absolute inset-0 rounded-full bg-medical-teal/20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ width: 80, height: 80, margin: -8 }}
              />
              
              {/* Icono */}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-medical-teal/20 to-medical-teal/5 flex items-center justify-center ${currentStage.color}`}>
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" strokeWidth={1.5} />
              </div>
              
              {/* Checkmarks de etapas completadas */}
              <AnimatePresence>
                {stage > 0 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Título y descripción */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-6 sm:mb-8 px-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 sm:mb-3">
                {currentStage.title}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                {currentStage.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Barra de progreso */}
          <div className="space-y-3">
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-medical-teal via-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
              
              {/* Brillo animado */}
              <motion.div
                className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "500%"] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Procesando...
              </span>
              <span className="font-mono font-semibold text-medical-teal">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Indicadores de etapas */}
          <div className="flex justify-center gap-2 mt-8">
            {stages.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index <= stage 
                    ? "bg-medical-teal w-8" 
                    : "bg-muted w-2"
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>

          {/* Texto de seguridad */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Conexión segura y encriptada</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  )
}
