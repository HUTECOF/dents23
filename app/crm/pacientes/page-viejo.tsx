"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "lucide-react"
import Link from "next/link"

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

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Simular carga de datos
  useEffect(() => {
    setPacientes([
      {
        id: 1,
        nombre_completo: "María González López",
        telefono: "+52 555 123 4567",
        email: "maria.gonzalez@email.com",
        fecha_nacimiento: "1985-03-15",
        direccion: "Av. Reforma 123, CDMX",
        motivo_consulta: "consulta-general",
        estado: "nuevo",
        fecha_registro: "2024-01-14T10:00:00Z",
        notas: "Primera consulta, sin antecedentes relevantes",
      },
      {
        id: 2,
        nombre_completo: "Carlos Rodríguez Pérez",
        telefono: "+52 555 234 5678",
        email: "carlos.rodriguez@email.com",
        fecha_nacimiento: "1978-07-22",
        direccion: "Calle Juárez 456, Guadalajara",
        motivo_consulta: "dolor-sintomas",
        estado: "en-tratamiento",
        fecha_registro: "2024-01-10T14:30:00Z",
        notas: "Dolor de espalda crónico, requiere seguimiento",
      },
      {
        id: 3,
        nombre_completo: "Ana Martínez Silva",
        telefono: "+52 555 345 6789",
        email: "ana.martinez@email.com",
        fecha_nacimiento: "1992-11-08",
        direccion: "Blvd. Insurgentes 789, Monterrey",
        motivo_consulta: "revision-rutinaria",
        estado: "activo",
        fecha_registro: "2024-01-08T09:15:00Z",
        notas: "Paciente regular, chequeo anual",
      },
      {
        id: 4,
        nombre_completo: "Luis Hernández Torres",
        telefono: "+52 555 456 7890",
        email: "luis.hernandez@email.com",
        fecha_nacimiento: "1965-05-30",
        direccion: "Av. Universidad 321, Puebla",
        motivo_consulta: "seguimiento",
        estado: "recuperacion",
        fecha_registro: "2024-01-05T11:45:00Z",
        notas: "Post-operatorio, evolución favorable",
      },
      {
        id: 5,
        nombre_completo: "Carmen Jiménez Ruiz",
        telefono: "+52 555 567 8901",
        email: "carmen.jimenez@email.com",
        fecha_nacimiento: "1988-09-12",
        direccion: "Calle Morelos 654, Tijuana",
        motivo_consulta: "examenes",
        estado: "pendiente",
        fecha_registro: "2024-01-03T16:00:00Z",
        notas: "Esperando resultados de laboratorio",
      },
    ])
  }, [])

  const getEstadoBadge = (estado: string) => {
    const variants = {
      nuevo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "en-tratamiento": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      activo: "bg-green-500/10 text-green-400 border-green-500/20",
      recuperacion: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      pendiente: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    }

    return variants[estado as keyof typeof variants] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }

  const filteredPacientes = pacientes.filter((paciente) => {
    const matchesSearch =
      paciente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.telefono.includes(searchTerm)

    const matchesFilter = filterEstado === "todos" || paciente.estado === filterEstado

    return matchesSearch && matchesFilter
  })

  const handleEditPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente)
    setIsEditDialogOpen(true)
  }

  const handleViewPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <Link href="/crm">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="p-2 rounded-lg bg-medical-teal/10">
              <Users className="w-6 h-6 text-medical-teal" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Gestión de Pacientes</h1>
              <p className="text-sm text-muted-foreground">Administrar información de pacientes</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 bg-background/50"
              />
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="nuevo">Nuevo</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="en-tratamiento">En Tratamiento</SelectItem>
                <SelectItem value="recuperacion">Recuperación</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-medical-teal hover:bg-medical-teal/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Paciente
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{pacientes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activos</p>
                  <p className="text-xl font-bold">{pacientes.filter((p) => p.estado === "activo").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">En Tratamiento</p>
                  <p className="text-xl font-bold">{pacientes.filter((p) => p.estado === "en-tratamiento").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nuevos</p>
                  <p className="text-xl font-bold">{pacientes.filter((p) => p.estado === "nuevo").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Pacientes */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>{filteredPacientes.length} pacientes encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPacientes.map((paciente, index) => (
                <motion.div
                  key={paciente.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/50 hover:bg-background/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-medical-teal/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-medical-teal">
                        {paciente.nombre_completo
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{paciente.nombre_completo}</h3>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {paciente.telefono}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {paciente.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {paciente.direccion.split(",")[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(paciente.fecha_registro).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getEstadoBadge(paciente.estado)}>{paciente.estado}</Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewPaciente(paciente)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditPaciente(paciente)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Ver Paciente */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Información del Paciente</DialogTitle>
            <DialogDescription>Detalles completos del paciente</DialogDescription>
          </DialogHeader>

          {selectedPaciente && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre Completo</Label>
                  <p className="text-lg font-medium">{selectedPaciente.nombre_completo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                  <div className="mt-1">
                    <Badge className={getEstadoBadge(selectedPaciente.estado)}>{selectedPaciente.estado}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedPaciente.telefono}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedPaciente.email}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {selectedPaciente.direccion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</Label>
                  <p>{new Date(selectedPaciente.fecha_nacimiento).toLocaleDateString("es-ES")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Registro</Label>
                  <p>{new Date(selectedPaciente.fecha_registro).toLocaleDateString("es-ES")}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Motivo de Consulta</Label>
                <p className="capitalize">{selectedPaciente.motivo_consulta.replace("-", " ")}</p>
              </div>

              {selectedPaciente.notas && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notas</Label>
                  <p className="text-sm bg-background/50 p-3 rounded-lg border">{selectedPaciente.notas}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Paciente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
            <DialogDescription>Actualizar información del paciente</DialogDescription>
          </DialogHeader>

          {selectedPaciente && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input id="nombre" defaultValue={selectedPaciente.nombre_completo} className="bg-background/50" />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select defaultValue={selectedPaciente.estado}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuevo">Nuevo</SelectItem>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="en-tratamiento">En Tratamiento</SelectItem>
                      <SelectItem value="recuperacion">Recuperación</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" defaultValue={selectedPaciente.telefono} className="bg-background/50" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={selectedPaciente.email} className="bg-background/50" />
                </div>
              </div>

              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" defaultValue={selectedPaciente.direccion} className="bg-background/50" />
              </div>

              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea id="notas" defaultValue={selectedPaciente.notas} className="bg-background/50" rows={3} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="bg-medical-teal hover:bg-medical-teal/90">Guardar Cambios</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
