"use client"

import { motion } from "framer-motion"
import { Shield, FileText, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function LegalNotices() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-8"
    >
      {/* Aviso: Normas Oficiales */}
      <Card className="border-2 border-green-500 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-900 mb-1">
                AVISO IMPORTANTE
              </h3>
              <p className="text-sm text-green-800">
                Este documento está realizado en base a las <strong>Normas Oficiales Mexicanas (NOM)</strong> 
                para el ejercicio de la práctica odontológica y el manejo de expedientes clínicos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aviso de Privacidad */}
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">
                AVISO DE PRIVACIDAD
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                Sus datos personales serán tratados conforme a la <strong>Ley Federal de Protección de Datos Personales</strong>. 
                La información proporcionada será utilizada exclusivamente para:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                <li>Elaboración de su expediente clínico</li>
                <li>Diagnóstico y tratamiento dental</li>
                <li>Seguimiento médico y citas</li>
                <li>Facturación y gestión de pagos</li>
              </ul>
              <p className="text-xs text-blue-700 mt-2">
                Sus datos están protegidos y no serán compartidos con terceros sin su consentimiento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nota de Consentimiento */}
      <Card className="border-2 border-amber-500 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-900">
                Al completar este formulario, usted acepta que la información proporcionada es <strong>verídica y completa</strong>, 
                y autoriza al personal médico de Dent's 23 a utilizarla para su atención dental.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
