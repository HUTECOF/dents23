"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Landmark, User, CreditCard, FileText, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FinanciamientoBancario() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    identificacion: "",
    ingresosMensuales: "",
    montoSolicitado: "",
    plazo: "",
    banco: "",
    numeroCuenta: "",
    referencias: "",
    observaciones: ""
  })

  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async () => {
    // Validar campos requeridos
    if (!formData.nombreCompleto || !formData.identificacion || !formData.montoSolicitado) {
      alert('⚠️ Por favor complete todos los campos requeridos.')
      return
    }

    // Guardar en localStorage
    localStorage.setItem('financiamientoBancario', JSON.stringify(formData))
    
    setEnviado(true)
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      router.push('/contrato')
    }, 2000)
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-900 mb-2">¡Solicitud Enviada!</h2>
          <p className="text-lg text-gray-600">Redirigiendo al contrato...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <Landmark className="w-10 h-10" />
                <div>
                  <CardTitle className="text-3xl">Financiamiento Bancario</CardTitle>
                  <p className="text-purple-100 mt-1">Complete la información para su solicitud de crédito</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {/* Información del Solicitante */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-6 h-6 text-purple-700" />
                  <h3 className="font-bold text-xl text-purple-900">Información del Solicitante</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombreCompleto" className="text-purple-700 font-semibold">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="nombreCompleto"
                      value={formData.nombreCompleto}
                      onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                      placeholder="Nombre completo del solicitante"
                      className="mt-2 border-purple-300"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="identificacion" className="text-purple-700 font-semibold">
                      Identificación Oficial *
                    </Label>
                    <Input
                      id="identificacion"
                      value={formData.identificacion}
                      onChange={(e) => setFormData({...formData, identificacion: e.target.value})}
                      placeholder="INE, Pasaporte, etc."
                      className="mt-2 border-purple-300"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ingresosMensuales" className="text-purple-700 font-semibold">
                      Ingresos Mensuales
                    </Label>
                    <Input
                      id="ingresosMensuales"
                      type="number"
                      value={formData.ingresosMensuales}
                      onChange={(e) => setFormData({...formData, ingresosMensuales: e.target.value})}
                      placeholder="$0.00"
                      className="mt-2 border-purple-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="referencias" className="text-purple-700 font-semibold">
                      Referencias Personales
                    </Label>
                    <Input
                      id="referencias"
                      value={formData.referencias}
                      onChange={(e) => setFormData({...formData, referencias: e.target.value})}
                      placeholder="Nombres y teléfonos"
                      className="mt-2 border-purple-300"
                    />
                  </div>
                </div>
              </div>

              {/* Información del Crédito */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-6 h-6 text-blue-700" />
                  <h3 className="font-bold text-xl text-blue-900">Información del Crédito</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="montoSolicitado" className="text-blue-700 font-semibold">
                      Monto Solicitado *
                    </Label>
                    <Input
                      id="montoSolicitado"
                      type="number"
                      value={formData.montoSolicitado}
                      onChange={(e) => setFormData({...formData, montoSolicitado: e.target.value})}
                      placeholder="$0.00"
                      className="mt-2 border-blue-300"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="plazo" className="text-blue-700 font-semibold">
                      Plazo (meses)
                    </Label>
                    <Input
                      id="plazo"
                      type="number"
                      value={formData.plazo}
                      onChange={(e) => setFormData({...formData, plazo: e.target.value})}
                      placeholder="12, 24, 36..."
                      className="mt-2 border-blue-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="banco" className="text-blue-700 font-semibold">
                      Banco Preferido
                    </Label>
                    <Input
                      id="banco"
                      value={formData.banco}
                      onChange={(e) => setFormData({...formData, banco: e.target.value})}
                      placeholder="Nombre del banco"
                      className="mt-2 border-blue-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numeroCuenta" className="text-blue-700 font-semibold">
                      Número de Cuenta
                    </Label>
                    <Input
                      id="numeroCuenta"
                      value={formData.numeroCuenta}
                      onChange={(e) => setFormData({...formData, numeroCuenta: e.target.value})}
                      placeholder="Cuenta bancaria"
                      className="mt-2 border-blue-300"
                    />
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-6 h-6 text-gray-700" />
                  <h3 className="font-bold text-xl text-gray-900">Observaciones Adicionales</h3>
                </div>

                <Label htmlFor="observaciones" className="text-gray-700 font-semibold">
                  Comentarios o información adicional
                </Label>
                <textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  placeholder="Escriba cualquier información adicional relevante..."
                  className="w-full mt-2 p-3 border-2 border-gray-300 rounded-lg min-h-[100px] focus:border-gray-500 focus:outline-none"
                />
              </div>

              {/* Información Importante */}
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>📋 Documentos Requeridos:</strong> Identificación oficial, comprobante de ingresos, 
                  comprobante de domicilio, referencias personales. El banco se pondrá en contacto con usted 
                  para completar el proceso de solicitud.
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  ← Regresar
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  Enviar Solicitud →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
