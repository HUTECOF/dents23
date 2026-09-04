"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { isAuthenticated, logout } from "@/lib/auth-helpers"
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
} from "lucide-react"

interface Paciente {
  id: number
  nombre_completo: string
  telefono: string
  email: string
  fecha_nacimiento: string
  direccion: string
  motivo_consulta: string
  estado: string
  fecha_registro: string
  notas?: string
}

interface Cita {
  id: number
  paciente_id: number
  fecha_cita: string
  tipo_cita: string
  estado: string
  doctor: string
  notas?: string
}

interface Pago {
  id: number
  paciente_id: number
  monto: number
  estado: string
  metodo_pago?: string
  fecha_pago?: string
}

export default function CRMDashboard() {
  const router = useRouter()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [citas, setCitas] = useState<Cita[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/crm/login')
    }
  }, [])

  // Cargar datos desde Supabase
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener pacientes reales de la tabla pacientes
      const { data: pacientesData, error: pacientesError } = await supabase
        .from('pacientes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (pacientesError) {
        console.warn('No hay tabla pacientes aún, usando historias clínicas')
        
        // Fallback: usar historias clínicas
        const { data: historiasData, error: historiasError } = await supabase
          .from('historias_clinicas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        if (historiasError) throw historiasError

        const pacientesFromHistorias = (historiasData || []).map((historia: any) => ({
          id: historia.id,
          nombre_completo: historia.nombre || 'Sin nombre',
          telefono: historia.celular || historia.telefono || 'N/A',
          email: historia.email || 'N/A',
          direccion: historia.direccion || 'N/A',
          estado: historia.estado_prospecto || 'prospecto',
          fecha_registro: historia.created_at,
          empresa: historia.empresa,
        }))

        setPacientes(pacientesFromHistorias)
      } else {
        setPacientes(pacientesData || [])
      }

      // Obtener citas
      const { data: citasData } = await supabase
        .from('citas')
        .select(`
          *,
          paciente:pacientes(nombre_completo)
        `)
        .order('fecha_cita', { ascending: true })
        .limit(5)

      setCitas(citasData || [])

      // Obtener pagos
      const { data: pagosData } = await supabase
        .from('pagos')
        .select(`
          *,
          paciente:pacientes(nombre_completo)
        `)
        .eq('estado', 'pendiente')
        .order('fecha_vencimiento', { ascending: true })
        .limit(5)

      setPagos(pagosData || [])

    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Suscripción en tiempo real
  useEffect(() => {
    fetchData()

    // Suscribirse a cambios en tiempo real en múltiples tablas
    const channel = supabase
      .channel('crm-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pacientes' },
        (payload) => {
          console.log('Cambio en pacientes:', payload)
          fetchData()
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'citas' },
        (payload) => {
          console.log('Cambio en citas:', payload)
          fetchData()
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pagos' },
        (payload) => {
          console.log('Cambio en pagos:', payload)
          fetchData()
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'historias_clinicas' },
        (payload) => {
          console.log('Cambio en historias clínicas:', payload)
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getEstadoBadge = (estado: string) => {
    const variants = {
      nuevo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "en-tratamiento": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      activo: "bg-green-500/10 text-green-400 border-green-500/20",
      recuperacion: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      pendiente: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      programada: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      completada: "bg-green-500/10 text-green-400 border-green-500/20",
      pagado: "bg-green-500/10 text-green-400 border-green-500/20",
    }

    return variants[estado as keyof typeof variants] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }

  // Calcular estadísticas dinámicas
  const totalPacientes = pacientes.filter(p => p.estado === 'activo' || p.estado === 'en_tratamiento').length
  const citasHoy = citas.filter((c) => {
    const fechaCita = new Date(c.fecha_cita)
    const hoy = new Date()
    return fechaCita.toDateString() === hoy.toDateString() && c.estado === "programada"
  }).length
  const montoPendiente = pagos.reduce((sum, p) => sum + (Number(p.monto) || 0), 0)

  const stats = [
    {
      title: "Total Pacientes",
      value: totalPacientes.toString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Citas Hoy",
      value: citasHoy.toString(),
      change: "+5%",
      icon: Calendar,
      color: "text-green-400",
    },
    {
      title: "Pagos Pendientes",
      value: `$${montoPendiente.toLocaleString()}`,
      change: "+18%",
      icon: DollarSign,
      color: "text-yellow-400",
    },
    {
      title: "Prospectos",
      value: pacientes.filter(p => p.estado === 'prospecto').length.toString(),
      change: "+8",
      icon: Activity,
      color: "text-purple-400",
    },
  ]

  // Filtrar pacientes por búsqueda
  const pacientesFiltrados = pacientes.filter(p => 
    p.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefono?.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex flex-col sm:flex-row sm:h-16 items-center px-4 sm:px-6 py-3 sm:py-0 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 rounded-lg bg-medical-teal/10">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-medical-teal" />
            </div>
            <div className="flex-1 sm:flex-none">
              <h1 className="text-lg sm:text-xl font-semibold">CRM Dent's 23</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Sistema de gestión dental</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto sm:ml-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-background/50"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Actualizar</span>
            </Button>
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
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <p className="text-sm">Error: {error}</p>
        </div>
      )}

      <div className="p-4 sm:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p
                        className={`text-sm flex items-center gap-1 ${
                          stat.change.startsWith("+") ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg bg-background/50 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Pacientes Recientes */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-medical-teal" />
                    Pacientes Recientes
                  </CardTitle>
                  <CardDescription>Últimos registros y actualizaciones</CardDescription>
                </div>
                <Link href="/crm/pacientes">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-medical-teal" />
                    <span className="ml-2 text-muted-foreground">Cargando pacientes...</span>
                  </div>
                ) : pacientesFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron pacientes</p>
                    {searchTerm && <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pacientesFiltrados.map((paciente) => (
                      <motion.div
                        key={paciente.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-background/30 border border-border/50 gap-3"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-medical-teal/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-medical-teal">
                              {paciente.nombre_completo
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{paciente.nombre_completo}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1 truncate">
                                <Phone className="w-3 h-3 shrink-0" />
                                {paciente.telefono}
                              </span>
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 shrink-0" />
                                {paciente.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end sm:justify-start">
                          <Badge className={getEstadoBadge(paciente.estado)}>{paciente.estado}</Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Citas de Hoy */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-medical-teal" />
                  Citas de Hoy
                </CardTitle>
                <Link href="/crm/citas">
                  <Button variant="outline" size="sm">
                    Ver Todas
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 animate-spin text-medical-teal" />
                  </div>
                ) : citas.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No hay citas programadas para hoy
                  </div>
                ) : (
                  <div className="space-y-3">
                    {citas.slice(0, 5).map((cita: any) => {
                      const nombrePaciente = cita.paciente?.nombre_completo || 'Paciente'
                      return (
                        <div key={cita.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/30">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{nombrePaciente}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(cita.fecha_cita).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Badge className={getEstadoBadge(cita.estado)}>
                            {cita.estado === "programada" ? (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {cita.estado}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pagos Pendientes */}
            <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-medical-teal" />
                  Pagos Pendientes
                </CardTitle>
                <Link href="/crm/pagos">
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-5 h-5 animate-spin text-medical-teal" />
                  </div>
                ) : pagos.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No hay pagos pendientes
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pagos.slice(0, 5).map((pago: any) => {
                      const nombrePaciente = pago.paciente?.nombre_completo || 'Paciente'
                      return (
                        <div
                          key={pago.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/30"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{nombrePaciente}</p>
                            <p className="text-xs text-muted-foreground">${Number(pago.monto).toLocaleString()}</p>
                          </div>
                          <Badge className={getEstadoBadge(pago.estado)}>
                            <XCircle className="w-3 h-3 mr-1" />
                            {pago.estado}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
