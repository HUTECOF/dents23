"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Stethoscope, DollarSign, Calendar, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface NuevoTratamientoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
  pacienteNombre: string
  onSuccess?: () => void
}

export function NuevoTratamientoDialog({
  open,
  onOpenChange,
  pacienteId,
  pacienteNombre,
  onSuccess
}: NuevoTratamientoDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    doctor_responsable: '',
    costo_estimado: '',
    fecha_inicio: '',
    fecha_estimada_fin: '',
    estado: 'planificado',
    sesiones_totales: '',
    notas: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.tipo || !formData.doctor_responsable) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('tratamientos')
        .insert({
          paciente_id: pacienteId,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          doctor_responsable: formData.doctor_responsable,
          costo_estimado: formData.costo_estimado ? parseFloat(formData.costo_estimado) : null,
          fecha_inicio: formData.fecha_inicio || null,
          fecha_estimada_fin: formData.fecha_estimada_fin || null,
          estado: formData.estado,
          sesiones_totales: formData.sesiones_totales ? parseInt(formData.sesiones_totales) : null,
          sesiones_completadas: 0,
          porcentaje_completado: 0,
          notas: formData.notas,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('✅ Tratamiento creado exitosamente')
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: '',
        doctor_responsable: '',
        costo_estimado: '',
        fecha_inicio: '',
        fecha_estimada_fin: '',
        estado: 'planificado',
        sesiones_totales: '',
        notas: ''
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error al crear tratamiento:', error)
      toast.error('❌ Error al crear tratamiento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Tratamiento</DialogTitle>
          <DialogDescription>
            Crear tratamiento para {pacienteNombre}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre del Tratamiento */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nombre">
                Nombre del Tratamiento *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Ortodoncia con brackets metálicos"
                required
              />
            </div>

            {/* Tipo de Tratamiento */}
            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo de Tratamiento *
              </Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ortodoncia">Ortodoncia</SelectItem>
                  <SelectItem value="Endodoncia">Endodoncia</SelectItem>
                  <SelectItem value="Implantes">Implantes Dentales</SelectItem>
                  <SelectItem value="Periodoncia">Periodoncia</SelectItem>
                  <SelectItem value="Cirugia">Cirugía Oral</SelectItem>
                  <SelectItem value="Estetica">Estética Dental</SelectItem>
                  <SelectItem value="Protesis">Prótesis</SelectItem>
                  <SelectItem value="Limpieza">Limpieza Profunda</SelectItem>
                  <SelectItem value="Blanqueamiento">Blanqueamiento</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Doctor Responsable */}
            <div className="space-y-2">
              <Label htmlFor="doctor_responsable">
                Doctor Responsable *
              </Label>
              <Select
                value={formData.doctor_responsable}
                onValueChange={(value) => setFormData({ ...formData, doctor_responsable: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. García">Dr. García</SelectItem>
                  <SelectItem value="Dra. Martínez">Dra. Martínez</SelectItem>
                  <SelectItem value="Dr. López">Dr. López</SelectItem>
                  <SelectItem value="Dra. Rodríguez">Dra. Rodríguez</SelectItem>
                  <SelectItem value="Dr. Hernández">Dr. Hernández</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Costo Estimado */}
            <div className="space-y-2">
              <Label htmlFor="costo_estimado">
                Costo Estimado
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="costo_estimado"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costo_estimado}
                  onChange={(e) => setFormData({ ...formData, costo_estimado: e.target.value })}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Sesiones Totales */}
            <div className="space-y-2">
              <Label htmlFor="sesiones_totales">
                Sesiones Totales
              </Label>
              <Input
                id="sesiones_totales"
                type="number"
                min="1"
                value={formData.sesiones_totales}
                onChange={(e) => setFormData({ ...formData, sesiones_totales: e.target.value })}
                placeholder="Ej. 12"
              />
            </div>

            {/* Fecha de Inicio */}
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">
                Fecha de Inicio
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Fecha Estimada de Fin */}
            <div className="space-y-2">
              <Label htmlFor="fecha_estimada_fin">
                Fecha Estimada de Fin
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fecha_estimada_fin"
                  type="date"
                  value={formData.fecha_estimada_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_estimada_fin: e.target.value })}
                  className="pl-10"
                  min={formData.fecha_inicio}
                />
              </div>
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
                  <SelectItem value="planificado">Planificado</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descripcion">
                Descripción del Tratamiento
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Describe el tratamiento, procedimientos, etc..."
                rows={3}
              />
            </div>

            {/* Notas */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notas">
                Notas / Observaciones
              </Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Agrega notas adicionales..."
                rows={2}
              />
            </div>
          </div>

          {/* Resumen */}
          {formData.costo_estimado && (
            <div className="p-4 bg-medical-teal/10 rounded-lg border border-medical-teal/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-medical-teal">
                  Costo Total Estimado:
                </p>
                <p className="text-lg font-bold text-medical-teal">
                  ${parseFloat(formData.costo_estimado || '0').toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </p>
              </div>
              {formData.sesiones_totales && (
                <p className="text-xs text-muted-foreground mt-1">
                  Aprox. ${(parseFloat(formData.costo_estimado) / parseInt(formData.sesiones_totales)).toLocaleString('es-MX', { minimumFractionDigits: 2 })} por sesión
                </p>
              )}
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
                  Creando...
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Crear Tratamiento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
