"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Calendar, Clock, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface NuevaCitaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
  pacienteNombre: string
  onSuccess?: () => void
}

export function NuevaCitaDialog({
  open,
  onOpenChange,
  pacienteId,
  pacienteNombre,
  onSuccess
}: NuevaCitaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fecha_cita: '',
    hora_cita: '',
    tipo_cita: '',
    doctor: '',
    duracion_minutos: '30',
    notas: '',
    estado: 'programada'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fecha_cita || !formData.hora_cita || !formData.tipo_cita || !formData.doctor) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)

      // Combinar fecha y hora
      const fechaHora = `${formData.fecha_cita}T${formData.hora_cita}:00`

      const { error } = await supabase
        .from('citas')
        .insert({
          paciente_id: pacienteId,
          fecha_cita: fechaHora,
          tipo_cita: formData.tipo_cita,
          doctor: formData.doctor,
          duracion_minutos: parseInt(formData.duracion_minutos),
          notas: formData.notas,
          estado: formData.estado,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('✅ Cita agendada exitosamente')
      
      // Limpiar formulario
      setFormData({
        fecha_cita: '',
        hora_cita: '',
        tipo_cita: '',
        doctor: '',
        duracion_minutos: '30',
        notas: '',
        estado: 'programada'
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error al crear cita:', error)
      toast.error('❌ Error al agendar cita: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
          <DialogDescription>
            Agendar cita para {pacienteNombre}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha_cita">
                Fecha de la Cita *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fecha_cita"
                  type="date"
                  value={formData.fecha_cita}
                  onChange={(e) => setFormData({ ...formData, fecha_cita: e.target.value })}
                  className="pl-10"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <Label htmlFor="hora_cita">
                Hora *
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="hora_cita"
                  type="time"
                  value={formData.hora_cita}
                  onChange={(e) => setFormData({ ...formData, hora_cita: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Tipo de Cita */}
            <div className="space-y-2">
              <Label htmlFor="tipo_cita">
                Tipo de Cita *
              </Label>
              <Select
                value={formData.tipo_cita}
                onValueChange={(value) => setFormData({ ...formData, tipo_cita: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consulta General">Consulta General</SelectItem>
                  <SelectItem value="Limpieza Dental">Limpieza Dental</SelectItem>
                  <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                  <SelectItem value="Revisión">Revisión</SelectItem>
                  <SelectItem value="Urgencia">Urgencia</SelectItem>
                  <SelectItem value="Ortodoncia">Ortodoncia</SelectItem>
                  <SelectItem value="Endodoncia">Endodoncia</SelectItem>
                  <SelectItem value="Extracción">Extracción</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Doctor */}
            <div className="space-y-2">
              <Label htmlFor="doctor">
                Doctor Asignado *
              </Label>
              <Select
                value={formData.doctor}
                onValueChange={(value) => setFormData({ ...formData, doctor: value })}
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

            {/* Duración */}
            <div className="space-y-2">
              <Label htmlFor="duracion">
                Duración (minutos)
              </Label>
              <Select
                value={formData.duracion_minutos}
                onValueChange={(value) => setFormData({ ...formData, duracion_minutos: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1.5 horas</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
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
                  <SelectItem value="programada">Programada</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="en_espera">En Espera</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">
              Notas / Motivo de la Cita
            </Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Agrega notas o el motivo de la cita..."
              rows={3}
            />
          </div>

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
                  Agendando...
                </>
              ) : (
                'Agendar Cita'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
