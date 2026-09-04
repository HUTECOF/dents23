"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { pagosHelpers, planesPagoHelpers } from "@/lib/crm-helpers"
import {
  DollarSign,
  Search,
  Filter,
  Plus,
  Edit,
  CreditCard,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Receipt,
  Banknote,
  RefreshCw,
  Calendar,
  User,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { isAuthenticated, logout } from "@/lib/auth-helpers"

export default function PagosPage() {
  const router = useRouter()
  const [pagos, setPagos] = useState<any[]>([])
  const [planesPago, setPlanesPago] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [selectedView, setSelectedView] = useState<'pagos' | 'planes'>('pagos')
  const [selectedPago, setSelectedPago] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRegistrarPagoOpen, setIsRegistrarPagoOpen] = useState(false)
  const [isGenerarMensualidadesOpen, setIsGenerarMensualidadesOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [contratos, setContratos] = useState<any[]>([])

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/crm/login')
    }
  }, [])
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null)
  const [editPlanData, setEditPlanData] = useState({
    monto_total: '',
    numero_cuotas: '',
    monto_cuota: '',
    estado: ''
  })

  // Cargar datos desde Supabase
  const fetchData = async () => {
    try {
      setLoading(true)

      // Obtener pagos con información del paciente
      const { data: pagosData } = await supabase
        .from('pagos')
        .select(`
          *,
          paciente:pacientes(nombre_completo)
        `)
        .order('created_at', { ascending: false })

      setPagos(pagosData || [])

      // Obtener contratos con información del paciente
      const { data: contratosData } = await supabase
        .from('contratos')
        .select(`
          *,
          historia_clinica:historias_clinicas(
            id,
            nombre,
            email,
            celular
          )
        `)
        .order('created_at', { ascending: false })

      setContratos(contratosData || [])

      // Obtener pacientes
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select('id, nombre_completo, historia_clinica_id')
        .order('nombre_completo')

      setPacientes(pacientesData || [])

      // Crear planes de pago basados en contratos
      const planesFromContratos = (contratosData || []).map((contrato: any) => {
        const paciente = pacientesData?.find(p => p.historia_clinica_id === contrato.historia_clinica_id)
        return {
          id: contrato.id,
          paciente_id: paciente?.id,
          paciente_nombre: contrato.historia_clinica?.nombre || 'Paciente',
          paciente: { nombre_completo: contrato.historia_clinica?.nombre || 'Paciente' },
          concepto: contrato.tratamiento || 'Tratamiento dental',
          monto_total: parseFloat(contrato.costo_total || 0),
          numero_cuotas: parseInt(contrato.numero_semanas || 0),
          monto_cuota: parseFloat(contrato.pago_semanal || 0),
          periodicidad: 'semanal',
          estado: 'activo',
          fecha_inicio: contrato.fecha_firma || contrato.created_at,
          fecha_primer_pago: contrato.fecha_firma || contrato.created_at,
          contrato_id: contrato.id
        }
      })

      setPlanesPago(planesFromContratos)
    } catch (err: any) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Suscripción en tiempo real
  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('pagos-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pagos' },
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'planes_pago' },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedView])

  // Guardar cambios en el plan de pago (actualiza contrato)
  const handleGuardarPlan = async () => {
    if (!selectedPago) return

    try {
      setLoading(true)

      // El ID del plan es el mismo que el ID del contrato
      const contratoId = selectedPago.id

      console.log('Actualizando contrato:', contratoId, editPlanData)

      const { data, error } = await supabase
        .from('contratos')
        .update({
          costo_total: editPlanData.monto_total.toString(),
          numero_semanas: editPlanData.numero_cuotas.toString(),
          pago_semanal: editPlanData.monto_cuota.toString()
        })
        .eq('id', contratoId)
        .select()

      if (error) {
        console.error('Error de Supabase:', error)
        throw error
      }

      console.log('Contrato actualizado:', data)

      toast.success('✅ Plan de pago actualizado exitosamente!')
      setIsEditDialogOpen(false)
      fetchData()
    } catch (err: any) {
      console.error('Error completo:', err)
      toast.error('❌ Error al actualizar plan: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  // Generar mensualidades automáticamente
  const handleGenerarMensualidades = async (plan: any) => {
    try {
      setLoading(true)

      console.log('Plan seleccionado:', plan)
      console.log('Pacientes disponibles:', pacientes)

      // Buscar el paciente por historia_clinica_id que coincida con el contrato
      let paciente = plan.paciente_id 
        ? pacientes.find(p => p.id === plan.paciente_id)
        : pacientes.find(p => p.historia_clinica_id === plan.id)
      
      console.log('Paciente encontrado:', paciente)

      if (!paciente) {
        // Si no se encuentra, obtener el contrato para sacar la historia_clinica_id
        const { data: contratoData } = await supabase
          .from('contratos')
          .select('historia_clinica_id')
          .eq('id', plan.id)
          .single()

        console.log('Contrato data:', contratoData)

        if (contratoData) {
          paciente = pacientes.find(p => p.historia_clinica_id === contratoData.historia_clinica_id)
          console.log('Paciente encontrado por contrato:', paciente)
        }
      }

      if (!paciente) {
        // Intentar crear el paciente automáticamente desde la historia clínica
        const { data: contratoData } = await supabase
          .from('contratos')
          .select('historia_clinica_id')
          .eq('id', plan.id)
          .single()

        if (contratoData) {
          const { data: historiaData } = await supabase
            .from('historias_clinicas')
            .select('*')
            .eq('id', contratoData.historia_clinica_id)
            .single()

          if (historiaData) {
            // Crear el paciente automáticamente
            const { data: nuevoPaciente, error: errorPaciente } = await supabase
              .from('pacientes')
              .insert({
                historia_clinica_id: historiaData.id,
                nombre_completo: historiaData.nombre,
                telefono: historiaData.celular || historiaData.telefono,
                email: historiaData.email,
                edad: historiaData.edad ? parseInt(historiaData.edad) : null,
                sexo: historiaData.sexo,
                direccion: historiaData.direccion,
                empresa: historiaData.empresa,
                ocupacion: historiaData.ocupacion,
                estado: 'activo',
                prioridad: 'media',
                created_at: new Date().toISOString()
              })
              .select()
              .single()

            if (errorPaciente) {
              console.error('Error al crear paciente:', errorPaciente)
              toast.error('❌ Error al crear el paciente automáticamente')
              return
            }

            // Actualizar la historia clínica
            await supabase
              .from('historias_clinicas')
              .update({
                convertido_paciente: true,
                estado_prospecto: 'paciente',
                fecha_conversion: new Date().toISOString()
              })
              .eq('id', historiaData.id)

            paciente = nuevoPaciente
            toast.success('✅ Paciente creado automáticamente')
          }
        }

        if (!paciente) {
          toast.error('❌ No se pudo crear el paciente. Verifica que exista la historia clínica.')
          return
        }
      }

      const mensualidades = []
      const fechaInicio = new Date(plan.fecha_primer_pago)

      for (let i = 0; i < plan.numero_cuotas; i++) {
        const fechaVencimiento = new Date(fechaInicio)
        fechaVencimiento.setDate(fechaVencimiento.getDate() + (i * 7)) // Semanal

        mensualidades.push({
          paciente_id: paciente.id,
          concepto: `${plan.concepto} - Cuota ${i + 1}/${plan.numero_cuotas}`,
          monto: parseFloat(plan.monto_cuota),
          estado: 'pendiente',
          fecha_vencimiento: fechaVencimiento.toISOString(),
          numero_cuota: i + 1,
          metodo_pago: null,
          created_at: new Date().toISOString()
        })
      }

      console.log('Mensualidades a insertar:', mensualidades)

      const { error } = await supabase
        .from('pagos')
        .insert(mensualidades)

      if (error) {
        console.error('Error al insertar:', error)
        throw error
      }

      toast.success(`✅ ${mensualidades.length} mensualidades generadas exitosamente!`)
      setIsGenerarMensualidadesOpen(false)
      fetchData()
    } catch (err: any) {
      console.error('Error completo:', err)
      toast.error('❌ Error al generar mensualidades: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  // Registrar pago
  const handleRegistrarPago = async (pagoId: string, datos: any) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('pagos')
        .update({
          estado: 'pagado',
          metodo_pago: datos.metodo_pago,
          referencia: datos.referencia,
          fecha_pago: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', pagoId)

      if (error) throw error

      toast.success('✅ Pago registrado exitosamente!')
      setIsRegistrarPagoOpen(false)
      fetchData()
    } catch (err: any) {
      console.error('Error:', err)
      toast.error('❌ Error al registrar pago')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      pendiente: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      pagado: "bg-green-500/10 text-green-400 border-green-500/20",
      vencido: "bg-red-500/10 text-red-400 border-red-500/20",
      cancelado: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      activo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      completado: "bg-green-500/10 text-green-400 border-green-500/20",
    }
    return variants[estado] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="w-4 h-4" />
      case "pagado":
      case "completado":
        return <CheckCircle className="w-4 h-4" />
      case "vencido":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  // Filtrar datos
  const filteredPagos = pagos.filter((pago) => {
    const nombrePaciente = pago.paciente?.nombre_completo || pago.paciente_nombre || ''
    const matchesSearch =
      nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.monto?.toString().includes(searchTerm)

    const matchesFilter = filterEstado === "todos" || pago.estado === filterEstado

    return matchesSearch && matchesFilter
  })

  const filteredPlanes = planesPago.filter((plan) => {
    const nombrePaciente = plan.paciente?.nombre_completo || plan.paciente_nombre || ''
    const matchesSearch =
      nombrePaciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.concepto?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterEstado === "todos" || plan.estado === filterEstado

    return matchesSearch && matchesFilter
  })

  // Calcular estadísticas
  const totalIngresos = pagos.filter((p) => p.estado === "pagado").reduce((sum, p) => sum + Number(p.monto || 0), 0)
  const totalPendiente = pagos.filter((p) => p.estado === "pendiente").reduce((sum, p) => sum + Number(p.monto || 0), 0)
  const totalVencido = pagos.filter((p) => p.estado === "vencido").reduce((sum, p) => sum + Number(p.monto || 0), 0)

  const stats = selectedView === 'pagos' ? [
    {
      title: "Ingresos Totales",
      value: `$${totalIngresos.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      title: "Pendientes",
      value: `$${totalPendiente.toLocaleString()}`,
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      title: "Vencidos",
      value: `$${totalVencido.toLocaleString()}`,
      icon: XCircle,
      color: "text-red-400",
    },
    {
      title: "Total Pagos",
      value: pagos.length,
      icon: Receipt,
      color: "text-blue-400",
    },
  ] : [
    {
      title: "Planes Activos",
      value: planesPago.filter(p => p.estado === 'activo').length,
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      title: "Completados",
      value: planesPago.filter(p => p.estado === 'completado').length,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      title: "Total Planes",
      value: planesPago.length,
      icon: Receipt,
      color: "text-purple-400",
    },
    {
      title: "Monto Total",
      value: `$${planesPago.reduce((sum, p) => sum + Number(p.monto_total || 0), 0).toLocaleString()}`,
      icon: DollarSign,
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
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-medical-teal" />
            </div>
            <div className="flex-1 sm:flex-none">
              <h1 className="text-lg sm:text-xl font-semibold">Cobranza y Pagos</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Gestión financiera y facturación</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center sm:gap-4">
            {/* Toggle Pagos/Planes */}
            <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1">
              <Button
                variant={selectedView === "pagos" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView("pagos")}
                className={`flex-1 sm:flex-none ${selectedView === "pagos" ? "bg-medical-teal hover:bg-medical-teal/90" : ""}`}
              >
                <DollarSign className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Pagos</span>
              </Button>
              <Button
                variant={selectedView === "planes" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedView("planes")}
                className={`flex-1 sm:flex-none ${selectedView === "planes" ? "bg-medical-teal hover:bg-medical-teal/90" : ""}`}
              >
                <Receipt className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Planes</span>
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
                  {selectedView === "pagos" ? (
                    <>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </>
                  )}
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
                      <p className="text-lg sm:text-xl font-bold">{stat.value}</p>
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
            <CardTitle>{selectedView === "pagos" ? "Lista de Pagos" : "Planes de Pago"}</CardTitle>
            <CardDescription>
              {selectedView === "pagos"
                ? `${filteredPagos.length} pagos encontrados`
                : `${filteredPlanes.length} planes encontrados`}
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
                {selectedView === "pagos"
                  ? filteredPagos.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <DollarSign className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No hay pagos</p>
                        {searchTerm && <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>}
                      </div>
                    ) : (
                      (() => {
                        // Agrupar pagos por paciente
                        const pagosPorPaciente = filteredPagos.reduce((acc: any, pago: any) => {
                          const pacienteId = pago.paciente_id
                          if (!acc[pacienteId]) {
                            acc[pacienteId] = []
                          }
                          acc[pacienteId].push(pago)
                          return acc
                        }, {})

                        return Object.entries(pagosPorPaciente).map(([pacienteId, pagosPaciente]: [string, any], groupIndex) => {
                          const pagosArray = pagosPaciente as any[]
                          const primerPago = pagosArray[0]
                          const nombrePaciente = primerPago.paciente?.nombre_completo || primerPago.paciente_nombre || 'Paciente'
                          
                          // Obtener información del plan/contrato
                          const contrato = contratos.find(c => {
                            const paciente = pacientes.find(p => p.id === pacienteId)
                            return paciente && c.historia_clinica_id === paciente.historia_clinica_id
                          })

                          const totalCuotas = pagosArray.length
                          const cuotasPagadas = pagosArray.filter(p => p.estado === 'pagado').length
                          const cuotasPendientes = pagosArray.filter(p => p.estado === 'pendiente').length
                          const montoTotal = pagosArray.reduce((sum, p) => sum + Number(p.monto || 0), 0)
                          const montoPagado = pagosArray.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + Number(p.monto || 0), 0)
                          const montoRestante = montoTotal - montoPagado
                          const progreso = totalCuotas > 0 ? Math.round((cuotasPagadas / totalCuotas) * 100) : 0

                          return (
                            <motion.div
                              key={pacienteId}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: groupIndex * 0.05 }}
                              className="rounded-lg bg-background/30 border border-border/50 overflow-hidden"
                            >
                              {/* Header del Proyecto */}
                              <div className="p-4 bg-medical-teal/5 border-b border-border/50">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="w-12 h-12 shrink-0 rounded-full bg-medical-teal/10 flex items-center justify-center">
                                      <User className="w-6 h-6 text-medical-teal" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-lg">{nombrePaciente}</h3>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {contrato?.tratamiento || primerPago.concepto?.split(' - ')[0] || 'Tratamiento dental'}
                                      </p>
                                      
                                      {/* Información del Financiamiento */}
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                        <div>
                                          <p className="text-xs text-muted-foreground">Monto Total</p>
                                          <p className="text-sm font-bold text-medical-teal">${montoTotal.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground">Pagado</p>
                                          <p className="text-sm font-bold text-green-400">${montoPagado.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground">Restante</p>
                                          <p className="text-sm font-bold text-yellow-400">${montoRestante.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground">Progreso</p>
                                          <p className="text-sm font-bold">{cuotasPagadas}/{totalCuotas} cuotas</p>
                                        </div>
                                      </div>

                                      {/* Barra de Progreso */}
                                      <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                          <span className="text-muted-foreground">Avance del pago</span>
                                          <span className="font-medium">{progreso}%</span>
                                        </div>
                                        <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-medical-teal transition-all duration-300"
                                            style={{ width: `${progreso}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-2">
                                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                      {cuotasPendientes} pendientes
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Lista de Cuotas */}
                              <div className="divide-y divide-border/30">
                                {pagosArray.slice(0, 3).map((pago, index) => (
                                  <div key={pago.id} className="p-3 hover:bg-background/20 transition-colors">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className="w-8 h-8 shrink-0 rounded-full bg-medical-teal/10 flex items-center justify-center">
                                          <Receipt className="w-4 h-4 text-medical-teal" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{pago.concepto}</p>
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                              <Banknote className="w-3 h-3" />
                                              ${Number(pago.monto).toLocaleString()}
                                            </span>
                                            {pago.fecha_vencimiento && (
                                              <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Vence: {new Date(pago.fecha_vencimiento).toLocaleDateString('es-ES')}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Badge className={getEstadoBadge(pago.estado)}>
                                          {getEstadoIcon(pago.estado)}
                                          <span className="ml-1 text-xs">{pago.estado}</span>
                                        </Badge>
                                        {pago.estado === 'pendiente' && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedPago(pago)
                                              setIsRegistrarPagoOpen(true)
                                            }}
                                            className="bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-400"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* Mostrar más cuotas */}
                                {pagosArray.length > 3 && (
                                  <div className="p-3 text-center">
                                    <Button variant="ghost" size="sm" className="text-medical-teal">
                                      Ver todas las {pagosArray.length} cuotas
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )
                        })
                      })()
                    )
                  : filteredPlanes.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Receipt className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No hay planes de pago</p>
                        {searchTerm && <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>}
                      </div>
                    ) : (
                      filteredPlanes.map((plan, index) => {
                        const nombrePaciente = plan.paciente?.nombre_completo || plan.paciente_nombre || 'Paciente'
                        const pagosDelPlan = pagos.filter(p => p.plan_pago_id === plan.id)
                        const pagosPagados = pagosDelPlan.filter(p => p.estado === 'pagado').length
                        
                        return (
                          <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-background/30 border border-border/50 hover:bg-background/50 transition-colors gap-3"
                          >
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-medical-teal/10 flex items-center justify-center">
                                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-medical-teal" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{nombrePaciente}</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">{plan.concepto}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 shrink-0" />
                                    ${Number(plan.monto_total).toLocaleString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Receipt className="w-3 h-3 shrink-0" />
                                    {plan.numero_cuotas} cuotas de ${Number(plan.monto_cuota).toLocaleString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 shrink-0" />
                                    {pagosPagados}/{plan.numero_cuotas} pagadas
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 justify-end sm:justify-start">
                              <Badge className={getEstadoBadge(plan.estado)}>
                                {getEstadoIcon(plan.estado)}
                                <span className="ml-1 text-xs">{plan.estado}</span>
                              </Badge>
                              
                              {/* Botón Generar Mensualidades */}
                              {pagosDelPlan.length === 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPlan(plan)
                                    setIsGenerarMensualidadesOpen(true)
                                  }}
                                  className="bg-medical-teal/10 hover:bg-medical-teal/20 border-medical-teal/20 text-medical-teal"
                                >
                                  <Plus className="w-4 h-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Generar</span>
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPago(plan)
                                  setEditPlanData({
                                    monto_total: plan.monto_total?.toString() || '',
                                    numero_cuotas: plan.numero_cuotas?.toString() || '',
                                    monto_cuota: plan.monto_cuota?.toString() || '',
                                    estado: plan.estado || 'activo'
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
                    )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Registrar Pago */}
      <Dialog open={isRegistrarPagoOpen} onOpenChange={setIsRegistrarPagoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>Marcar pago como recibido</DialogDescription>
          </DialogHeader>

          {selectedPago && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground">Paciente</p>
                <p className="font-medium">{selectedPago.paciente?.nombre_completo || 'Paciente'}</p>
                <p className="text-sm text-muted-foreground mt-2">Monto</p>
                <p className="text-2xl font-bold text-medical-teal">${Number(selectedPago.monto).toLocaleString()}</p>
              </div>

              <div>
                <Label htmlFor="metodo_pago">Método de Pago</Label>
                <Select defaultValue="efectivo">
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="referencia">Referencia (Opcional)</Label>
                <Input 
                  id="referencia" 
                  placeholder="Número de transacción, folio, etc."
                  className="bg-background/50" 
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegistrarPagoOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedPago) {
                  const metodo = (document.getElementById('metodo_pago') as any)?.value || 'efectivo'
                  const referencia = (document.getElementById('referencia') as HTMLInputElement)?.value
                  handleRegistrarPago(selectedPago.id, { metodo_pago: metodo, referencia })
                }
              }}
              disabled={loading}
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
                  Registrar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Plan de Pago */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Plan de Pago</DialogTitle>
            <DialogDescription>Modificar información del plan de pago</DialogDescription>
          </DialogHeader>

          {selectedPago && selectedView === 'planes' && (
            <div className="space-y-4">
              {/* Información del Paciente (solo lectura) */}
              <div className="p-4 rounded-lg bg-background/50 border">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Paciente</Label>
                    <p className="font-medium">{selectedPago.paciente_nombre}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tratamiento</Label>
                    <p className="font-medium">{selectedPago.concepto}</p>
                  </div>
                </div>
              </div>

              {/* Campos Editables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monto_total">Monto Total *</Label>
                  <Input
                    id="monto_total"
                    type="number"
                    value={editPlanData.monto_total}
                    onChange={(e) => setEditPlanData({...editPlanData, monto_total: e.target.value})}
                    placeholder="Ej. 25000"
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="numero_cuotas">Número de Cuotas (Semanas) *</Label>
                  <Input
                    id="numero_cuotas"
                    type="number"
                    value={editPlanData.numero_cuotas}
                    onChange={(e) => setEditPlanData({...editPlanData, numero_cuotas: e.target.value})}
                    placeholder="Ej. 50"
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="monto_cuota">Pago Semanal *</Label>
                  <Input
                    id="monto_cuota"
                    type="number"
                    value={editPlanData.monto_cuota}
                    onChange={(e) => setEditPlanData({...editPlanData, monto_cuota: e.target.value})}
                    placeholder="Ej. 500"
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={editPlanData.estado}
                    onValueChange={(value) => setEditPlanData({...editPlanData, estado: value})}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Información Calculada */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-600">
                  ℹ️ Total: <span className="font-bold">${editPlanData.monto_total || 0}</span> ÷{' '}
                  <span className="font-bold">{editPlanData.numero_cuotas || 0} semanas</span> ={' '}
                  <span className="font-bold">
                    ${editPlanData.monto_total && editPlanData.numero_cuotas 
                      ? (parseFloat(editPlanData.monto_total) / parseFloat(editPlanData.numero_cuotas)).toFixed(2)
                      : 0}
                  </span> por semana
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleGuardarPlan}
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
              </DialogFooter>
            </div>
          )}

          {/* Vista de solo lectura para pagos individuales */}
          {selectedPago && selectedView === 'pagos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Paciente</Label>
                  <p className="font-medium">{selectedPago.paciente?.nombre_completo || 'Paciente'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Estado</Label>
                  <Badge className={getEstadoBadge(selectedPago.estado)}>
                    {selectedPago.estado}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Monto</Label>
                  <p className="text-lg font-bold">${Number(selectedPago.monto).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Concepto</Label>
                  <p>{selectedPago.concepto}</p>
                </div>
                {selectedPago.metodo_pago && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Método de Pago</Label>
                    <p className="capitalize">{selectedPago.metodo_pago}</p>
                  </div>
                )}
                {selectedPago.fecha_vencimiento && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Fecha Vencimiento</Label>
                    <p>{new Date(selectedPago.fecha_vencimiento).toLocaleDateString('es-ES')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Generar Mensualidades */}
      <Dialog open={isGenerarMensualidadesOpen} onOpenChange={setIsGenerarMensualidadesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Mensualidades</DialogTitle>
            <DialogDescription>
              Crear pagos automáticos basados en el plan de pago del contrato
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-medical-teal/10 border border-medical-teal/20">
                <p className="text-sm font-medium text-medical-teal mb-3">
                  📋 Resumen del Plan de Pago
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Paciente</p>
                    <p className="font-medium">{selectedPlan.paciente_nombre}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tratamiento</p>
                    <p className="font-medium">{selectedPlan.concepto}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monto Total</p>
                    <p className="font-bold text-medical-teal">${selectedPlan.monto_total?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Número de Cuotas</p>
                    <p className="font-medium">{selectedPlan.numero_cuotas} semanas</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pago Semanal</p>
                    <p className="font-medium">${selectedPlan.monto_cuota?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Primer Pago</p>
                    <p className="font-medium">
                      {new Date(selectedPlan.fecha_primer_pago).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-600">
                  ℹ️ Se generarán <span className="font-bold">{selectedPlan.numero_cuotas} pagos</span> de{' '}
                  <span className="font-bold">${selectedPlan.monto_cuota?.toLocaleString()}</span> cada uno,
                  con vencimiento semanal a partir del {new Date(selectedPlan.fecha_primer_pago).toLocaleDateString('es-ES')}.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerarMensualidadesOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedPlan && handleGenerarMensualidades(selectedPlan)}
              disabled={loading}
              className="bg-medical-teal hover:bg-medical-teal/90"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generar Mensualidades
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
