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
import { pacientesHelpers } from "@/lib/crm-helpers"
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MoreHorizontal,
  ArrowLeft,
  RefreshCw,
  UserCheck,
  UserX,
  Activity,
  CheckCircle,
  XCircle,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ProgresoProspecto } from "@/components/progreso-prospecto"
import { isAuthenticated, getAuthenticatedUser, logout } from "@/lib/auth-helpers"

export default function PacientesPage() {
  const router = useRouter()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [authenticatedUser, setAuthenticatedUser] = useState<string | null>(null)
  const [prospectos, setProspectos] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [filterTipoPaciente, setFilterTipoPaciente] = useState("todos")
  const [selectedPaciente, setSelectedPaciente] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false)
  const [isProgresoDialogOpen, setIsProgresoDialogOpen] = useState(false)
  const [isNewPacienteDialogOpen, setIsNewPacienteDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedView, setSelectedView] = useState<'pacientes' | 'prospectos'>('pacientes')
  const [loading, setLoading] = useState(true)
  const [editFormData, setEditFormData] = useState({
    estado: '',
    prioridad: '',
    notas: ''
  })
  const [newPacienteData, setNewPacienteData] = useState({
    nombre_completo: '',
    telefono: '',
    email: '',
    edad: '',
    sexo: '',
    direccion: '',
    empresa: '',
    ocupacion: '',
    estado: 'activo',
    prioridad: 'media'
  })

  // Verificar autenticación al cargar
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/crm/login')
    } else {
      setAuthenticatedUser(getAuthenticatedUser())
    }
  }, [])

  // Cargar datos desde Supabase
  const fetchData = async () => {
    try {
      setLoading(true)

      // Obtener pacientes
      const { data: pacientesData, error: pacientesError } = await supabase
        .from('pacientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (!pacientesError) {
        setPacientes(pacientesData || [])
      }

      // Obtener prospectos (historias clínicas no convertidas)
      const { data: prospectosData, error: prospectosError } = await supabase
        .from('historias_clinicas')
        .select('*')
        .eq('convertido_paciente', false)
        .order('created_at', { ascending: false })

      if (!prospectosError) {
        setProspectos(prospectosData || [])
      }

    } catch (err: any) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Suscripción en tiempo real
  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('pacientes-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pacientes' },
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'historias_clinicas' },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Convertir prospecto a paciente
  const handleConvertirProspecto = async (historiaId: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .rpc('convertir_prospecto_a_paciente', { historia_id: historiaId })

      if (error) throw error

      toast.success('¡Prospecto convertido a paciente exitosamente!')
      setIsConvertDialogOpen(false)
      fetchData()
    } catch (err: any) {
      console.error('Error:', err)
      toast.error('Error al convertir prospecto: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar estado del paciente
  const handleActualizarEstado = async (pacienteId: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('pacientes')
        .update({ estado: nuevoEstado })
        .eq('id', pacienteId)

      if (error) throw error

      toast.success('Estado actualizado')
      fetchData()
    } catch (err: any) {
      toast.error('Error al actualizar estado')
    }
  }

  // Guardar cambios del paciente (estado, prioridad, notas)
  const handleGuardarCambios = async () => {
    if (!selectedPaciente) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from('pacientes')
        .update({
          estado: editFormData.estado,
          prioridad: editFormData.prioridad,
          notas: editFormData.notas,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPaciente.id)

      if (error) throw error

      toast.success('✅ Cambios guardados exitosamente')
      setIsEditDialogOpen(false)
      fetchData()
    } catch (err: any) {
      console.error('Error al guardar cambios:', err)
      toast.error('❌ Error al guardar cambios: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Abrir dialog de edición y cargar datos
  const handleOpenEditDialog = (paciente: any) => {
    setSelectedPaciente(paciente)
    setEditFormData({
      estado: paciente.estado || 'activo',
      prioridad: paciente.prioridad || 'media',
      notas: paciente.notas || ''
    })
    setIsEditDialogOpen(true)
  }

  // Crear nuevo paciente
  const handleCrearPaciente = async () => {
    if (!newPacienteData.nombre_completo || !newPacienteData.telefono) {
      toast.error('Por favor completa al menos el nombre y teléfono')
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('pacientes')
        .insert({
          nombre_completo: newPacienteData.nombre_completo,
          telefono: newPacienteData.telefono,
          email: newPacienteData.email || null,
          edad: newPacienteData.edad ? parseInt(newPacienteData.edad) : null,
          sexo: newPacienteData.sexo || null,
          direccion: newPacienteData.direccion || null,
          empresa: newPacienteData.empresa || null,
          ocupacion: newPacienteData.ocupacion || null,
          estado: newPacienteData.estado,
          prioridad: newPacienteData.prioridad,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('✅ Paciente creado exitosamente')
      setIsNewPacienteDialogOpen(false)
      
      // Limpiar formulario
      setNewPacienteData({
        nombre_completo: '',
        telefono: '',
        email: '',
        edad: '',
        sexo: '',
        direccion: '',
        empresa: '',
        ocupacion: '',
        estado: 'activo',
        prioridad: 'media'
      })
      
      fetchData()
    } catch (err: any) {
      console.error('Error al crear paciente:', err)
      toast.error('❌ Error al crear paciente: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Eliminar paciente
  const handleEliminarPaciente = async () => {
    if (!selectedPaciente) return

    try {
      setLoading(true)

      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', selectedPaciente.id)

      if (error) throw error

      toast.success('✅ Paciente eliminado exitosamente')
      setIsDeleteDialogOpen(false)
      setSelectedPaciente(null)
      fetchData()
    } catch (err: any) {
      console.error('Error al eliminar paciente:', err)
      toast.error('❌ Error al eliminar paciente: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      activo: "bg-green-500/10 text-green-400 border-green-500/20",
      "en_tratamiento": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      recuperacion: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      inactivo: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      prospecto: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    }
    return variants[estado] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }

  // Filtrar datos
  const datosFiltrados = (selectedView === 'pacientes' ? pacientes : prospectos).filter((item) => {
    const matchesSearch =
      item.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.telefono?.includes(searchTerm) ||
      item.celular?.includes(searchTerm)

    const matchesFilter = filterEstado === "todos" || item.estado === filterEstado
    const matchesTipoPaciente = filterTipoPaciente === "todos" || item.tipo_paciente === filterTipoPaciente

    return matchesSearch && matchesFilter && matchesTipoPaciente
  })

  const stats = [
    {
      title: "Total Pacientes",
      value: pacientes.length,
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Prospectos",
      value: prospectos.length,
      icon: Activity,
      color: "text-purple-400",
    },
    {
      title: "En Tratamiento",
      value: pacientes.filter(p => p.estado === 'en_tratamiento').length,
      icon: UserCheck,
      color: "text-green-400",
    },
    {
      title: "Inactivos",
      value: pacientes.filter(p => p.estado === 'inactivo').length,
      icon: UserX,
      color: "text-gray-400",
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
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-medical-teal" />
            </div>
            <div className="flex-1 sm:flex-none">
              <h1 className="text-lg sm:text-xl font-semibold">Pacientes y Prospectos</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Gestión completa de pacientes</p>
            </div>
            
            {/* Usuario autenticado */}
            {authenticatedUser && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {authenticatedUser.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-teal-900">{authenticatedUser}</p>
                  <p className="text-xs text-teal-600">Administrador</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center sm:gap-4">
            {/* Toggle Pacientes/Prospectos */}
            <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1">
              <Button
                variant={selectedView === "pacientes" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView("pacientes")}
                className={`flex-1 sm:flex-none ${selectedView === "pacientes" ? "bg-medical-teal hover:bg-medical-teal/90" : ""}`}
              >
                <Users className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Pacientes</span>
              </Button>
              <Button
                variant={selectedView === "prospectos" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView("prospectos")}
                className={`flex-1 sm:flex-none ${selectedView === "prospectos" ? "bg-medical-teal hover:bg-medical-teal/90" : ""}`}
              >
                <Activity className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Prospectos</span>
              </Button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-background/50"
                />
              </div>

              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-24 sm:w-40">
                  <Filter className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline"><SelectValue /></span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="en_tratamiento">En Tratamiento</SelectItem>
                  <SelectItem value="recuperacion">Recuperación</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterTipoPaciente} onValueChange={setFilterTipoPaciente}>
                <SelectTrigger className="w-32 sm:w-48">
                  <Users className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline"><SelectValue placeholder="Tipo" /></span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Tipos</SelectItem>
                  <SelectItem value="charly">🔑 Charly</SelectItem>
                  <SelectItem value="nomina">🏢 Nómina</SelectItem>
                  <SelectItem value="bancario">🏦 Bancario</SelectItem>
                  <SelectItem value="particular">💵 Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={fetchData}
              disabled={loading}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Actualizar</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="shrink-0"
              onClick={() => {
                logout()
                router.push('/crm/login')
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Cerrar Sesión</span>
            </Button>
            
            {selectedView === 'pacientes' && (
              <Button 
                size="sm"
                onClick={() => setIsNewPacienteDialogOpen(true)}
                className="bg-medical-teal hover:bg-medical-teal/90 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Nuevo Paciente</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {stats.map((stat, index) => (
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
            <CardTitle>
              {selectedView === 'pacientes' ? 'Lista de Pacientes' : 'Lista de Prospectos'}
            </CardTitle>
            <CardDescription>
              {datosFiltrados.length} {selectedView === 'pacientes' ? 'pacientes' : 'prospectos'} encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-medical-teal" />
                <span className="ml-3 text-muted-foreground">Cargando...</span>
              </div>
            ) : datosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No se encontraron {selectedView}</p>
                {searchTerm && <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {datosFiltrados.map((item, index) => {
                  const nombre = item.nombre_completo || item.nombre || 'Sin nombre'
                  const telefono = item.telefono || item.celular || 'N/A'
                  const email = item.email || 'N/A'
                  const estado = item.estado || item.estado_prospecto || 'prospecto'
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-background/30 border border-border/50 hover:bg-background/50 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-medical-teal/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-medical-teal">
                            {nombre
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{nombre}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 truncate">
                              <Phone className="w-3 h-3 shrink-0" />
                              {telefono}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 shrink-0" />
                              {email}
                            </span>
                            {item.empresa && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {item.empresa}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start flex-wrap">
                        <Badge className={getEstadoBadge(estado)}>
                          <span className="text-xs">{estado}</span>
                        </Badge>
                        
                        {/* Badge de Tipo de Paciente */}
                        {item.tipo_paciente && (
                          <Badge variant="outline" className={
                            item.tipo_paciente === 'charly' ? 'border-blue-500 text-blue-600 bg-blue-50' :
                            item.tipo_paciente === 'nomina' ? 'border-green-500 text-green-600 bg-green-50' :
                            item.tipo_paciente === 'bancario' ? 'border-purple-500 text-purple-600 bg-purple-50' :
                            item.tipo_paciente === 'particular' ? 'border-orange-500 text-orange-600 bg-orange-50' :
                            'border-gray-500 text-gray-600 bg-gray-50'
                          }>
                            <span className="text-xs">
                              {item.tipo_paciente === 'charly' && '🔑 Charly'}
                              {item.tipo_paciente === 'nomina' && '🏢 Nómina'}
                              {item.tipo_paciente === 'bancario' && '🏦 Bancario'}
                              {item.tipo_paciente === 'particular' && '💵 Particular'}
                            </span>
                          </Badge>
                        )}

                        {/* Botón Ver Progreso (solo para prospectos) */}
                        {selectedView === 'prospectos' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPaciente(item)
                              setIsProgresoDialogOpen(true)
                            }}
                            className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-600"
                          >
                            <Activity className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">Progreso</span>
                          </Button>
                        )}

                        {/* Botón Convertir (solo para prospectos) - SIEMPRE DISPONIBLE */}
                        {selectedView === 'prospectos' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPaciente(item)
                              setIsConvertDialogOpen(true)
                            }}
                            className="bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-400"
                            title={item.convertido_paciente ? "Este prospecto ya fue convertido" : "Convertir a paciente"}
                            disabled={item.convertido_paciente}
                          >
                            <UserCheck className="w-4 h-4 sm:mr-1" />
                            <span className="hidden sm:inline">
                              {item.convertido_paciente ? "Convertido" : "Convertir"}
                            </span>
                          </Button>
                        )}

                        {/* Botón Ver */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (selectedView === 'pacientes') {
                              // Ir al perfil completo del paciente
                              window.location.href = `/crm/pacientes/detalle?id=${item.id}`
                            } else {
                              // Para prospectos, mostrar dialog
                              setSelectedPaciente(item)
                              setIsViewDialogOpen(true)
                            }
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Botón Editar (solo pacientes) */}
                        {selectedView === 'pacientes' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditDialog(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            {/* Botón Eliminar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPaciente(item)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Ver Detalles */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del {selectedView === 'pacientes' ? 'Paciente' : 'Prospecto'}</DialogTitle>
            <DialogDescription>Información completa</DialogDescription>
          </DialogHeader>

          {selectedPaciente && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nombre Completo</Label>
                  <p className="font-medium">{selectedPaciente.nombre_completo || selectedPaciente.nombre}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Estado</Label>
                  <Badge className={getEstadoBadge(selectedPaciente.estado || selectedPaciente.estado_prospecto)}>
                    {selectedPaciente.estado || selectedPaciente.estado_prospecto}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Teléfono</Label>
                  <p>{selectedPaciente.telefono || selectedPaciente.celular || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="truncate">{selectedPaciente.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Edad</Label>
                  <p>{selectedPaciente.edad || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Sexo</Label>
                  <p>{selectedPaciente.sexo || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Dirección</Label>
                  <p>{selectedPaciente.direccion || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Empresa</Label>
                  <p>{selectedPaciente.empresa || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Antigüedad</Label>
                  <p>{selectedPaciente.antiguedad || 'N/A'}</p>
                </div>
                {selectedPaciente.ingreso_mensual && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Ingreso Mensual</Label>
                    <p>${Number(selectedPaciente.ingreso_mensual).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Fecha de Registro</Label>
                  <p>{new Date(selectedPaciente.created_at).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              {selectedPaciente.notas && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notas</Label>
                  <p className="text-sm mt-1">{selectedPaciente.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Convertir Prospecto */}
      <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convertir Prospecto a Paciente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de convertir este prospecto en paciente activo?
            </DialogDescription>
          </DialogHeader>

          {selectedPaciente && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background/50">
                <div className="w-12 h-12 rounded-full bg-medical-teal/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-medical-teal" />
                </div>
                <div>
                  <p className="font-medium">{selectedPaciente.nombre || 'Sin nombre'}</p>
                  <p className="text-sm text-muted-foreground">{selectedPaciente.email || 'Sin email'}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400">
                  ✓ Se creará un registro de paciente activo<br/>
                  ✓ Podrás agendar citas<br/>
                  ✓ Podrás crear planes de pago<br/>
                  ✓ Podrás gestionar tratamientos
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedPaciente && handleConvertirProspecto(selectedPaciente.id)}
              disabled={loading}
              className="bg-medical-teal hover:bg-medical-teal/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Convirtiendo...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Convertir a Paciente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ver Progreso */}
      <Dialog open={isProgresoDialogOpen} onOpenChange={setIsProgresoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Progreso del Registro</DialogTitle>
            <DialogDescription>
              {selectedPaciente?.nombre || 'Prospecto'} - Seguimiento del proceso
            </DialogDescription>
          </DialogHeader>

          {selectedPaciente && (
            <ProgresoProspecto
              progresoPaso={selectedPaciente.progreso_paso || 'historia_clinica'}
              progresoPorcentaje={selectedPaciente.progreso_porcentaje || 25}
              urlContinuar={selectedPaciente.url_continuar}
              fechaUltimoPaso={selectedPaciente.fecha_ultimo_paso}
              onContinuar={() => {
                // Generar URL basada en el paso actual
                const getUrlPorPaso = (paso: string) => {
                  const urls: Record<string, string> = {
                    'historia_clinica': '/',
                    'formulario_completo': '/formulario-completo',
                    'aprobacion_credito': '/formulario-completo',
                    'contrato': '/contrato',
                    'consentimiento': '/consentimiento',
                  }
                  return urls[paso] || '/'
                }
                
                const url = selectedPaciente.url_continuar || getUrlPorPaso(selectedPaciente.progreso_paso || 'historia_clinica')
                
                // Guardar ID en localStorage para recuperar datos
                if (selectedPaciente.id) {
                  localStorage.setItem('prospecto_continuar_id', selectedPaciente.id)
                }
                
                window.location.href = url
                setIsProgresoDialogOpen(false)
              }}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgresoDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Paciente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>Actualizar información del paciente</DialogDescription>
          </DialogHeader>

          {selectedPaciente && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="en_tratamiento">En Tratamiento</SelectItem>
                      <SelectItem value="recuperacion">Recuperación</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prioridad">Prioridad</Label>
                  <Select 
                    value={editFormData.prioridad}
                    onValueChange={(value) => setEditFormData({...editFormData, prioridad: value})}
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
                <Label htmlFor="notas">Notas</Label>
                <Textarea 
                  id="notas" 
                  value={editFormData.notas} 
                  onChange={(e) => setEditFormData({...editFormData, notas: e.target.value})}
                  className="bg-background/50" 
                  rows={4}
                  placeholder="Agregar notas sobre el paciente..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleGuardarCambios}
                  disabled={loading}
                  className="bg-medical-teal hover:bg-medical-teal/90"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nuevo Paciente */}
      <Dialog open={isNewPacienteDialogOpen} onOpenChange={setIsNewPacienteDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Paciente</DialogTitle>
            <DialogDescription>Agregar un nuevo paciente al sistema</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={newPacienteData.nombre_completo}
                  onChange={(e) => setNewPacienteData({...newPacienteData, nombre_completo: e.target.value})}
                  placeholder="Ej. Juan Pérez García"
                  className="bg-background/50"
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={newPacienteData.telefono}
                  onChange={(e) => setNewPacienteData({...newPacienteData, telefono: e.target.value})}
                  placeholder="Ej. 4771234567"
                  className="bg-background/50"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPacienteData.email}
                  onChange={(e) => setNewPacienteData({...newPacienteData, email: e.target.value})}
                  placeholder="Ej. juan@email.com"
                  className="bg-background/50"
                />
              </div>

              <div>
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  type="number"
                  value={newPacienteData.edad}
                  onChange={(e) => setNewPacienteData({...newPacienteData, edad: e.target.value})}
                  placeholder="Ej. 35"
                  className="bg-background/50"
                />
              </div>

              <div>
                <Label htmlFor="sexo">Sexo</Label>
                <Select
                  value={newPacienteData.sexo}
                  onValueChange={(value) => setNewPacienteData({...newPacienteData, sexo: value})}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={newPacienteData.direccion}
                  onChange={(e) => setNewPacienteData({...newPacienteData, direccion: e.target.value})}
                  placeholder="Ej. Calle Principal #123, Col. Centro"
                  className="bg-background/50"
                />
              </div>

              <div>
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={newPacienteData.empresa}
                  onChange={(e) => setNewPacienteData({...newPacienteData, empresa: e.target.value})}
                  placeholder="Ej. HUTEC"
                  className="bg-background/50"
                />
              </div>

              <div>
                <Label htmlFor="ocupacion">Ocupación</Label>
                <Input
                  id="ocupacion"
                  value={newPacienteData.ocupacion}
                  onChange={(e) => setNewPacienteData({...newPacienteData, ocupacion: e.target.value})}
                  placeholder="Ej. Ingeniero"
                  className="bg-background/50"
                />
              </div>

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={newPacienteData.estado}
                  onValueChange={(value) => setNewPacienteData({...newPacienteData, estado: value})}
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

              <div>
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={newPacienteData.prioridad}
                  onValueChange={(value) => setNewPacienteData({...newPacienteData, prioridad: value})}
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewPacienteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCrearPaciente}
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
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Paciente
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar Paciente */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Paciente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este paciente?
            </DialogDescription>
          </DialogHeader>

          {selectedPaciente && (
            <div className="py-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm font-medium text-red-600 mb-2">
                  ⚠️ Esta acción no se puede deshacer
                </p>
                <p className="text-sm">
                  Se eliminará permanentemente el paciente:{' '}
                  <span className="font-bold">{selectedPaciente.nombre_completo}</span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEliminarPaciente}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Eliminar Paciente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
