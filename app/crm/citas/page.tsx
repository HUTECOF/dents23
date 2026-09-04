"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { citasHelpers, seguimientosHelpers } from "@/lib/crm-helpers"
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Clock,
  User,
  Stethoscope,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  CalendarIcon,
  RefreshCw,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { isAuthenticated, logout } from "@/lib/auth-helpers"

interface Cita {
  id: number
  paciente_id: number
  paciente_nombre: string
  fecha_cita: string
  tipo_cita: string
  estado: string
  doctor: string
  notas?: string
  fecha_creacion: string
}

interface Seguimiento {
  id: number
  paciente_id: number
  paciente_nombre: string
  tipo: string
  descripcion: string
  fecha_seguimiento: string
  usuario: string
  prioridad: string
}

export default function CitasPage() {
  const router = useRouter()
  const [citas, setCitas] = useState<any[]>([])
  const [seguimientos, setSeguimientos] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [selectedView, setSelectedView] = useState("citas")
  const [selectedCita, setSelectedCita] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isNewCitaDialogOpen, setIsNewCitaDialogOpen] = useState(false)
  const [isCompletarCitaOpen, setIsCompletarCitaOpen] = useState(false)
  const [isExpedienteOpen, setIsExpedienteOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pacientes, setPacientes] = useState<any[]>([])

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/crm/login')
    }
  }, [])
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<any | null>(null)
  const [notasSeguimiento, setNotasSeguimiento] = useState('')
  const [diagnostico, setDiagnostico] = useState('')
  const [tratamientoRealizado, setTratamientoRealizado] = useState('')
  const [editandoPaciente, setEditandoPaciente] = useState(false)
  const [datosEditPaciente, setDatosEditPaciente] = useState({
    nombre_completo: '',
    telefono: '',
    email: '',
    prioridad: '',
    estado: '',
    notas: ''
  })
  const [isNuevoSeguimientoOpen, setIsNuevoSeguimientoOpen] = useState(false)
  const [nuevaSeguimientoData, setNuevaSeguimientoData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'nota',
    prioridad: 'media'
  })
  const [editFormData, setEditFormData] = useState({
    paciente_id: '',
    doctor: '',
    fecha_cita: '',
    tipo_cita: '',
    estado: '',
    notas: ''
  })

  // Cargar datos desde Supabase
  const fetchData = async () => {
    try {
      setLoading(true)

      // Obtener citas con información del paciente
      const { data: citasData } = await supabase
        .from('citas')
        .select(`
          *,
          paciente:pacientes(
            id,
            nombre_completo,
            telefono,
            email,
            historia_clinica_id
          )
        `)
        .order('fecha_cita', { ascending: false })

      setCitas(citasData || [])

      // Obtener seguimientos
      const { data: seguimientosData } = await supabase
        .from('seguimientos')
        .select(`
          *,
          paciente:pacientes(nombre_completo)
        `)
        .order('fecha_seguimiento', { ascending: false })

      setSeguimientos(seguimientosData || [])

      // Obtener lista de pacientes para el formulario
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select('id, nombre_completo, telefono, email, historia_clinica_id')
        .order('nombre_completo')

      setPacientes(pacientesData || [])
    } catch (err: any) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Completar cita y generar seguimiento
  const handleCompletarCita = async () => {
    if (!selectedCita) return

    try {
      setLoading(true)

      console.log('Completando cita:', selectedCita)
      console.log('Datos:', { diagnostico, tratamientoRealizado, notasSeguimiento })

      // Actualizar estado de la cita
      const { data: citaData, error: citaError } = await supabase
        .from('citas')
        .update({
          estado: 'completada',
          notas: `${selectedCita.notas || ''}\n\nDiagnóstico: ${diagnostico}\nTratamiento: ${tratamientoRealizado}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCita.id)
        .select()

      if (citaError) {
        console.error('Error al actualizar cita:', citaError)
        throw citaError
      }

      console.log('Cita actualizada:', citaData)

      // Crear seguimiento automático
      const seguimientoData = {
        paciente_id: selectedCita.paciente_id,
        tipo: 'consulta',
        titulo: `Seguimiento - ${selectedCita.tipo_cita}`,
        descripcion: `Diagnóstico: ${diagnostico}\n\nTratamiento Realizado: ${tratamientoRealizado}\n\nNotas: ${notasSeguimiento}`,
        fecha_seguimiento: new Date().toISOString(),
        prioridad: 'media',
        asignado_a: selectedCita.doctor,
        resultado: tratamientoRealizado,
        notas: notasSeguimiento,
        completado: true,
        fecha_completado: new Date().toISOString(),
        created_by: selectedCita.doctor
      }

      console.log('Insertando seguimiento:', seguimientoData)

      const { data: segData, error: seguimientoError } = await supabase
        .from('seguimientos')
        .insert(seguimientoData)
        .select()

      if (seguimientoError) {
        console.error('Error al crear seguimiento:', seguimientoError)
        throw seguimientoError
      }

      console.log('Seguimiento creado:', segData)

      toast.success('✅ Cita completada y seguimiento generado')
      setIsCompletarCitaOpen(false)
      setNotasSeguimiento('')
      setDiagnostico('')
      setTratamientoRealizado('')
      fetchData()
    } catch (err: any) {
      console.error('Error completo:', err)
      toast.error(`❌ Error al completar cita: ${err.message || 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo seguimiento/nota
  const handleCrearSeguimiento = async () => {
    if (!pacienteSeleccionado) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from('seguimientos')
        .insert({
          paciente_id: pacienteSeleccionado.id,
          tipo: nuevaSeguimientoData.tipo,
          titulo: nuevaSeguimientoData.titulo,
          descripcion: nuevaSeguimientoData.descripcion,
          fecha_seguimiento: new Date().toISOString(),
          prioridad: nuevaSeguimientoData.prioridad,
          completado: false,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('✅ Nota/Seguimiento agregado exitosamente')
      setIsNuevoSeguimientoOpen(false)
      setNuevaSeguimientoData({
        titulo: '',
        descripcion: '',
        tipo: 'nota',
        prioridad: 'media'
      })
      
      // Recargar expediente
      handleAbrirExpediente(pacienteSeleccionado)
    } catch (err: any) {
      console.error('Error:', err)
      toast.error('❌ Error al agregar seguimiento')
    } finally {
      setLoading(false)
    }
  }

  // Guardar cambios del paciente
  const handleGuardarPaciente = async () => {
    if (!pacienteSeleccionado) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from('pacientes')
        .update({
          nombre_completo: datosEditPaciente.nombre_completo,
          telefono: datosEditPaciente.telefono,
          email: datosEditPaciente.email,
          prioridad: datosEditPaciente.prioridad,
          estado: datosEditPaciente.estado,
          notas: datosEditPaciente.notas,
          updated_at: new Date().toISOString()
        })
        .eq('id', pacienteSeleccionado.id)

      if (error) throw error

      toast.success('✅ Información del paciente actualizada')
      setEditandoPaciente(false)
      
      // Recargar expediente
      handleAbrirExpediente({...pacienteSeleccionado, ...datosEditPaciente})
    } catch (err: any) {
      console.error('Error:', err)
      toast.error('❌ Error al actualizar paciente')
    } finally {
      setLoading(false)
    }
  }

  // Abrir expediente del paciente
  const handleAbrirExpediente = async (paciente: any) => {
    try {
      setLoading(true)
      setPacienteSeleccionado(paciente)

      // Obtener historia clínica
      if (paciente.historia_clinica_id) {
        const { data: historiaData } = await supabase
          .from('historias_clinicas')
          .select('*')
          .eq('id', paciente.historia_clinica_id)
          .single()

        if (historiaData) {
          setPacienteSeleccionado({
            ...paciente,
            historia_clinica: historiaData
          })
        }
      }

      // Obtener citas del paciente
      const { data: citasData } = await supabase
        .from('citas')
        .select('*')
        .eq('paciente_id', paciente.id)
        .order('fecha_cita', { ascending: false })

      // Obtener seguimientos del paciente
      const { data: seguimientosData } = await supabase
        .from('seguimientos')
        .select('*')
        .eq('paciente_id', paciente.id)
        .order('fecha_seguimiento', { ascending: false })

      setPacienteSeleccionado((prev: any) => ({
        ...prev,
        citas: citasData || [],
        seguimientos: seguimientosData || []
      }))

      setIsExpedienteOpen(true)
    } catch (err: any) {
      console.error('Error:', err)
      toast.error('❌ Error al abrir expediente')
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos y suscribirse a cambios
  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('citas-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'citas' },
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seguimientos' },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedView])


  const getEstadoBadge = (estado: string) => {
    const variants = {
      programada: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      completada: "bg-green-500/10 text-green-400 border-green-500/20",
      cancelada: "bg-red-500/10 text-red-400 border-red-500/20",
      "en-proceso": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    }

    return variants[estado as keyof typeof variants] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }

  const getPrioridadBadge = (prioridad: string) => {
    const variants = {
      alta: "bg-red-500/10 text-red-400 border-red-500/20",
      media: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      baja: "bg-green-500/10 text-green-400 border-green-500/20",
    }

    return variants[prioridad as keyof typeof variants] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "programada":
        return <AlertCircle className="w-4 h-4" />
      case "completada":
        return <CheckCircle className="w-4 h-4" />
      case "cancelada":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const filteredCitas = citas.filter((cita) => {
    const nombrePaciente = cita.paciente?.nombre_completo || cita.paciente_nombre || ''
    const matchesSearch =
      nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.tipo_cita?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterEstado === "todos" || cita.estado === filterEstado

    return matchesSearch && matchesFilter
  })

  const filteredSeguimientos = seguimientos.filter((seguimiento) => {
    const nombrePaciente = seguimiento.paciente?.nombre_completo || seguimiento.paciente_nombre || ''
    const matchesSearch =
      nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguimiento.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguimiento.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seguimiento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Calcular stats
  const statsData = selectedView === 'citas' ? [
    {
      title: "Total Citas",
      value: citas.length,
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      title: "Programadas",
      value: citas.filter((c) => c.estado === "programada").length,
      icon: AlertCircle,
      color: "text-blue-400",
    },
    {
      title: "Completadas",
      value: citas.filter((c) => c.estado === "completada").length,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      title: "Canceladas",
      value: citas.filter((c) => c.estado === "cancelada").length,
      icon: XCircle,
      color: "text-red-400",
    },
  ] : [
    {
      title: "Total Seguimientos",
      value: seguimientos.length,
      icon: Clock,
      color: "text-purple-400",
    },
    {
      title: "Alta Prioridad",
      value: seguimientos.filter((s) => s.prioridad === "alta").length,
      icon: AlertCircle,
      color: "text-red-400",
    },
    {
      title: "Media Prioridad",
      value: seguimientos.filter((s) => s.prioridad === "media").length,
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      title: "Baja Prioridad",
      value: seguimientos.filter((s) => s.prioridad === "baja").length,
      icon: CheckCircle,
      color: "text-green-400",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex flex-col gap-3 px-4 sm:px-6 py-3 sm:py-0 sm:flex-row sm:h-16 sm:items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/crm">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Volver</span>
              </Button>
            </Link>
            <div className="p-2 rounded-lg bg-medical-teal/10">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-medical-teal" />
            </div>
            <div className="flex-1 sm:flex-none">
              <h1 className="text-lg sm:text-xl font-semibold">Citas y Seguimiento</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Gestión de citas médicas y seguimientos</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1">
              <Button
                variant={selectedView === "citas" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView("citas")}
                className={`flex-1 sm:flex-none ${selectedView === "citas" ? "bg-medical-teal hover:bg-medical-teal/90" : ""}`}
              >
                <CalendarIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Citas</span>
              </Button>
              <Button
                variant={selectedView === "seguimientos" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView("seguimientos")}
                className={`flex-1 sm:flex-none ${selectedView === "seguimientos" ? "bg-medical-teal hover:bg-medical-teal/90" : ""}`}
              >
                <Clock className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Seguimientos</span>
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={selectedView === "citas" ? "Buscar..." : "Buscar..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-background/50"
                />
              </div>

              {selectedView === "citas" && (
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger className="w-24 sm:w-40">
                    <Filter className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline"><SelectValue /></span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="en-proceso">En Proceso</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <Link href="/">
              <Button 
                variant="outline" 
                size="sm"
                className="shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Salir</span>
              </Button>
            </Link>

            <Button 
              onClick={() => setIsNewCitaDialogOpen(true)}
              className="bg-medical-teal hover:bg-medical-teal/90 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{selectedView === "citas" ? "Nueva Cita" : "Nuevo Seguimiento"}</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Lista Principal */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{selectedView === "citas" ? "Lista de Citas" : "Lista de Seguimientos"}</CardTitle>
            <CardDescription>
              {selectedView === "citas"
                ? `${filteredCitas.length} citas encontradas`
                : `${filteredSeguimientos.length} seguimientos encontrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-medical-teal" />
                <span className="ml-3 text-muted-foreground">Cargando...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedView === "citas"
                  ? filteredCitas.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No hay citas</p>
                        {searchTerm && <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>}
                      </div>
                    ) : (
                      filteredCitas.map((cita, index) => {
                        const nombrePaciente = cita.paciente?.nombre_completo || cita.paciente_nombre || 'Paciente'
                        return (
                          <motion.div
                            key={cita.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-background/30 border border-border/50 hover:bg-background/50 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-medical-teal/10 flex items-center justify-center">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-medical-teal" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{nombrePaciente}</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-xs sm:text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1 truncate">
                                    <Clock className="w-3 h-3 shrink-0" />
                                    {new Date(cita.fecha_cita).toLocaleDateString("es-ES")} -{" "}
                                    {new Date(cita.fecha_cita).toLocaleTimeString("es-ES", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1 truncate">
                                    <Stethoscope className="w-3 h-3 shrink-0" />
                                    {cita.doctor}
                                  </span>
                                  <span className="flex items-center gap-1 truncate">
                                    <User className="w-3 h-3 shrink-0" />
                                    {cita.tipo_cita}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start">
                              <Badge className={getEstadoBadge(cita.estado)}>
                                {getEstadoIcon(cita.estado)}
                                <span className="ml-1 text-xs">{cita.estado}</span>
                              </Badge>
                              
                              {/* Botón Ver Expediente */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAbrirExpediente(cita.paciente)}
                                className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-400"
                                title="Ver expediente completo"
                              >
                                <User className="w-4 h-4" />
                              </Button>

                              {/* Botón Completar Cita (solo si está programada o en-proceso) */}
                              {(cita.estado === 'programada' || cita.estado === 'en-proceso') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCita(cita)
                                    setIsCompletarCitaOpen(true)
                                  }}
                                  className="bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-400"
                                  title="Completar cita y generar seguimiento"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCita(cita)
                                  setEditFormData({
                                    paciente_id: cita.paciente_id || '',
                                    doctor: cita.doctor || '',
                                    fecha_cita: new Date(cita.fecha_cita).toISOString().slice(0, 16),
                                    tipo_cita: cita.tipo_cita || '',
                                    estado: cita.estado || '',
                                    notas: cita.notas || ''
                                  })
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        )
                      })
                    )
                : filteredSeguimientos.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">No hay seguimientos</p>
                      {searchTerm && <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>}
                    </div>
                  ) : (
                    filteredSeguimientos.map((seguimiento, index) => {
                      const nombrePaciente = seguimiento.paciente?.nombre_completo || seguimiento.paciente_nombre || 'Paciente'
                      return (
                        <motion.div
                          key={seguimiento.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-background/30 border border-border/50 hover:bg-background/50 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-medical-teal/10 flex items-center justify-center">
                              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-medical-teal" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{nombrePaciente}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{seguimiento.descripcion || seguimiento.titulo}</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-xs text-muted-foreground mt-2">
                                <span className="flex items-center gap-1 truncate">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  {new Date(seguimiento.fecha_seguimiento).toLocaleDateString("es-ES")}
                                </span>
                                <span className="flex items-center gap-1 truncate">
                                  <User className="w-3 h-3 shrink-0" />
                                  {seguimiento.asignado_a || seguimiento.usuario || 'Sin asignar'}
                                </span>
                                <span className="capitalize truncate">{seguimiento.tipo}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start">
                            <Badge className={getPrioridadBadge(seguimiento.prioridad)}>{seguimiento.prioridad}</Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Editar Cita */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cita</DialogTitle>
            <DialogDescription>Actualizar información de la cita médica</DialogDescription>
          </DialogHeader>

          {selectedCita && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paciente">Paciente</Label>
                  <Input
                    id="paciente"
                    defaultValue={selectedCita.paciente?.nombre_completo || selectedCita.paciente_nombre}
                    className="bg-background/50"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  <Input 
                    id="doctor" 
                    value={editFormData.doctor}
                    onChange={(e) => setEditFormData({...editFormData, doctor: e.target.value})}
                    className="bg-background/50" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha">Fecha y Hora</Label>
                  <Input
                    id="fecha"
                    type="datetime-local"
                    value={editFormData.fecha_cita}
                    onChange={(e) => setEditFormData({...editFormData, fecha_cita: e.target.value})}
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo de Cita</Label>
                  <Select 
                    value={editFormData.tipo_cita}
                    onValueChange={(value) => setEditFormData({...editFormData, tipo_cita: value})}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consulta General">Consulta General</SelectItem>
                      <SelectItem value="Limpieza Dental">Limpieza Dental</SelectItem>
                      <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                      <SelectItem value="Revisión">Revisión</SelectItem>
                      <SelectItem value="Urgencia">Urgencia</SelectItem>
                      <SelectItem value="Ortodoncia">Ortodoncia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={editFormData.estado}
                  onValueChange={(value) => setEditFormData({...editFormData, estado: value})}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="en-proceso">En Proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea 
                  id="notas" 
                  value={editFormData.notas}
                  onChange={(e) => setEditFormData({...editFormData, notas: e.target.value})}
                  className="bg-background/50" 
                  rows={3} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('citas')
                        .update({
                          doctor: editFormData.doctor,
                          fecha_cita: editFormData.fecha_cita,
                          tipo_cita: editFormData.tipo_cita,
                          estado: editFormData.estado,
                          notas: editFormData.notas,
                          updated_at: new Date().toISOString()
                        })
                        .eq('id', selectedCita.id)

                      if (error) throw error

                      setIsEditDialogOpen(false)
                      fetchData()
                    } catch (error) {
                      console.error('Error:', error)
                    }
                  }}
                  className="bg-medical-teal hover:bg-medical-teal/90"
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nueva Cita */}
      <Dialog open={isNewCitaDialogOpen} onOpenChange={setIsNewCitaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Cita</DialogTitle>
            <DialogDescription>Agendar una nueva cita médica</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-paciente">Paciente *</Label>
                <Select 
                  value={editFormData.paciente_id}
                  onValueChange={(value) => setEditFormData({...editFormData, paciente_id: value})}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecciona un paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id}>
                        {paciente.nombre_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-doctor">Doctor *</Label>
                <Select 
                  value={editFormData.doctor}
                  onValueChange={(value) => setEditFormData({...editFormData, doctor: value})}
                >
                  <SelectTrigger className="bg-background/50">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-fecha">Fecha y Hora *</Label>
                <Input
                  id="new-fecha"
                  type="datetime-local"
                  value={editFormData.fecha_cita}
                  onChange={(e) => setEditFormData({...editFormData, fecha_cita: e.target.value})}
                  className="bg-background/50"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <Label htmlFor="new-tipo">Tipo de Cita *</Label>
                <Select 
                  value={editFormData.tipo_cita}
                  onValueChange={(value) => setEditFormData({...editFormData, tipo_cita: value})}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Tipo de cita" />
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
            </div>

            <div>
              <Label htmlFor="new-notas">Notas / Motivo de la Cita</Label>
              <Textarea 
                id="new-notas" 
                value={editFormData.notas}
                onChange={(e) => setEditFormData({...editFormData, notas: e.target.value})}
                className="bg-background/50" 
                rows={3}
                placeholder="Agrega notas o el motivo de la cita..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsNewCitaDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    if (!editFormData.paciente_id || !editFormData.doctor || !editFormData.fecha_cita || !editFormData.tipo_cita) {
                      alert('Por favor completa todos los campos requeridos')
                      return
                    }

                    const { error } = await supabase
                      .from('citas')
                      .insert({
                        paciente_id: editFormData.paciente_id,
                        doctor: editFormData.doctor,
                        fecha_cita: editFormData.fecha_cita,
                        tipo_cita: editFormData.tipo_cita,
                        estado: 'programada',
                        notas: editFormData.notas,
                        created_at: new Date().toISOString()
                      })

                    if (error) throw error

                    setIsNewCitaDialogOpen(false)
                    setEditFormData({
                      doctor: '',
                      fecha_cita: '',
                      tipo_cita: '',
                      estado: '',
                      notas: '',
                      paciente_id: ''
                    })
                    fetchData()
                  } catch (error) {
                    console.error('Error:', error)
                    alert('Error al crear la cita')
                  }
                }}
                className="bg-medical-teal hover:bg-medical-teal/90"
              >
                Agendar Cita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Completar Cita y Generar Seguimiento */}
      <Dialog open={isCompletarCitaOpen} onOpenChange={setIsCompletarCitaOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completar Cita y Generar Seguimiento</DialogTitle>
            <DialogDescription>
              Registra el diagnóstico, tratamiento y notas de seguimiento
            </DialogDescription>
          </DialogHeader>

          {selectedCita && (
            <div className="space-y-4">
              {/* Información del Paciente */}
              <div className="p-4 rounded-lg bg-medical-teal/10 border border-medical-teal/20">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-medical-teal" />
                  <div>
                    <p className="font-semibold">{selectedCita.paciente?.nombre_completo}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCita.tipo_cita} - {new Date(selectedCita.fecha_cita).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnóstico */}
              <div>
                <Label htmlFor="diagnostico">Diagnóstico *</Label>
                <Textarea
                  id="diagnostico"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  placeholder="Ej. Caries dental en molar superior derecho..."
                  className="bg-background/50 min-h-[80px]"
                />
              </div>

              {/* Tratamiento Realizado */}
              <div>
                <Label htmlFor="tratamiento">Tratamiento Realizado *</Label>
                <Textarea
                  id="tratamiento"
                  value={tratamientoRealizado}
                  onChange={(e) => setTratamientoRealizado(e.target.value)}
                  placeholder="Ej. Limpieza dental profunda, aplicación de flúor..."
                  className="bg-background/50 min-h-[80px]"
                />
              </div>

              {/* Notas de Seguimiento */}
              <div>
                <Label htmlFor="notas-seguimiento">Notas de Seguimiento *</Label>
                <Textarea
                  id="notas-seguimiento"
                  value={notasSeguimiento}
                  onChange={(e) => setNotasSeguimiento(e.target.value)}
                  placeholder="Ej. Paciente responde bien al tratamiento. Programar revisión en 2 semanas..."
                  className="bg-background/50 min-h-[100px]"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-600">
                  ℹ️ Al completar la cita se generará automáticamente un seguimiento en el expediente del paciente.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCompletarCitaOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCompletarCita}
                  disabled={loading || !diagnostico || !tratamientoRealizado || !notasSeguimiento}
                  className="bg-medical-teal hover:bg-medical-teal/90"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completar Cita
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Expediente del Paciente */}
      <Dialog open={isExpedienteOpen} onOpenChange={(open) => {
        setIsExpedienteOpen(open)
        if (!open) setEditandoPaciente(false)
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Expediente Digital del Paciente</DialogTitle>
                <DialogDescription>Información completa y editable del paciente</DialogDescription>
              </div>
              {!editandoPaciente && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditandoPaciente(true)
                    setDatosEditPaciente({
                      nombre_completo: pacienteSeleccionado?.nombre_completo || '',
                      telefono: pacienteSeleccionado?.telefono || '',
                      email: pacienteSeleccionado?.email || '',
                      prioridad: pacienteSeleccionado?.prioridad || 'media',
                      estado: pacienteSeleccionado?.estado || 'activo',
                      notas: pacienteSeleccionado?.notas || ''
                    })
                  }}
                  className="bg-medical-teal/10 hover:bg-medical-teal/20 text-medical-teal"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Información
                </Button>
              )}
            </div>
          </DialogHeader>

          {pacienteSeleccionado && (
            <div className="space-y-6">
              {/* Información del Paciente - Editable */}
              <Card className="bg-medical-teal/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editandoPaciente ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-nombre">Nombre Completo</Label>
                          <Input
                            id="edit-nombre"
                            value={datosEditPaciente.nombre_completo}
                            onChange={(e) => setDatosEditPaciente({...datosEditPaciente, nombre_completo: e.target.value})}
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-telefono">Teléfono</Label>
                          <Input
                            id="edit-telefono"
                            value={datosEditPaciente.telefono}
                            onChange={(e) => setDatosEditPaciente({...datosEditPaciente, telefono: e.target.value})}
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={datosEditPaciente.email}
                            onChange={(e) => setDatosEditPaciente({...datosEditPaciente, email: e.target.value})}
                            className="bg-background/50"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-prioridad">Prioridad</Label>
                          <Select
                            value={datosEditPaciente.prioridad}
                            onValueChange={(value) => setDatosEditPaciente({...datosEditPaciente, prioridad: value})}
                          >
                            <SelectTrigger className="bg-background/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="media">Media</SelectItem>
                              <SelectItem value="baja">Baja</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-estado">Estado</Label>
                          <Select
                            value={datosEditPaciente.estado}
                            onValueChange={(value) => setDatosEditPaciente({...datosEditPaciente, estado: value})}
                          >
                            <SelectTrigger className="bg-background/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="activo">Activo</SelectItem>
                              <SelectItem value="en_tratamiento">En Tratamiento</SelectItem>
                              <SelectItem value="recuperacion">Recuperación</SelectItem>
                              <SelectItem value="inactivo">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="edit-notas">Notas del Paciente</Label>
                        <Textarea
                          id="edit-notas"
                          value={datosEditPaciente.notas}
                          onChange={(e) => setDatosEditPaciente({...datosEditPaciente, notas: e.target.value})}
                          className="bg-background/50 min-h-[80px]"
                          placeholder="Notas adicionales sobre el paciente..."
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setEditandoPaciente(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleGuardarPaciente}
                          disabled={loading}
                          className="bg-medical-teal hover:bg-medical-teal/90"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Guardar Cambios
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Nombre</p>
                        <p className="font-medium">{pacienteSeleccionado.nombre_completo}</p>
                      </div>
                      {pacienteSeleccionado.telefono && (
                        <div>
                          <p className="text-muted-foreground">Teléfono</p>
                          <p className="font-medium">{pacienteSeleccionado.telefono}</p>
                        </div>
                      )}
                      {pacienteSeleccionado.email && (
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{pacienteSeleccionado.email}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Prioridad</p>
                        <Badge className={getPrioridadBadge(pacienteSeleccionado.prioridad || 'media')}>
                          {pacienteSeleccionado.prioridad || 'media'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Estado</p>
                        <Badge className={getEstadoBadge(pacienteSeleccionado.estado || 'activo')}>
                          {pacienteSeleccionado.estado || 'activo'}
                        </Badge>
                      </div>
                      {pacienteSeleccionado.historia_clinica && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Edad</p>
                            <p className="font-medium">{pacienteSeleccionado.historia_clinica.edad || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sexo</p>
                            <p className="font-medium capitalize">{pacienteSeleccionado.historia_clinica.sexo || 'N/A'}</p>
                          </div>
                        </>
                      )}
                      {pacienteSeleccionado.notas && (
                        <div className="col-span-full">
                          <p className="text-muted-foreground">Notas</p>
                          <p className="text-sm mt-1">{pacienteSeleccionado.notas}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historial de Citas */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Historial de Citas ({pacienteSeleccionado.citas?.length || 0})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pacienteSeleccionado.citas?.length > 0 ? (
                    pacienteSeleccionado.citas.map((cita: any) => (
                      <div key={cita.id} className="p-3 rounded-lg bg-background/50 border">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{cita.tipo_cita}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(cita.fecha_cita).toLocaleString('es-ES')} - Dr. {cita.doctor}
                            </p>
                            {cita.notas && (
                              <p className="text-xs text-muted-foreground mt-1">{cita.notas}</p>
                            )}
                          </div>
                          <Badge className={getEstadoBadge(cita.estado)}>{cita.estado}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay citas registradas</p>
                  )}
                </div>
              </div>

              {/* Historial de Seguimientos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Seguimientos y Notas ({pacienteSeleccionado.seguimientos?.length || 0})
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setIsNuevoSeguimientoOpen(true)}
                    className="bg-medical-teal hover:bg-medical-teal/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Nota
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pacienteSeleccionado.seguimientos?.length > 0 ? (
                    pacienteSeleccionado.seguimientos.map((seg: any) => (
                      <div key={seg.id} className="p-3 rounded-lg bg-background/50 border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium capitalize">{seg.tipo}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(seg.fecha_seguimiento).toLocaleString('es-ES')}
                              {seg.asignado_a && ` - ${seg.asignado_a}`}
                            </p>
                            {seg.titulo && (
                              <p className="text-sm mt-2 font-medium">{seg.titulo}</p>
                            )}
                            {seg.resultado && (
                              <p className="text-sm mt-1">
                                <span className="font-medium">Resultado:</span> {seg.resultado}
                              </p>
                            )}
                            {seg.descripcion && (
                              <p className="text-sm mt-1 text-muted-foreground whitespace-pre-line">{seg.descripcion}</p>
                            )}
                            {seg.notas && seg.notas !== seg.descripcion && (
                              <p className="text-xs mt-1 text-muted-foreground italic">Notas: {seg.notas}</p>
                            )}
                          </div>
                          <Badge className={getPrioridadBadge(seg.prioridad)}>{seg.prioridad}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay seguimientos registrados</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Agregar Nueva Nota/Seguimiento */}
      <Dialog open={isNuevoSeguimientoOpen} onOpenChange={setIsNuevoSeguimientoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Nota o Seguimiento</DialogTitle>
            <DialogDescription>
              Registra una nueva nota, observación o seguimiento del paciente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo-seguimiento">Tipo</Label>
                <Select
                  value={nuevaSeguimientoData.tipo}
                  onValueChange={(value) => setNuevaSeguimientoData({...nuevaSeguimientoData, tipo: value})}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nota">Nota</SelectItem>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="revision">Revisión</SelectItem>
                    <SelectItem value="llamada">Llamada</SelectItem>
                    <SelectItem value="recordatorio">Recordatorio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prioridad-seguimiento">Prioridad</Label>
                <Select
                  value={nuevaSeguimientoData.prioridad}
                  onValueChange={(value) => setNuevaSeguimientoData({...nuevaSeguimientoData, prioridad: value})}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="titulo-seguimiento">Título/Asunto *</Label>
              <Input
                id="titulo-seguimiento"
                value={nuevaSeguimientoData.titulo}
                onChange={(e) => setNuevaSeguimientoData({...nuevaSeguimientoData, titulo: e.target.value})}
                placeholder="Ej. Revisión post-tratamiento, Llamada de seguimiento..."
                className="bg-background/50"
              />
            </div>

            <div>
              <Label htmlFor="descripcion-seguimiento">Descripción/Notas *</Label>
              <Textarea
                id="descripcion-seguimiento"
                value={nuevaSeguimientoData.descripcion}
                onChange={(e) => setNuevaSeguimientoData({...nuevaSeguimientoData, descripcion: e.target.value})}
                placeholder="Escribe las notas, observaciones o detalles del seguimiento..."
                className="bg-background/50 min-h-[120px]"
              />
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-600">
                ℹ️ Se guardará con la fecha y hora actual: {new Date().toLocaleString('es-ES')}
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNuevoSeguimientoOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCrearSeguimiento}
                disabled={loading || !nuevaSeguimientoData.titulo || !nuevaSeguimientoData.descripcion}
                className="bg-medical-teal hover:bg-medical-teal/90"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Nota
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
