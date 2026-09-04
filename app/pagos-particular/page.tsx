"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Banknote, Calendar, CheckCircle2, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PagosParticular() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombrePaciente: "",
    montoTotal: "",
    montoPagado: "",
    metodoPago: "",
    numeroTransaccion: "",
    fechaPago: "",
    observaciones: ""
  })

  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async () => {
    // Validar campos requeridos
    if (!formData.nombrePaciente || !formData.montoTotal || !formData.metodoPago) {
      alert('⚠️ Por favor complete todos los campos requeridos.')
      return
    }

    // Guardar en localStorage
    localStorage.setItem('pagosParticular', JSON.stringify(formData))
    
    setEnviado(true)
    
    // Redirigir después de 2 segundos
    setTimeout(() => {
      router.push('/contrato')
    }, 2000)
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-900 mb-2">¡Información Guardada!</h2>
          <p className="text-lg text-gray-600">Redirigiendo al contrato...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white">
              <div className="flex items-center gap-3">
                <CreditCard className="w-10 h-10" />
                <div>
                  <CardTitle className="text-3xl">Pagos Particular</CardTitle>
                  <p className="text-orange-100 mt-1">Información de pago directo</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {/* Información del Paciente */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-6 h-6 text-orange-700" />
                  <h3 className="font-bold text-xl text-orange-900">Información del Paciente</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="nombrePaciente" className="text-orange-700 font-semibold">
                      Nombre del Paciente *
                    </Label>
                    <Input
                      id="nombrePaciente"
                      value={formData.nombrePaciente}
                      onChange={(e) => setFormData({...formData, nombrePaciente: e.target.value})}
                      placeholder="Nombre completo"
                      className="mt-2 border-orange-300"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Información del Pago */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Banknote className="w-6 h-6 text-yellow-700" />
                  <h3 className="font-bold text-xl text-yellow-900">Detalles del Pago</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="montoTotal" className="text-yellow-700 font-semibold">
                      Monto Total del Tratamiento *
                    </Label>
                    <Input
                      id="montoTotal"
                      type="number"
                      value={formData.montoTotal}
                      onChange={(e) => setFormData({...formData, montoTotal: e.target.value})}
                      placeholder="$0.00"
                      className="mt-2 border-yellow-300"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="montoPagado" className="text-yellow-700 font-semibold">
                      Monto Pagado (Anticipo)
                    </Label>
                    <Input
                      id="montoPagado"
                      type="number"
                      value={formData.montoPagado}
                      onChange={(e) => setFormData({...formData, montoPagado: e.target.value})}
                      placeholder="$0.00"
                      className="mt-2 border-yellow-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="metodoPago" className="text-yellow-700 font-semibold">
                      Método de Pago *
                    </Label>
                    <select
                      id="metodoPago"
                      value={formData.metodoPago}
                      onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
                      className="w-full mt-2 p-2 border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                      required
                    >
                      <option value="">Seleccione un método</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta_debito">Tarjeta de Débito</option>
                      <option value="tarjeta_credito">Tarjeta de Crédito</option>
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="deposito">Depósito Bancario</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="fechaPago" className="text-yellow-700 font-semibold">
                      Fecha de Pago
                    </Label>
                    <Input
                      id="fechaPago"
                      type="date"
                      value={formData.fechaPago}
                      onChange={(e) => setFormData({...formData, fechaPago: e.target.value})}
                      className="mt-2 border-yellow-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="numeroTransaccion" className="text-yellow-700 font-semibold">
                      Número de Transacción / Referencia
                    </Label>
                    <Input
                      id="numeroTransaccion"
                      value={formData.numeroTransaccion}
                      onChange={(e) => setFormData({...formData, numeroTransaccion: e.target.value})}
                      placeholder="Número de referencia o autorización"
                      className="mt-2 border-yellow-300"
                    />
                  </div>
                </div>
              </div>

              {/* Saldo Pendiente */}
              {formData.montoTotal && formData.montoPagado && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900">Saldo Pendiente:</span>
                    <span className="text-2xl font-bold text-blue-700">
                      ${(parseFloat(formData.montoTotal) - parseFloat(formData.montoPagado)).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Observaciones */}
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-6 h-6 text-gray-700" />
                  <h3 className="font-bold text-xl text-gray-900">Observaciones</h3>
                </div>

                <Label htmlFor="observaciones" className="text-gray-700 font-semibold">
                  Notas adicionales sobre el pago
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
              <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>💳 Formas de Pago Aceptadas:</strong> Efectivo, tarjetas de débito/crédito, 
                  transferencias y depósitos bancarios. Conserve su comprobante de pago para cualquier aclaración.
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
                  className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white"
                >
                  Guardar y Continuar →
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
