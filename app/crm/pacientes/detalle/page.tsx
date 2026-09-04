"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  FileText,
  Activity,
  Clock,
  Building2,
  CreditCard,
  Stethoscope,
  RefreshCw,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { NuevaCitaDialog } from "@/components/nueva-cita-dialog"
import { NuevoPagoDialog } from "@/components/nuevo-pago-dialog"
import { NuevoTratamientoDialog } from "@/components/nuevo-tratamiento-dialog"

function SiNoItem({ label, value, detail }: { label: string; value?: string; detail?: string }) {
  if (!value) return null
  const isYes = value === "si"
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
        <span className="text-sm">{label}</span>
        <Badge variant={isYes ? "destructive" : "secondary"}>
          {isYes ? "Sí" : "No"}
        </Badge>
      </div>
      {isYes && detail && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">{detail}</p>
        </div>
      )}
    </div>
  )
}

export default function PacienteDetallesPage() {
  const router = useRouter()
  const [pacienteId, setPacienteId] = useState<string>('')

  useEffect(() => {
    // Obtener ID de query params
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) {
      setPacienteId(id)
    }
  }, [])

  const [paciente, setPaciente] = useState<any>(null)
  const [historiaClinica, setHistoriaClinica] = useState<any>(null)
  const [contrato, setContrato] = useState<any>(null)
  const [consentimiento, setConsentimiento] = useState<any>(null)
  const [citas, setCitas] = useState<any[]>([])
  const [pagos, setPagos] = useState<any[]>([])
  const [tratamientos, setTratamientos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para los dialogs
  const [isCitaDialogOpen, setIsCitaDialogOpen] = useState(false)
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false)
  const [isTratamientoDialogOpen, setIsTratamientoDialogOpen] = useState(false)

  useEffect(() => {
    if (pacienteId) {
      fetchPacienteCompleto()
    }
  }, [pacienteId])

  const fetchPacienteCompleto = async () => {
    try {
      setLoading(true)

      // Obtener datos del paciente
      const { data: pacienteData, error: pacienteError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', pacienteId)
        .single()

      if (pacienteError) throw pacienteError
      setPaciente(pacienteData)

      // Obtener historia clínica
      if (pacienteData.historia_clinica_id) {
        const { data: historiaData } = await supabase
          .from('historias_clinicas')
          .select('*')
          .eq('id', pacienteData.historia_clinica_id)
          .single()
        
        setHistoriaClinica(
          historiaData
            ? { ...historiaData, ...(historiaData.datos_completos || {}) }
            : null
        )

        // Obtener contrato
        const { data: contratoData } = await supabase
          .from('contratos')
          .select('*')
          .eq('historia_clinica_id', pacienteData.historia_clinica_id)
          .single()
        
        setContrato(contratoData)

        // Obtener consentimiento
        const { data: consentimientoData } = await supabase
          .from('consentimientos')
          .select('*')
          .eq('historia_clinica_id', pacienteData.historia_clinica_id)
          .single()
        
        setConsentimiento(consentimientoData)
      }

      // Obtener citas
      const { data: citasData } = await supabase
        .from('citas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha_cita', { ascending: false })
      
      setCitas(citasData || [])

      // Obtener pagos
      const { data: pagosData } = await supabase
        .from('pagos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false })
      
      setPagos(pagosData || [])

      // Obtener tratamientos
      const { data: tratamientosData } = await supabase
        .from('tratamientos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false})
      
      setTratamientos(tratamientosData || [])

    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-medical-teal" />
      </div>
    )
  }

  if (!paciente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Paciente no encontrado</p>
          <Button onClick={() => router.push('/crm/pacientes')} className="mt-4">
            Volver a Pacientes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2 mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/crm/pacientes')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Pacientes
          </Button>
          <Link href="/">
            <Button 
              variant="outline" 
              size="sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Salir</span>
            </Button>
          </Link>
        </div>

        <Card className="bg-gradient-to-r from-medical-teal/10 to-cyan-50/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-medical-teal/20 flex items-center justify-center text-3xl font-bold text-medical-teal">
                {paciente.nombre_completo?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              {/* Info Principal */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{paciente.nombre_completo}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {paciente.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {paciente.telefono}
                    </div>
                  )}
                  {paciente.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {paciente.email}
                    </div>
                  )}
                  {paciente.edad && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {paciente.edad} años
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge className="bg-green-500/10 text-green-600 border-green-200">
                    {paciente.estado}
                  </Badge>
                  <Badge variant="outline">
                    Prioridad: {paciente.prioridad || 'Media'}
                  </Badge>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsCitaDialogOpen(true)}
                  className="bg-medical-teal hover:bg-medical-teal/90"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Nueva Cita
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con información */}
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="citas">Citas ({citas.length})</TabsTrigger>
            <TabsTrigger value="pagos">Pagos ({pagos.length})</TabsTrigger>
            <TabsTrigger value="tratamientos">Tratamientos ({tratamientos.length})</TabsTrigger>
            <TabsTrigger value="historia">Historia Clínica</TabsTrigger>
          </TabsList>

          {/* TAB: General */}
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información Personal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paciente.direccion && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Dirección</p>
                        <p className="text-sm text-muted-foreground">{paciente.direccion}</p>
                      </div>
                    </div>
                  )}
                  {paciente.sexo && (
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Sexo</p>
                        <p className="text-sm text-muted-foreground">{paciente.sexo}</p>
                      </div>
                    </div>
                  )}
                  {paciente.created_at && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Fecha de Registro</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(paciente.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información Laboral */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Información Laboral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paciente.empresa && (
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Empresa</p>
                        <p className="text-sm text-muted-foreground">{paciente.empresa}</p>
                      </div>
                    </div>
                  )}
                  {paciente.ocupacion && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Ocupación</p>
                        <p className="text-sm text-muted-foreground">{paciente.ocupacion}</p>
                      </div>
                    </div>
                  )}
                  {paciente.antiguedad && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Antigüedad</p>
                        <p className="text-sm text-muted-foreground">{paciente.antiguedad}</p>
                      </div>
                    </div>
                  )}
                  {paciente.ingreso_mensual && (
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Ingreso Mensual</p>
                        <p className="text-sm text-muted-foreground">
                          ${Number(paciente.ingreso_mensual).toLocaleString('es-MX')} MXN
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Información del Tratamiento (del Contrato) */}
            {contrato && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Información del Tratamiento
                  </CardTitle>
                  <CardDescription>Detalles del contrato y plan de pago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contrato.diagnostico && (
                      <div className="md:col-span-3 p-4 bg-blue-500/10 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-600 mb-1">Diagnóstico</p>
                        <p className="text-sm">{contrato.diagnostico}</p>
                      </div>
                    )}
                    {contrato.tratamiento && (
                      <div className="md:col-span-3 p-4 bg-medical-teal/10 border border-medical-teal/20 rounded-lg">
                        <p className="text-sm font-medium text-medical-teal mb-1">Tratamiento</p>
                        <p className="text-sm">{contrato.tratamiento}</p>
                      </div>
                    )}
                    {contrato.costo_total && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Costo Total</p>
                        <p className="text-lg font-bold text-medical-teal">${contrato.costo_total}</p>
                      </div>
                    )}
                    {contrato.pago_semanal && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pago Semanal</p>
                        <p className="text-sm">${contrato.pago_semanal}</p>
                      </div>
                    )}
                    {contrato.numero_semanas && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Número de Semanas</p>
                        <p className="text-sm">{contrato.numero_semanas} semanas</p>
                      </div>
                    )}
                    {contrato.numero_nomina && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Número de Nómina</p>
                        <p className="text-sm">{contrato.numero_nomina}</p>
                      </div>
                    )}
                    {contrato.area && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Área</p>
                        <p className="text-sm">{contrato.area}</p>
                      </div>
                    )}
                    {contrato.departamento && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Departamento</p>
                        <p className="text-sm">{contrato.departamento}</p>
                      </div>
                    )}
                  </div>

                  {/* Autorizaciones */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Autorizaciones</p>
                    <div className="flex flex-wrap gap-2">
                      {contrato.autoriza_deducciones && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-200">
                          ✓ Autoriza Deducciones
                        </Badge>
                      )}
                      {contrato.acepta_no_cancelacion && (
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
                          ✓ Acepta Política de No Cancelación
                        </Badge>
                      )}
                      {contrato.pago_efectivo && (
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                          💵 Pago en Efectivo
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Fecha de Firma */}
                  {contrato.fecha_firma && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Contrato firmado el {contrato.fecha_firma} en {contrato.ciudad_firma}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Información del Consentimiento */}
            {consentimiento && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Consentimiento Informado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {consentimiento.doctor_asignado && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Doctor Asignado</p>
                        <p className="text-sm">{consentimiento.doctor_asignado}</p>
                      </div>
                    )}
                    {consentimiento.procedimiento && (
                      <div className="md:col-span-2 p-4 bg-medical-teal/10 border border-medical-teal/20 rounded-lg">
                        <p className="text-sm font-medium text-medical-teal mb-1">Procedimiento</p>
                        <p className="text-sm">{consentimiento.procedimiento}</p>
                      </div>
                    )}
                    {consentimiento.representante_tutor && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Representante/Tutor</p>
                        <p className="text-sm">{consentimiento.representante_tutor}</p>
                      </div>
                    )}
                    {consentimiento.fecha_autorizacion && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha de Autorización</p>
                        <p className="text-sm">{consentimiento.fecha_autorizacion}</p>
                      </div>
                    )}
                  </div>

                  {/* Firma del Consentimiento */}
                  {consentimiento.firma_paciente && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Firma del Consentimiento</p>
                      <div className="border rounded-lg p-2 bg-white max-w-xs">
                        <img 
                          src={consentimiento.firma_paciente} 
                          alt="Firma Consentimiento" 
                          className="w-full h-24 object-contain"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Firmado por: {consentimiento.nombre_paciente_firma}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notas */}
            {paciente.notas && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {paciente.notas}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB: Citas */}
          <TabsContent value="citas">
            <Card>
              <CardHeader>
                <CardTitle>Citas Programadas</CardTitle>
                <CardDescription>Historial de citas del paciente</CardDescription>
              </CardHeader>
              <CardContent>
                {citas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay citas registradas</p>
                    <Button 
                      onClick={() => setIsCitaDialogOpen(true)}
                      className="mt-4 bg-medical-teal"
                    >
                      Agendar Primera Cita
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {citas.map((cita) => (
                      <div
                        key={cita.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{cita.tipo_cita}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(cita.fecha_cita).toLocaleDateString('es-MX')} - {cita.doctor}
                            </p>
                          </div>
                          <Badge>{cita.estado}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Pagos */}
          <TabsContent value="pagos">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
                <CardDescription>Pagos y planes de pago del paciente</CardDescription>
              </CardHeader>
              <CardContent>
                {pagos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay pagos registrados</p>
                    <Button 
                      onClick={() => setIsPagoDialogOpen(true)}
                      className="mt-4 bg-medical-teal"
                    >
                      Registrar Pago
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pagos.map((pago) => (
                      <div
                        key={pago.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{pago.concepto}</p>
                            <p className="text-sm text-muted-foreground">
                              ${Number(pago.monto).toLocaleString('es-MX')} MXN
                            </p>
                          </div>
                          <Badge>{pago.estado}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Tratamientos */}
          <TabsContent value="tratamientos">
            <Card>
              <CardHeader>
                <CardTitle>Tratamientos</CardTitle>
                <CardDescription>Tratamientos activos y completados</CardDescription>
              </CardHeader>
              <CardContent>
                {tratamientos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay tratamientos registrados</p>
                    <Button 
                      onClick={() => setIsTratamientoDialogOpen(true)}
                      className="mt-4 bg-medical-teal"
                    >
                      Crear Tratamiento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tratamientos.map((tratamiento) => (
                      <div
                        key={tratamiento.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{tratamiento.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              {tratamiento.descripcion}
                            </p>
                          </div>
                          <Badge>{tratamiento.estado}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Historia Clínica */}
          <TabsContent value="historia">
            <div className="space-y-4">
              {historiaClinica ? (
                <>
                  {/* Datos Personales */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Datos Personales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {historiaClinica.empresa && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Empresa</p>
                            <p className="text-sm">{historiaClinica.empresa}</p>
                          </div>
                        )}
                        {historiaClinica.antiguedad && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Antigüedad</p>
                            <p className="text-sm">{historiaClinica.antiguedad}</p>
                          </div>
                        )}
                        {historiaClinica.ocupacion && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Ocupación</p>
                            <p className="text-sm">{historiaClinica.ocupacion}</p>
                          </div>
                        )}
                        {historiaClinica.direccion && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                            <p className="text-sm">{historiaClinica.direccion}</p>
                          </div>
                        )}
                        {historiaClinica.edad && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Edad</p>
                            <p className="text-sm">{historiaClinica.edad} años</p>
                          </div>
                        )}
                        {historiaClinica.sexo && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Sexo</p>
                            <p className="text-sm capitalize">{historiaClinica.sexo}</p>
                          </div>
                        )}
                        {historiaClinica.recomendadoPor && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Recomendado por</p>
                            <p className="text-sm">{historiaClinica.recomendadoPor}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Antecedentes Personales */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Antecedentes Personales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Es alérgico a algún medicamento?</span>
                          <Badge variant={historiaClinica.alergico === 'si' ? 'destructive' : 'secondary'}>
                            {historiaClinica.alergico === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        {historiaClinica.alergico === 'si' && historiaClinica.alergicoCual && (
                          <div className="md:col-span-2 p-3 bg-red-500/10 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-600">Alergias:</p>
                            <p className="text-sm">{historiaClinica.alergicoCual}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Está en buen estado de salud?</span>
                          <Badge variant={historiaClinica.saludBuena === 'si' ? 'default' : 'secondary'}>
                            {historiaClinica.saludBuena === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Está bajo tratamiento médico?</span>
                          <Badge variant={historiaClinica.tratamientoMedico === 'si' ? 'default' : 'secondary'}>
                            {historiaClinica.tratamientoMedico === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        {historiaClinica.tratamientoMedico === 'si' && historiaClinica.tratamientoCual && (
                          <div className="md:col-span-2 p-3 bg-blue-500/10 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-600">Tratamiento:</p>
                            <p className="text-sm">{historiaClinica.tratamientoCual}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Toma algún medicamento?</span>
                          <Badge variant={historiaClinica.tomaMedicamento === 'si' ? 'default' : 'secondary'}>
                            {historiaClinica.tomaMedicamento === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        {historiaClinica.tomaMedicamento === 'si' && historiaClinica.medicamentoCual && (
                          <div className="md:col-span-2 p-3 bg-blue-500/10 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-600">Medicamentos:</p>
                            <p className="text-sm">{historiaClinica.medicamentoCual}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Ha sido hospitalizado?</span>
                          <Badge variant={historiaClinica.hospitalizado === 'si' ? 'default' : 'secondary'}>
                            {historiaClinica.hospitalizado === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        {historiaClinica.hospitalizado === 'si' && historiaClinica.hospitalizadoCual && (
                          <div className="md:col-span-2 p-3 bg-yellow-500/10 border border-yellow-200 rounded-lg">
                            <p className="text-sm font-medium text-yellow-600">Motivo:</p>
                            <p className="text-sm">{historiaClinica.hospitalizadoCual}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Sangra mucho al cortarse?</span>
                          <Badge variant={historiaClinica.sangraMucho === 'si' ? 'destructive' : 'secondary'}>
                            {historiaClinica.sangraMucho === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Padece alguna enfermedad?</span>
                          <Badge variant={historiaClinica.padeceEnfermedad === 'si' ? 'destructive' : 'secondary'}>
                            {historiaClinica.padeceEnfermedad === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>
                        {historiaClinica.padeceEnfermedad === 'si' && historiaClinica.enfermedadCual && (
                          <div className="md:col-span-2 p-3 bg-red-500/10 border border-red-200 rounded-lg">
                            <p className="text-sm font-medium text-red-600">Enfermedad:</p>
                            <p className="text-sm">{historiaClinica.enfermedadCual}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Historia Clínica Dental */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        Historia Clínica Dental
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Ha recibido tratamiento dental?</span>
                          <Badge variant={historiaClinica.tratamientoDental === 'si' ? 'default' : 'secondary'}>
                            {historiaClinica.tratamientoDental === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Tiene dolor dental actualmente?</span>
                          <Badge variant={historiaClinica.dolorDental === 'si' ? 'destructive' : 'secondary'}>
                            {historiaClinica.dolorDental === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Sangran sus encías?</span>
                          <Badge variant={historiaClinica.sangranEncias === 'si' ? 'destructive' : 'secondary'}>
                            {historiaClinica.sangranEncias === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Tiene dientes flojos?</span>
                          <Badge variant={historiaClinica.dientesFlojos === 'si' ? 'destructive' : 'secondary'}>
                            {historiaClinica.dientesFlojos === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Ha usado ortodoncia?</span>
                          <Badge variant={historiaClinica.ortodoncia === 'si' ? 'default' : 'secondary'}>
                            {historiaClinica.ortodoncia === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                          <span className="text-sm">¿Aprieta o rechina los dientes?</span>
                          <Badge variant={historiaClinica.apretarDientes === 'si' ? 'default' : 'secondary'}>
                            {historiaClinica.apretarDientes === 'si' ? 'Sí' : 'No'}
                          </Badge>
                        </div>

                        {historiaClinica.motivoConsulta && (
                          <div className="md:col-span-2 p-4 bg-medical-teal/10 border border-medical-teal/20 rounded-lg">
                            <p className="text-sm font-medium text-medical-teal mb-2">Motivo de Consulta:</p>
                            <p className="text-sm">{historiaClinica.motivoConsulta}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hábitos, Signos Vitales y Exploración */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Hábitos, Signos Vitales y Exploración
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SiNoItem label="Tabaquismo" value={historiaClinica.tabaquismo} detail={historiaClinica.tabaquismoFrecuencia} />
                        <SiNoItem label="Alcoholismo" value={historiaClinica.alcoholismo} detail={historiaClinica.alcoholismoFrecuencia} />
                        <SiNoItem label="Drogas" value={historiaClinica.drogas} detail={historiaClinica.drogasDetalles} />
                        <SiNoItem label="Mordida de uñas" value={historiaClinica.mordidaUnias} />
                        <SiNoItem label="Bruxismo" value={historiaClinica.bruxismo} />
                        <SiNoItem label="Morder objetos" value={historiaClinica.morderObjetos} />
                        <SiNoItem label="Succión labial" value={historiaClinica.succionLabial} />
                        <SiNoItem label="Succión digital" value={historiaClinica.succionDigital} />
                        <SiNoItem label="Respiración bucal" value={historiaClinica.respiracionBucal} />
                        <SiNoItem label="Lengua pendular" value={historiaClinica.linguaPendular} />
                        <SiNoItem label="Succión chupete" value={historiaClinica.succionChupete} />
                        <SiNoItem label="Usa hilo dental" value={historiaClinica.usaHiloDental} />
                        <SiNoItem label="Enjuague bucal" value={historiaClinica.enjuagueBucal} />
                        <SiNoItem label="Hipertrofia dental" value={historiaClinica.hipertrofiaDental} />
                        <SiNoItem label="Ingesta de carbohidratos" value={historiaClinica.ingestaAlimentosCarbohidratos} />
                      </div>

                      {historiaClinica.cepilladoDiario && (
                        <div className="p-3 bg-accent/50 rounded-lg">
                          <p className="text-sm font-medium">Cepillado diario</p>
                          <p className="text-sm text-muted-foreground">{historiaClinica.cepilladoDiario}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {historiaClinica.presionArterial && (
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">Presión arterial</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.presionArterial}</p>
                          </div>
                        )}
                        {historiaClinica.frecuenciaCardiaca && (
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">Frecuencia cardiaca</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.frecuenciaCardiaca}</p>
                          </div>
                        )}
                        {historiaClinica.frecuenciaRespiratoria && (
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">Frecuencia respiratoria</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.frecuenciaRespiratoria}</p>
                          </div>
                        )}
                        {historiaClinica.temperatura && (
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">Temperatura</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.temperatura}</p>
                          </div>
                        )}
                        {historiaClinica.peso && (
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">Peso</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.peso}</p>
                          </div>
                        )}
                        {historiaClinica.talla && (
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">Talla</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.talla}</p>
                          </div>
                        )}
                        {historiaClinica.imc && (
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">IMC</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.imc}</p>
                          </div>
                        )}
                        {historiaClinica.glucosa && (
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">Glucosa</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.glucosa}</p>
                          </div>
                        )}
                        {historiaClinica.oxigenacion && (
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">Oxigenación</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.oxigenacion}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {historiaClinica.facies && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Facies</p><p className="text-sm text-muted-foreground">{historiaClinica.facies}</p></div>}
                        {historiaClinica.simetriaFacial && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Simetría facial</p><p className="text-sm text-muted-foreground">{historiaClinica.simetriaFacial}</p></div>}
                        {historiaClinica.gangliosLinfaticos && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Ganglios linfáticos</p><p className="text-sm text-muted-foreground">{historiaClinica.gangliosLinfaticos}</p></div>}
                        {historiaClinica.atm && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">ATM</p><p className="text-sm text-muted-foreground">{historiaClinica.atm}</p></div>}
                        {historiaClinica.movilidadMandibular && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Movilidad mandibular</p><p className="text-sm text-muted-foreground">{historiaClinica.movilidadMandibular}</p></div>}
                        <SiNoItem label="Ruidos articulares" value={historiaClinica.ruidosArticulares} />
                        <SiNoItem label="Limitación de apertura" value={historiaClinica.limitacionApertura} />
                        <SiNoItem label="Dolor a la palpación" value={historiaClinica.dolorPalpacion} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {historiaClinica.labios && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Labios</p><p className="text-sm text-muted-foreground">{historiaClinica.labios}</p></div>}
                        {historiaClinica.mejillas && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Mejillas</p><p className="text-sm text-muted-foreground">{historiaClinica.mejillas}</p></div>}
                        {historiaClinica.encia && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Encía</p><p className="text-sm text-muted-foreground">{historiaClinica.encia}</p></div>}
                        {historiaClinica.paladar && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Paladar</p><p className="text-sm text-muted-foreground">{historiaClinica.paladar}</p></div>}
                        {historiaClinica.pisoBoca && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Piso de boca</p><p className="text-sm text-muted-foreground">{historiaClinica.pisoBoca}</p></div>}
                        {historiaClinica.lengua && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Lengua</p><p className="text-sm text-muted-foreground">{historiaClinica.lengua}</p></div>}
                        {historiaClinica.orofaringe && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Orofaringe</p><p className="text-sm text-muted-foreground">{historiaClinica.orofaringe}</p></div>}
                        {historiaClinica.salivacion && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Salivación</p><p className="text-sm text-muted-foreground">{historiaClinica.salivacion}</p></div>}
                        {historiaClinica.higieneBucalIntraoral && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Higiene bucal</p><p className="text-sm text-muted-foreground">{historiaClinica.higieneBucalIntraoral}</p></div>}
                        <SiNoItem label="Placa bacteriana" value={historiaClinica.placaBacteriana} />
                        <SiNoItem label="Sangrado de encías" value={historiaClinica.sangradoEncias} />
                        <SiNoItem label="Cálculos" value={historiaClinica.calculos} />
                        <SiNoItem label="Halitosis" value={historiaClinica.halitosis} />
                        {historiaClinica.malOclusion && <div className="p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Maloclusión</p><p className="text-sm text-muted-foreground">{historiaClinica.malOclusion}</p></div>}
                        <SiNoItem label="Diastemas" value={historiaClinica.diastemas} />
                        <SiNoItem label="Línea alba" value={historiaClinica.lineaAlba} />
                        <SiNoItem label="Mordida abierta" value={historiaClinica.mordidaAbierta} />
                        <SiNoItem label="Mordida cruzada" value={historiaClinica.mordidaCruzada} />
                        <SiNoItem label="Anodoncia" value={historiaClinica.anodoncia} />
                        <SiNoItem label="Supernumerarios" value={historiaClinica.supernumerarios} />
                        <SiNoItem label="Macroglosia" value={historiaClinica.macroglosia} />
                        <SiNoItem label="Frenillo lingual" value={historiaClinica.frenilloLingual} />
                        {historiaClinica.observacionesIntraoral && <div className="md:col-span-2 p-3 bg-accent/50 rounded-lg"><p className="text-sm font-medium">Observaciones intraoral</p><p className="text-sm text-muted-foreground">{historiaClinica.observacionesIntraoral}</p></div>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Periodontal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Periodontal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SiNoItem label="Sangrado al sondaje" value={historiaClinica.periodontalSangradoSondaje} />
                        <SiNoItem label="Bolsas periodontales" value={historiaClinica.periodontalBolsas} detail={historiaClinica.periodontalBolsasDetalles} />
                        <SiNoItem label="Retracción gingival" value={historiaClinica.periodontalRetraccionGingival} detail={historiaClinica.periodontalRetraccionGingivalDetalles} />
                        <SiNoItem label="Supuración" value={historiaClinica.periodontalSupuracion} detail={historiaClinica.periodontalSupuracionDetalles} />
                        <SiNoItem label="Movilidad dentaria" value={historiaClinica.periodontalMovilidad} detail={historiaClinica.periodontalMovilidadDetalles} />
                        <SiNoItem label="Furcas expuestas" value={historiaClinica.periodontalFurcas} detail={historiaClinica.periodontalFurcasDetalles} />
                        <SiNoItem label="Pérdida de inserción" value={historiaClinica.periodontalPerdidaInsercion} detail={historiaClinica.periodontalPerdidaInsercionDetalles} />
                        <SiNoItem label="Gingivitis" value={historiaClinica.periodontalGingivitis} />
                        <SiNoItem label="Periodontitis" value={historiaClinica.periodontalPeriodontitis} />
                        <SiNoItem label="Placa bacteriana visible" value={historiaClinica.periodontalPlaca} />
                        <SiNoItem label="Sarro/cálculo" value={historiaClinica.periodontalSarro} />
                        {historiaClinica.periodontalObservaciones && (
                          <div className="md:col-span-2 p-3 bg-accent/50 rounded-lg">
                            <p className="text-sm font-medium">Observaciones</p>
                            <p className="text-sm text-muted-foreground">{historiaClinica.periodontalObservaciones}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estudios Auxiliares */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Estudios Auxiliares
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SiNoItem label="Radiografías" value={historiaClinica.estudioRadiografia} detail={historiaClinica.estudioRadiografiaDetalles} />
                        <SiNoItem label="Modelo de estudio" value={historiaClinica.estudioModeloEstudio} detail={historiaClinica.estudioModeloEstudioDetalles} />
                        <SiNoItem label="Fotografía intraoral/extraoral" value={historiaClinica.estudioFotografia} detail={historiaClinica.estudioFotografiaDetalles} />
                        <SiNoItem label="Estudios de laboratorio" value={historiaClinica.estudioLaboratorio} detail={historiaClinica.estudioLaboratorioDetalles} />
                        <SiNoItem label="Otros estudios" value={historiaClinica.estudioOtro} detail={historiaClinica.estudioOtroDetalles} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Firma y Foto */}
                  {(historiaClinica.firmaResponsable || historiaClinica.ineResponsable || historiaClinica.firmaPaciente || historiaClinica.fotoPaciente) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Documentos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(historiaClinica.firmaResponsable || historiaClinica.firmaPaciente) && (
                            <div>
                              <p className="text-sm font-medium mb-2">Firma</p>
                              <div className="border rounded-lg p-2 bg-white">
                                <img 
                                  src={historiaClinica.firmaResponsable || historiaClinica.firmaPaciente} 
                                  alt="Firma" 
                                  className="w-full h-32 object-contain"
                                />
                              </div>
                            </div>
                          )}
                          {(historiaClinica.ineResponsable || historiaClinica.fotoPaciente) && (
                            <div>
                              <p className="text-sm font-medium mb-2">INE / Foto</p>
                              <div className="border rounded-lg p-2 bg-white">
                                <img 
                                  src={historiaClinica.ineResponsable || historiaClinica.fotoPaciente} 
                                  alt="Foto" 
                                  className="w-full h-32 object-cover rounded"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">No hay historia clínica disponible</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {paciente && (
        <>
          <NuevaCitaDialog
            open={isCitaDialogOpen}
            onOpenChange={setIsCitaDialogOpen}
            pacienteId={paciente.id}
            pacienteNombre={paciente.nombre_completo}
            onSuccess={fetchPacienteCompleto}
          />

          <NuevoPagoDialog
            open={isPagoDialogOpen}
            onOpenChange={setIsPagoDialogOpen}
            pacienteId={paciente.id}
            pacienteNombre={paciente.nombre_completo}
            onSuccess={fetchPacienteCompleto}
          />

          <NuevoTratamientoDialog
            open={isTratamientoDialogOpen}
            onOpenChange={setIsTratamientoDialogOpen}
            pacienteId={paciente.id}
            pacienteNombre={paciente.nombre_completo}
            onSuccess={fetchPacienteCompleto}
          />
        </>
      )}
    </div>
  )
}
