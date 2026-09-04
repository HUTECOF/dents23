"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText, 
  CreditCard, 
  FileSignature, 
  Shield,
  ArrowRight
} from "lucide-react"

interface ProgresoProspectoProps {
  progresoPaso: string
  progresoPorcentaje: number
  urlContinuar?: string
  fechaUltimoPaso?: string
  onContinuar?: () => void
}

const PASOS = [
  {
    id: 'historia_clinica',
    nombre: 'Historia Clínica',
    icono: FileText,
    porcentaje: 25,
  },
  {
    id: 'formulario_completo',
    nombre: 'Formulario Completo',
    icono: FileSignature,
    porcentaje: 50,
  },
  {
    id: 'aprobacion_credito',
    nombre: 'Aprobación Crédito',
    icono: CreditCard,
    porcentaje: 65,
  },
  {
    id: 'contrato',
    nombre: 'Contrato',
    icono: Shield,
    porcentaje: 80,
  },
  {
    id: 'consentimiento',
    nombre: 'Consentimiento',
    icono: CheckCircle2,
    porcentaje: 100,
  },
]

export function ProgresoProspecto({
  progresoPaso,
  progresoPorcentaje,
  urlContinuar,
  fechaUltimoPaso,
  onContinuar,
}: ProgresoProspectoProps) {
  const pasoActualIndex = PASOS.findIndex(p => p.id === progresoPaso)
  
  const getDiasInactivo = () => {
    if (!fechaUltimoPaso) return 0
    const diff = Date.now() - new Date(fechaUltimoPaso).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const diasInactivo = getDiasInactivo()

  return (
    <div className="space-y-4">
      {/* Barra de progreso principal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progreso del Registro</span>
          <span className="text-medical-teal font-bold">{progresoPorcentaje}%</span>
        </div>
        <Progress value={progresoPorcentaje} className="h-3" />
      </div>

      {/* Pasos */}
      <div className="space-y-2">
        {PASOS.map((paso, index) => {
          const completado = index < pasoActualIndex
          const actual = index === pasoActualIndex
          const pendiente = index > pasoActualIndex
          const Icono = paso.icono

          return (
            <motion.div
              key={paso.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                actual ? 'bg-medical-teal/10 border border-medical-teal/30' : ''
              }`}
            >
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                completado 
                  ? 'bg-green-500 text-white' 
                  : actual 
                  ? 'bg-medical-teal text-white animate-pulse' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {completado ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : actual ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  completado ? 'text-green-600' : actual ? 'text-medical-teal' : 'text-gray-500'
                }`}>
                  {paso.nombre}
                </p>
                {actual && (
                  <p className="text-xs text-muted-foreground">
                    En progreso - {diasInactivo > 0 ? `Hace ${diasInactivo} días` : 'Hoy'}
                  </p>
                )}
              </div>

              {completado && (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 shrink-0">
                  Completado
                </Badge>
              )}
              
              {actual && (
                <Badge className="bg-medical-teal shrink-0">
                  Actual
                </Badge>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Botón para continuar */}
      {progresoPorcentaje < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onContinuar}
            className="w-full bg-medical-teal hover:bg-medical-teal/90"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Continuar Registro
          </Button>
          
          {diasInactivo > 7 && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              ⚠️ Registro inactivo por {diasInactivo} días
            </p>
          )}
        </motion.div>
      )}

      {progresoPorcentaje === 100 && (
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-green-600">
            ¡Registro Completo!
          </p>
          <p className="text-xs text-green-600/80 mt-1">
            Listo para convertir a paciente
          </p>
        </div>
      )}
    </div>
  )
}
