"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { DollarSign, Calendar, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface NuevoPagoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
  pacienteNombre: string
  onSuccess?: () => void
}

export function NuevoPagoDialog({
  open,
  onOpenChange,
  pacienteId,
  pacienteNombre,
  onSuccess
}: NuevoPagoDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    monto: '',
    concepto: '',
    metodo_pago: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    estado: 'pagado',
    notas: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.monto || !formData.concepto || !formData.metodo_pago) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('pagos')
        .insert({
          paciente_id: pacienteId,
          monto: parseFloat(formData.monto),
          concepto: formData.concepto,
          metodo_pago: formData.metodo_pago,
          fecha_pago: formData.fecha_pago,
          estado: formData.estado,
          notas: formData.notas,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('✅ Pago registrado exitosamente')
      
      // Limpiar formulario
      setFormData({
        monto: '',
        concepto: '',
        metodo_pago: '',
        fecha_pago: new Date().toISOString().split('T')[0],
        estado: 'pagado',
        notas: ''
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error al registrar pago:', error)
      toast.error('❌ Error al registrar pago: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registrar pago para {pacienteNombre}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="monto">
                Monto *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="pl-10"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Fecha de Pago */}
            <div className="space-y-2">
              <Label htmlFor="fecha_pago">
                Fecha de Pago *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fecha_pago"
                  type="date"
                  value={formData.fecha_pago}
                  onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Concepto */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="concepto">
                Concepto *
              </Label>
              <Input
                id="concepto"
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                placeholder="Ej. Consulta general, Limpieza dental, Tratamiento..."
                required
              />
            </div>

            {/* Método de Pago */}
            <div className="space-y-2">
              <Label htmlFor="metodo_pago">
                Método de Pago *
              </Label>
              <Select
                value={formData.metodo_pago}
                onValueChange={(value) => setFormData({ ...formData, metodo_pago: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta_debito">Tarjeta de Débito</SelectItem>
                  <SelectItem value="tarjeta_credito">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado">
                Estado
              </Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="parcial">Pago Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">
              Notas / Observaciones
            </Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Agrega notas adicionales sobre el pago..."
              rows={3}
            />
          </div>

          {/* Resumen */}
          {formData.monto && (
            <div className="p-4 bg-medical-teal/10 rounded-lg border border-medical-teal/20">
              <p className="text-sm font-medium text-medical-teal">
                Total a registrar: ${parseFloat(formData.monto || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-medical-teal hover:bg-medical-teal/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrar Pago'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
