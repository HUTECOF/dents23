"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles, TrendingUp, DollarSign, X, Download, Share2 } from "lucide-react"
import confetti from "canvas-confetti"
import Image from "next/image"

interface AprobacionCreditoProps {
  open: boolean
  onClose: () => void
  datosFinancieros: {
    ingresoMensual?: number
    empresa?: string
    antiguedad?: string
  }
}

export function AprobacionCredito({ open, onClose, datosFinancieros }: AprobacionCreditoProps) {
  const [mostrar, setMostrar] = useState(false)
  const [lineaAprobada, setLineaAprobada] = useState(0)
  const [verificando, setVerificando] = useState(true)
  const [progreso, setProgreso] = useState(0)
  const [mensajeVerificacion, setMensajeVerificacion] = useState("Verificando información...")

  useEffect(() => {
    if (open) {
      // Calcular línea de crédito basada en datos
      const linea = calcularLineaCredito(datosFinancieros)
      setLineaAprobada(linea)
      setMostrar(true)
      setVerificando(true)
      setProgreso(0)
      
      // Simulación de verificación con mensajes cambiantes
      const mensajes = [
        "Verificando información...",
        "Analizando datos financieros...",
        "Consultando historial crediticio...",
        "Evaluando capacidad de pago...",
        "Calculando línea de crédito...",
        "Procesando aprobación...",
        "¡Finalizando análisis!"
      ]
      
      let mensajeIndex = 0
      const intervaloMensaje = setInterval(() => {
        if (mensajeIndex < mensajes.length - 1) {
          mensajeIndex++
          setMensajeVerificacion(mensajes[mensajeIndex])
        }
      }, 2800)
      
      // Progreso gradual
      const intervaloProgreso = setInterval(() => {
        setProgreso(prev => {
          if (prev >= 100) {
            clearInterval(intervaloProgreso)
            return 100
          }
          return prev + 0.5
        })
      }, 100)
      
      // Después de 20 segundos, mostrar aprobación
      setTimeout(() => {
        setVerificando(false)
        clearInterval(intervaloMensaje)
        clearInterval(intervaloProgreso)
        setProgreso(100)
        
        // Confetti después de mostrar aprobación
        setTimeout(() => {
          lanzarConfetti()
        }, 500)
      }, 20000)
      
      return () => {
        clearInterval(intervaloMensaje)
        clearInterval(intervaloProgreso)
      }
    }
  }, [open, datosFinancieros])

  const calcularLineaCredito = (datos: any) => {
    const ingreso = datos.ingresoMensual || 0
    
    // Lógica de aprobación
    if (ingreso >= 30000) {
      return 50000
    } else if (ingreso >= 15000) {
      return 25000
    } else {
      return 15000
    }
  }

  const lanzarConfetti = () => {
    const duration = 4000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#0891B2', '#06B6D4', '#84CC16', '#A3E635', '#22D3EE']
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#0891B2', '#06B6D4', '#84CC16', '#A3E635', '#22D3EE']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const handleDescargar = () => {
    alert("Descargando comprobante de aprobación...")
    // Aquí iría la lógica de descarga del PDF
  }

  const handleCompartir = () => {
    alert("Compartiendo información...")
    // Aquí iría la lógica de compartir
  }

  if (!mostrar) return null

  return (
    <AnimatePresence>
      {mostrar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-full max-w-2xl my-auto"
          >
            {/* Botón Cerrar - solo visible después de verificación */}
            {!verificando && (
              <button
                onClick={onClose}
                className="absolute -top-4 -right-4 z-10 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-gray-100 transition-all hover:scale-110"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            )}

            <Card className="bg-gradient-to-br from-medical-teal via-cyan-500 to-medical-green p-4 sm:p-8 md:p-12 border-0 shadow-2xl overflow-hidden relative">
              {/* Efectos de fondo */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10 space-y-4 sm:space-y-6 md:space-y-8">
                {verificando ? (
                  // PANTALLA DE VERIFICACIÓN
                  <>
                    {/* Header con Logo */}
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="flex justify-center mb-4"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-white flex items-center justify-center shadow-xl">
                            <Image src="/dents23-logo.svg" alt="Dent's 23" width={40} height={40} className="sm:w-12 sm:h-12 md:w-16 md:h-16" />
                          </div>
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
                            className="absolute inset-0 rounded-full bg-white"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Dent's 23</h2>
                        <p className="text-white/90 text-xs sm:text-sm md:text-base">We Serve People</p>
                      </motion.div>
                    </div>

                    {/* Spinner de Verificación */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                      className="flex justify-center"
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 border-4 sm:border-6 md:border-8 border-white/30 border-t-white rounded-full"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 border-4 sm:border-6 md:border-8 border-transparent border-r-white/50 rounded-full"
                        />
                      </div>
                    </motion.div>

                    {/* Mensaje de Verificación */}
                    <motion.div
                      key={mensajeVerificacion}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center space-y-2 sm:space-y-3 md:space-y-4 px-2"
                    >
                      <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                        {mensajeVerificacion}
                      </h3>
                      <p className="text-white/80 text-sm sm:text-base md:text-lg">
                        Por favor espera mientras procesamos tu solicitud
                      </p>
                    </motion.div>

                    {/* Barra de Progreso */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2 sm:space-y-3 px-2"
                    >
                      <div className="bg-white/20 rounded-full h-3 sm:h-4 overflow-hidden backdrop-blur-sm">
                        <motion.div
                          className="h-full bg-gradient-to-r from-white via-yellow-200 to-white rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${progreso}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-white/90 text-center text-base sm:text-lg font-semibold">
                        {Math.round(progreso)}%
                      </p>
                    </motion.div>

                    {/* Puntos animados */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex justify-center gap-2"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                          className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"
                        />
                      ))}
                    </motion.div>

                    {/* Información del Usuario */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 mx-2"
                    >
                      <p className="text-white/90 text-xs sm:text-sm text-center break-words">
                        <strong>Empresa:</strong> {datosFinancieros.empresa || "N/A"} • 
                        <strong> Antigüedad:</strong> {datosFinancieros.antiguedad || "N/A"}
                      </p>
                    </motion.div>
                  </>
                ) : (
                  // PANTALLA DE APROBACIÓN (código existente)
                  <>
                    {/* Header con Logo */}
                    <div className="text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="flex justify-center mb-4"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl">
                        <Image src="/dents23-logo.svg" alt="Dent's 23" width={60} height={60} />
                      </div>
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
                        className="absolute inset-0 rounded-full bg-white"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-white text-2xl sm:text-3xl font-bold mb-2">Dent's 23</h2>
                    <p className="text-white/90 text-sm sm:text-base">We Serve People</p>
                  </motion.div>
                </div>

                {/* Check de Aprobación */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <CheckCircle2 className="w-20 h-20 sm:w-24 sm:h-24 text-white drop-shadow-lg" />
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                      className="absolute inset-0 rounded-full bg-white"
                    />
                  </div>
                </motion.div>

                {/* Mensaje Principal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center space-y-1 sm:space-y-2 px-2"
                >
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                    ¡Felicidades!
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium">
                    Has sido aprobado
                  </p>
                </motion.div>

                {/* Línea de Crédito */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="bg-white/20 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-white/30 mx-2"
                >
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-300" />
                      <p className="text-white/90 text-base sm:text-lg md:text-xl font-semibold">
                        Tu línea de financiamiento
                      </p>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-300" />
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 150 }}
                      className="relative"
                    >
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" />
                        <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white drop-shadow-2xl">
                          {lineaAprobada.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white/80 text-xs sm:text-sm md:text-base mt-2">
                        MXN disponibles para tu tratamiento dental
                      </p>
                    </motion.div>

                    {/* Beneficios */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6"
                    >
                      <div className="text-center">
                        <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white mx-auto mb-1 sm:mb-2" />
                        <p className="text-white/90 text-[10px] sm:text-xs md:text-sm font-medium leading-tight">Sin enganche</p>
                      </div>
                      <div className="text-center">
                        <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white mx-auto mb-1 sm:mb-2" />
                        <p className="text-white/90 text-[10px] sm:text-xs md:text-sm font-medium leading-tight">Aprobación inmediata</p>
                      </div>
                      <div className="text-center">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white mx-auto mb-1 sm:mb-2" />
                        <p className="text-white/90 text-[10px] sm:text-xs md:text-sm font-medium leading-tight">Pagos flexibles</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Información Adicional */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 mx-2"
                >
                  <p className="text-white/90 text-xs sm:text-sm text-center break-words">
                    <strong>Empresa:</strong> {datosFinancieros.empresa || "N/A"} • 
                    <strong> Antigüedad:</strong> {datosFinancieros.antiguedad || "N/A"}
                  </p>
                </motion.div>

                {/* Botones de Acción */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-2"
                >
                  <Button
                    onClick={handleDescargar}
                    className="flex-1 bg-white text-medical-teal hover:bg-white/90 font-bold text-sm sm:text-base md:text-lg h-12 sm:h-14 rounded-xl shadow-lg"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="truncate">Descargar Comprobante</span>
                  </Button>
                  <Button
                    onClick={handleCompartir}
                    variant="outline"
                    className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30 font-bold text-sm sm:text-base md:text-lg h-12 sm:h-14 rounded-xl backdrop-blur-sm"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Compartir
                  </Button>
                </motion.div>

                {/* Botón Cerrar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="px-2"
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 font-semibold text-sm sm:text-base h-11 sm:h-12 rounded-xl backdrop-blur-sm"
                  >
                    Cerrar y Continuar
                  </Button>
                </motion.div>

                {/* Nota Legal */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                  className="text-white/60 text-[10px] sm:text-xs text-center px-2"
                >
                  * Sujeto a aprobación final. Términos y condiciones aplican.
                </motion.p>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
